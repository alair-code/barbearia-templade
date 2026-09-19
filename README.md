# Barbearia Template

Template comercial reutilizável para barbearias, construído com HTML5, CSS3 e JavaScript puro, sem framework e sem backend.

## Objetivo

Servir como uma base profissional para novos clientes. A estrutura, identidade visual, conteúdo e dados podem ser adaptados sem reconstruir a página do zero.

## Estrutura

- `index.html` — estrutura semântica, SEO, compartilhamento social e acessibilidade.
- `estilos/style.css` — identidade visual, componentes, responsividade e estados de interação.
- `javascript/configuracao.js` — dados do cliente, contatos, SEO, serviços, horários e galeria.
- `javascript/script.js` — comportamento, renderização, menu, agendamento demonstrativo e dados estruturados.
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
- regras básicas do agendamento demonstrativo.

### SEO

Antes da publicação, ajuste:

- `seo.titulo`;
- `seo.descricao`;
- `seo.url` para a URL real;
- `seo.imagem` para a arte social definitiva.

O template também gera JSON-LD com o tipo `BarberShop` no navegador.

> Para produção, prefira uma imagem social JPG/PNG/WebP de pelo menos 1200×630 px se o cliente tiver uma identidade visual raster. A arte SVG incluída serve como placeholder editável.

## Imagens

Coloque as fotos do cliente em `recursos/imagens/` e altere os caminhos em `CONFIG.galeria`.

Para projetos maiores, pode organizar por cliente ou finalidade, por exemplo:

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

## Agendamento

O formulário é **demonstrativo**. Ele bloqueia datas anteriores, respeita dias fechados, horário de funcionamento, duração do serviço e os intervalos configurados. Ele não consulta banco de dados e, portanto, não garante disponibilidade real entre diferentes usuários.

As regras ficam centralizadas em `CONFIG.agendamento`:

- `intervaloMinutos` — intervalo entre os horários exibidos no seletor;
- `intervaloEntreAtendimentosMinutos` — margem planejada entre atendimentos para a futura camada de disponibilidade real;
- `bloquearDatasAnteriores` — impede datas anteriores ao dia atual;
- `permitirAgendamentoHoje` — permite ou não o agendamento no dia atual.

Para transformar o fluxo em produto real, a próxima camada deve incluir backend, banco de dados, controle de conflitos, autenticação administrativa e regras reais de disponibilidade.

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
- textos alternativos para imagens da galeria.

## Publicação

O projeto pode ser publicado como site estático em GitHub Pages, Vercel ou outro serviço compatível com arquivos estáticos.

## Checklist antes de entregar a um cliente

1. trocar nome, textos e identidade;
2. substituir logo e favicon;
3. substituir as imagens da galeria;
4. configurar WhatsApp, Instagram e endereço;
5. configurar título, descrição, URL canônica e imagem social;
6. revisar serviços, preços e horários;
7. testar desktop, tablet e celular;
8. testar menu, links, mapa, imagens e formulário;
9. testar datas anteriores, dias fechados, horários fora do funcionamento e duração dos serviços;
10. validar SEO e dados estruturados;
11. verificar o console do navegador antes da publicação;
12. substituir o fluxo demonstrativo por backend quando houver agendamento real;
13. remover todos os dados de exemplo antes da publicação.

## Próximas evoluções possíveis

- backend e banco;
- painel administrativo;
- agendamento com disponibilidade real;
- gerenciamento de clientes e serviços;
- domínio próprio;
- métricas e SEO avançado;
- integração de pagamentos, quando necessária.

## Licença

Defina aqui a licença comercial que você pretende usar para distribuir este template.
