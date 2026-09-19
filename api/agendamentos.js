import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.BARBEARIA_DATABASE_URL || process.env.DATABASE_URL;
const sql = neon(databaseUrl);
const BUSINESS_TIME_ZONE = process.env.BARBEARIA_TIMEZONE || "America/Sao_Paulo";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  });
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 20);
}

function getTodayInBusinessTimeZone() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.toISOString().slice(0, 10) === value && value >= getTodayInBusinessTimeZone();
}

function parseTime(value) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(String(value || ""));
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function formatTime(totalMinutes) {
  return String(Math.floor(totalMinutes / 60)).padStart(2, "0") + ":" +
    String(totalMinutes % 60).padStart(2, "0") + ":00";
}

function getDayOfWeek(dateValue) {
  return new Date(`${dateValue}T12:00:00Z`).getUTCDay();
}

async function getBusinessHours(dateValue) {
  const rows = await sql`
    SELECT dia_semana, aberto, abertura, fechamento
    FROM horarios_funcionamento
    WHERE dia_semana = ${getDayOfWeek(dateValue)}
    LIMIT 1
  `;
  return rows[0] || null;
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get("data");
    if (!isValidDate(date)) return json({ error: "Data inválida." }, 400);

    const [hours, blocked, configRows] = await Promise.all([
      sql`SELECT dia_semana, aberto, abertura, fechamento FROM horarios_funcionamento ORDER BY dia_semana`,
      sql`
        SELECT hora_inicio, hora_fim
        FROM agendamentos
        WHERE data_atendimento = ${date}
          AND status IN ('pendente', 'confirmado')
        ORDER BY hora_inicio
      `,
      sql`
        SELECT intervalo_agendamento_minutos, intervalo_entre_atendimentos_minutos
        FROM configuracoes
        WHERE id = 1
        LIMIT 1
      `
    ]);

    return json({
      date,
      timezone: BUSINESS_TIME_ZONE,
      hours,
      blocked,
      config: {
        intervaloAgendamentoMinutos: Number(configRows[0]?.intervalo_agendamento_minutos || 15),
        intervaloEntreAtendimentosMinutos: Number(configRows[0]?.intervalo_entre_atendimentos_minutos || 0)
      }
    });
  } catch (error) {
    console.error(error);
    return json({ error: "Não foi possível consultar a disponibilidade." }, 500);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const nome = String(body.nome || "").trim();
    const telefone = normalizePhone(body.telefone);
    const data = String(body.data || "");
    const hora = String(body.hora || "");
    const nomesServicos = Array.isArray(body.servicos)
      ? body.servicos.map(String).map(s => s.trim()).filter(Boolean)
      : [];

    if (nome.length < 2 || nome.length > 120 || telefone.length < 10 || !isValidDate(data) ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(hora) || !nomesServicos.length || nomesServicos.length > 20) {
      return json({ error: "Informe nome, WhatsApp, data, horário e pelo menos um serviço válido." }, 400);
    }

    const services = await sql`
      SELECT id, nome, preco, duracao_minutos
      FROM servicos
      WHERE ativo = true AND nome = ANY(${nomesServicos})
      ORDER BY array_position(${nomesServicos}, nome)
    `;

    if (services.length !== nomesServicos.length || new Set(nomesServicos).size !== nomesServicos.length) {
      return json({ error: "Um ou mais serviços selecionados não estão disponíveis." }, 400);
    }

    const duration = services.reduce((sum, item) => sum + Number(item.duracao_minutos), 0);
    const total = services.reduce((sum, item) => sum + Number(item.preco), 0);

    const configRows = await sql`
      SELECT intervalo_agendamento_minutos, intervalo_entre_atendimentos_minutos
      FROM configuracoes
      WHERE id = 1
      LIMIT 1
    `;

    const interval = Number(configRows[0]?.intervalo_agendamento_minutos || 15);
    const buffer = Number(configRows[0]?.intervalo_entre_atendimentos_minutos || 0);
    const startMinutes = parseTime(hora);
    const businessHours = await getBusinessHours(data);
    const openingMinutes = parseTime(businessHours?.abertura);
    const closingMinutes = parseTime(businessHours?.fechamento);

    if (!businessHours?.aberto || openingMinutes === null || closingMinutes === null) {
      return json({ error: "A barbearia não funciona nesta data." }, 400);
    }

    if (startMinutes === null || startMinutes < openingMinutes || startMinutes >= closingMinutes) {
      return json({ error: "O horário escolhido está fora do funcionamento." }, 400);
    }

    if (startMinutes % interval !== openingMinutes % interval) {
      return json({ error: "O horário escolhido não segue o intervalo de agendamento configurado." }, 400);
    }

    const endMinutes = startMinutes + duration + buffer;
    if (endMinutes > closingMinutes) {
      return json({ error: "O horário escolhido não comporta os serviços selecionados e o intervalo entre atendimentos." }, 400);
    }

    const horaInicio = formatTime(startMinutes);
    const horaFim = formatTime(endMinutes);

    const bookingRows = await sql`
      WITH cliente AS (
        INSERT INTO clientes (nome, telefone, ativo)
        VALUES (${nome}, ${telefone}, true)
        ON CONFLICT (telefone) DO UPDATE SET
          nome = EXCLUDED.nome,
          ativo = true,
          updated_at = now()
        RETURNING id
      ),
      novo_agendamento AS (
        INSERT INTO agendamentos (
          cliente_id, data_atendimento, hora_inicio, hora_fim,
          status, valor_total, duracao_total_minutos
        )
        SELECT id, ${data}, ${horaInicio}, ${horaFim},
          'pendente', ${total}, ${duration}
        FROM cliente
        RETURNING id, data_atendimento, hora_inicio, valor_total, duracao_total_minutos
      ),
      snapshots AS (
        INSERT INTO agendamento_servicos (
          agendamento_id, servico_id, nome_servico_snapshot,
          preco_snapshot, duracao_minutos_snapshot, ordem
        )
        SELECT a.id, s.id, s.nome, s.preco, s.duracao_minutos,
          ROW_NUMBER() OVER (ORDER BY array_position(${nomesServicos}, s.nome))::smallint
        FROM novo_agendamento a
        CROSS JOIN (
          SELECT id, nome, preco, duracao_minutos
          FROM servicos
          WHERE ativo = true AND nome = ANY(${nomesServicos})
        ) s
        RETURNING agendamento_id
      )
      SELECT a.id, a.data_atendimento, a.hora_inicio, a.valor_total, a.duracao_total_minutos
      FROM novo_agendamento a
      JOIN (SELECT DISTINCT agendamento_id FROM snapshots) s ON s.agendamento_id = a.id
    `;

    const booking = bookingRows[0];
    if (!booking) return json({ error: "Não foi possível salvar o agendamento." }, 500);

    return json({
      message: "Agendamento solicitado com sucesso.",
      booking: {
        id: booking.id,
        data: booking.data_atendimento,
        hora: String(booking.hora_inicio).slice(0, 5),
        valorTotal: Number(booking.valor_total),
        duracaoMinutos: Number(booking.duracao_total_minutos)
      }
    }, 201);
  } catch (error) {
    if (error?.code === "23P01") {
      return json({ error: "Esse horário acabou de ser reservado. Escolha outro horário." }, 409);
    }
    if (error?.code === "23505") {
      return json({ error: "Não foi possível reservar esse horário. Tente outro." }, 409);
    }
    console.error(error);
    return json({ error: "Não foi possível concluir o agendamento." }, 500);
  }
}
