# Barbearia Template

Template comercial reutilizável para barbearias, construído com HTML5, CSS3, JavaScript puro, Vercel e PostgreSQL/Neon.

## Objetivo

Servir como base profissional para novos clientes sem reconstruir o projeto do zero. A identidade visual, conteúdo, serviços, horários, contatos e regras de agendamento ficam centralizados e podem ser personalizados por cliente.

## Estrutura

- `index.html` — estrutura semântica, SEO, compartilhamento social, formulário e acessibilidade.
- `estilos/style.css` — identidade visual, componentes, responsividade e estados de interação.
- `javascript/configuracao.js` — dados do cliente, contatos, SEO, serviços, horários, galeria e regras do agendamento.
- `javascript/script.js` — comportamento, renderização, menu, disponibilidade real e envio do agendamento.
- `api/agendamentos.js` — API de disponibilidade e criação de agendamentos.
- `database/schema.sql` — estrutura reutilizável do PostgreSQL.
- `database/seed.sql` — dados iniciais de exemplo.
- `recursos/identidade/` — logo, favicon e arte de compartilhamento.
- `recursos/imagens/` — imagens da galeria.

## Personalização rápida

Para entregar o template a um novo cliente, comece por `javascript/configuracao.js`.

Ali ficam centralizados:

- nome da empresa;
- logo e favicon;
- slogan e descrição;
- título e descrição SEO;
- URL canônica;
- imagem de compartilhamento;
- WhatsApp e telefone;
- Instagram;
- endereço e busca do mapa;
- serviços, preços e duração;
- horários de funcionamento;
- imagens da galeria;
- regras do agendamento.

Antes da publicação, substitua todos os dados de exemplo.

## Agendamento real

O formulário usa o backend em `/api/agendamentos` e o PostgreSQL/Neon para consultar e registrar reservas. Para o agendamento, o PostgreSQL é a fonte de verdade dos serviços, preços, durações, horários e regras operacionais; os dados em `javascript/configuracao.js` servem para apresentação e fallback do template.

O fluxo atual:

1. o cliente escolhe um ou mais serviços;
2. o frontend consulta a disponibilidade real da data;
3. horários já ocupados são removidos da lista;
4. duração dos serviços e intervalo entre atendimentos são considerados;
5. o backend valida novamente data, dia de funcionamento, horário, intervalo e duração;
6. o banco impede conflitos simultâneos entre agendamentos pendentes ou confirmados;
7. cliente, agendamento e snapshots dos serviços são gravados de forma atômica;
8. o cliente é reutilizado pelo telefone normalizado, evitando duplicação;
9. uma tentativa concorrente recebe resposta de conflito e a disponibilidade é atualizada.

### Regras

Em `CONFIG.agendamento`:

- `intervaloMinutos` — intervalo dos horários exibidos;
- `intervaloEntreAtendimentosMinutos` — tempo reservado entre atendimentos;
- `bloquearDatasAnteriores` — impede datas anteriores;
- `permitirAgendamentoHoje` — controla reservas para o dia atual.

No backend, `BARBEARIA_TIMEZONE` pode ser configurada para o fuso comercial do cliente. O padrão é `America/Sao_Paulo`.

### Banco

Execute primeiro:

```text
database/schema.sql
```

Depois:

```text
database/seed.sql
```

Cada cliente deve ter seu próprio banco PostgreSQL/Neon ou uma estratégia de isolamento definida antes da publicação.

## SEO

Ajuste:

- `seo.titulo`;
- `seo.descricao`;
- `seo.url` para a URL real;
- `seo.imagem` para a arte social definitiva.

O template também gera JSON-LD com o tipo `BarberShop`.

Para produção, prefira uma imagem social JPG/PNG/WebP de pelo menos 1200×630 px quando a identidade do cliente usar imagem raster.

## Imagens

Coloque as fotos do cliente em `recursos/imagens/` e altere os caminhos em `CONFIG.galeria`.

Para projetos maiores:

```text
recursos/
├── identidade/
│   ├── logo.svg
│   ├── favicon.svg
│   └── compartilhamento.svg
└── imagens/
    ├── ambiente/
    ├── servicos/
    └── galeria/
```

## Acessibilidade

O template inclui:

- link para pular ao conteúdo;
- navegação semântica;
- rótulos de formulário;
- estados de foco visíveis;
- menu mobile com `aria-expanded`;
- fechamento do menu com ESC;
- controle básico de foco no menu mobile;
- suporte a `prefers-reduced-motion`;
- textos alternativos para imagens.

## Publicação

O projeto pode ser publicado na Vercel.

Antes da publicação:

1. configure `BARBEARIA_DATABASE_URL` ou a variável integrada equivalente;
2. configure `BARBEARIA_TIMEZONE` quando o cliente usar outro fuso;
3. confirme que o banco recebeu `schema.sql` e `seed.sql`;
4. troque todos os dados de exemplo;
5. revise os serviços, preços e horários no banco e alinhe a apresentação em `javascript/configuracao.js`;
6. teste desktop, tablet e celular;
7. teste disponibilidade, conflito, buffer, dia fechado e horário fora do funcionamento;
8. confira o console do navegador;
9. valide SEO e dados estruturados;
10. remova dados de demonstração antes da entrega.

## Reutilização para novos clientes

O código pode ser clonado para um novo projeto.

Para cada cliente:

1. crie um novo repositório;
2. crie um novo banco PostgreSQL/Neon;
3. execute `database/schema.sql`;
4. execute `database/seed.sql`;
5. configure as variáveis de ambiente;
6. personalize `javascript/configuracao.js`;
7. substitua imagens e identidade;
8. teste o agendamento ponta a ponta;
9. publique na Vercel.

Não reutilize a mesma base de produção entre clientes sem uma estratégia explícita de isolamento de dados.

## Dependências

O projeto usa `@neondatabase/serverless` para acesso ao PostgreSQL. O `package-lock.json` deve ser mantido junto ao `package.json` para instalação reprodutível.

## Licença

Defina aqui a licença comercial que você pretende usar para distribuir este template.
