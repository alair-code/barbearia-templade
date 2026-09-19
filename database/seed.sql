-- Dados iniciais do template.
-- Execute depois do schema.sql.
-- Estes são dados de demonstração e devem ser personalizados por cliente.

INSERT INTO configuracoes (
  id, nome_barbearia, slogan, whatsapp, telefone, instagram,
  instagram_url, endereco, map_query,
  intervalo_agendamento_minutos,
  intervalo_entre_atendimentos_minutos
)
VALUES (
  1,
  'Barbearia Template',
  'Seu estilo começa aqui.',
  '5500000000000',
  '(00) 00000-0000',
  '@barbearia',
  'https://instagram.com/',
  'Rua Exemplo, 123 — Centro',
  'Rua Exemplo, 123 Centro',
  15,
  15
)
ON CONFLICT (id) DO UPDATE SET
  nome_barbearia = EXCLUDED.nome_barbearia,
  slogan = EXCLUDED.slogan,
  whatsapp = EXCLUDED.whatsapp,
  telefone = EXCLUDED.telefone,
  instagram = EXCLUDED.instagram,
  instagram_url = EXCLUDED.instagram_url,
  endereco = EXCLUDED.endereco,
  map_query = EXCLUDED.map_query,
  intervalo_agendamento_minutos = EXCLUDED.intervalo_agendamento_minutos,
  intervalo_entre_atendimentos_minutos = EXCLUDED.intervalo_entre_atendimentos_minutos,
  updated_at = now();

INSERT INTO servicos (nome, descricao, preco, duracao_minutos, ativo)
VALUES
  ('Corte', 'Corte personalizado com acabamento preciso.', 40, 45, true),
  ('Barba', 'Barba desenhada com cuidado e acabamento.', 30, 30, true),
  ('Acabamento', 'Detalhes e finalização para manter o corte.', 20, 20, true),
  ('Sobrancelha', 'Acabamento discreto e alinhado.', 15, 15, true),
  ('Combo Premium', 'Serviço completo para uma experiência especial.', 80, 90, true)
ON CONFLICT (nome) DO UPDATE SET
  descricao = EXCLUDED.descricao,
  preco = EXCLUDED.preco,
  duracao_minutos = EXCLUDED.duracao_minutos,
  ativo = EXCLUDED.ativo,
  updated_at = now();

INSERT INTO horarios_funcionamento (dia_semana, aberto, abertura, fechamento)
VALUES
  (0, false, NULL, NULL),
  (1, true, '09:00', '19:00'),
  (2, true, '09:00', '19:00'),
  (3, true, '09:00', '19:00'),
  (4, true, '09:00', '19:00'),
  (5, true, '09:00', '19:00'),
  (6, true, '09:00', '19:00')
ON CONFLICT (dia_semana) DO UPDATE SET
  aberto = EXCLUDED.aberto,
  abertura = EXCLUDED.abertura,
  fechamento = EXCLUDED.fechamento;
