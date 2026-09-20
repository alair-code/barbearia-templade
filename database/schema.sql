-- Schema do banco de dados do template de barbearia.
-- Execute em um banco PostgreSQL/Neon novo.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  telefone text NOT NULL,
  email text,
  observacoes text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_clientes_telefone_unique
  ON clientes (telefone)
  WHERE telefone IS NOT NULL;

CREATE TABLE IF NOT EXISTS servicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  descricao text,
  preco numeric(10,2) NOT NULL DEFAULT 0 CHECK (preco >= 0),
  duracao_minutos integer NOT NULL CHECK (duracao_minutos > 0),
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS horarios_funcionamento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dia_semana smallint NOT NULL UNIQUE CHECK (dia_semana BETWEEN 0 AND 6),
  aberto boolean NOT NULL DEFAULT true,
  abertura time,
  fechamento time,
  CONSTRAINT horarios_funcionamento_check CHECK (
    (aberto = false AND abertura IS NULL AND fechamento IS NULL)
    OR
    (aberto = true AND abertura IS NOT NULL AND fechamento IS NOT NULL AND abertura < fechamento)
  )
);

CREATE TABLE IF NOT EXISTS configuracoes (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  nome_barbearia text NOT NULL,
  slogan text,
  whatsapp text,
  telefone text,
  instagram text,
  instagram_url text,
  endereco text,
  map_query text,
  intervalo_agendamento_minutos integer NOT NULL DEFAULT 15 CHECK (intervalo_agendamento_minutos > 0),
  intervalo_entre_atendimentos_minutos integer NOT NULL DEFAULT 15 CHECK (intervalo_entre_atendimentos_minutos >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agendamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES clientes(id),
  data_atendimento date NOT NULL,
  hora_inicio time NOT NULL,
  hora_fim time NOT NULL,
  status text NOT NULL DEFAULT 'pendente'
    CHECK (status IN ('pendente', 'confirmado', 'cancelado', 'concluido', 'faltou')),
  valor_total numeric(10,2) NOT NULL DEFAULT 0 CHECK (valor_total >= 0),
  duracao_total_minutos integer NOT NULL CHECK (duracao_total_minutos > 0),
  observacoes text,
  periodo tsrange GENERATED ALWAYS AS (
    tsrange(data_atendimento + hora_inicio, data_atendimento + hora_fim, '[)')
  ) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT agendamentos_check CHECK (hora_inicio < hora_fim),
  CONSTRAINT agendamentos_sem_conflito
    EXCLUDE USING gist (periodo WITH &&)
    WHERE (status IN ('pendente', 'confirmado'))
);

CREATE TABLE IF NOT EXISTS agendamento_servicos (
  agendamento_id uuid NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
  servico_id uuid NOT NULL REFERENCES servicos(id),
  nome_servico_snapshot text NOT NULL,
  preco_snapshot numeric(10,2) NOT NULL CHECK (preco_snapshot >= 0),
  duracao_minutos_snapshot integer NOT NULL CHECK (duracao_minutos_snapshot > 0),
  ordem smallint NOT NULL DEFAULT 1 CHECK (ordem > 0),
  PRIMARY KEY (agendamento_id, servico_id)
);

CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente
  ON agendamentos (cliente_id);

CREATE INDEX IF NOT EXISTS idx_agendamentos_data
  ON agendamentos (data_atendimento);

CREATE INDEX IF NOT EXISTS idx_agendamentos_status
  ON agendamentos (status);

CREATE INDEX IF NOT EXISTS idx_agendamento_servicos_servico
  ON agendamento_servicos (servico_id);
