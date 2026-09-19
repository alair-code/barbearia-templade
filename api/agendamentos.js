import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.BARBEARIA_DATABASE_URL || process.env.DATABASE_URL);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  });
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 20);
}

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && value >= new Date().toISOString().slice(0, 10);
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get("data");
    if (!isValidDate(date)) return json({ error: "Data inválida." }, 400);

    const [hours, blocked] = await Promise.all([
      sql\`SELECT dia_semana, aberto, abertura, fechamento FROM horarios_funcionamento ORDER BY dia_semana\`,
      sql\`SELECT hora_inicio, hora_fim FROM agendamentos WHERE data_atendimento = \${date} AND status IN ('pendente','confirmado') ORDER BY hora_inicio\`
    ]);

    return json({ date, hours, blocked });
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

    if (nome.length < 2 || telefone.length < 10 || !isValidDate(data) ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(hora) || !nomesServicos.length) {
      return json({ error: "Informe nome, WhatsApp, data, horário e pelo menos um serviço válido." }, 400);
    }

    const services = await sql\`
      SELECT id, nome, preco, duracao_minutos
      FROM servicos
      WHERE ativo = true AND nome = ANY(\${nomesServicos})
    \`;

    if (services.length !== nomesServicos.length) {
      return json({ error: "Um ou mais serviços selecionados não estão disponíveis." }, 400);
    }

    const duration = services.reduce((sum, item) => sum + Number(item.duracao_minutos), 0);
    const total = services.reduce((sum, item) => sum + Number(item.preco), 0);

    const configRows = await sql\`
      SELECT intervalo_entre_atendimentos_minutos
      FROM configuracoes
      WHERE id = 1
      LIMIT 1
    \`;

    const buffer = Number(configRows[0]?.intervalo_entre_atendimentos_minutos || 0);
    const [hours, minutes] = hora.split(":").map(Number);
    const endMinutes = hours * 60 + minutes + duration + buffer;

    if (endMinutes > 24 * 60) {
      return json({ error: "O horário escolhido não comporta os serviços selecionados." }, 400);
    }

    const clienteRows = await sql\`
      INSERT INTO clientes (nome, telefone)
      VALUES (\${nome}, \${telefone})
      RETURNING id, nome, telefone
    \`;

    const cliente = clienteRows[0];
    const horaFim =
      String(Math.floor(endMinutes / 60)).padStart(2, "0") +
      ":" +
      String(endMinutes % 60).padStart(2, "0") +
      ":00";

    const bookingRows = await sql\`
      INSERT INTO agendamentos (
        cliente_id, data_atendimento, hora_inicio, hora_fim,
        status, valor_total, duracao_total_minutos
      )
      VALUES (
        \${cliente.id}, \${data}, \${hora + ":00"}, \${horaFim},
        'pendente', \${total}, \${duration}
      )
      RETURNING id, data_atendimento, hora_inicio, valor_total, duracao_total_minutos
    \`;

    const booking = bookingRows[0];

    for (let index = 0; index < services.length; index += 1) {
      const service = services[index];
      await sql\`
        INSERT INTO agendamento_servicos (
          agendamento_id, servico_id, nome_servico_snapshot,
          preco_snapshot, duracao_minutos_snapshot, ordem
        )
        VALUES (
          \${booking.id}, \${service.id}, \${service.nome},
          \${service.preco}, \${service.duracao_minutos}, \${index + 1}
        )
      \`;
    }

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
    console.error(error);
    return json({ error: "Não foi possível concluir o agendamento." }, 500);
  }
}
