# Barbearia Template

Template comercial reutilizável para barbearias, construído com HTML5, CSS3 e JavaScript puro, sem framework e sem dependência de backend.

## Objetivo

Servir como uma base profissional para novos clientes. A estrutura, identidade visual, conteúdo e dados podem ser adaptados sem reconstruir a página do zero.

## Estrutura

- `index.html` — estrutura semântica da página, SEO básico e acessibilidade.
- `css/style.css` — identidade visual, componentes, responsividade e estados de interação.
- `js/script.js` — configuração central, renderização de serviços/horários/galeria e interações.
- `assets/` — espaço reservado para imagens, logos e outros arquivos estáticos.

## Personalização rápida

Edite o objeto `CONFIG` no início de `js/script.js`.

Ali ficam centralizados:

- nome da empresa;
- slogan e descrição;
- WhatsApp e telefone;
- Instagram;
- endereço e busca do mapa;
- serviços, preços e duração;
- horários de funcionamento;
- imagens da galeria.

Para adicionar uma foto à galeria, coloque o arquivo em `assets/` e informe o caminho em `CONFIG.galeria`, por exemplo:

`imagem: "assets/ambiente.webp"`

As cores principais ficam nas variáveis no início de `css/style.css`.

## Agendamento

O formulário de agendamento é **demonstrativo**. Ele respeita os dias fechados e gera horários com base no funcionamento configurado, mas não consulta banco de dados nem garante disponibilidade real.

Para transformar o fluxo em produto real, a próxima camada deve incluir backend, banco de dados, controle de conflitos, autenticação administrativa e regras de disponibilidade.

## Publicação

O projeto pode ser publicado como site estático em GitHub Pages, Vercel ou outro serviço compatível com arquivos estáticos.

## Checklist antes de entregar a um cliente

1. trocar nome, textos e identidade;
2. substituir as imagens da galeria;
3. configurar WhatsApp, Instagram e endereço;
4. revisar serviços, preços e horários;
5. testar desktop, tablet e celular;
6. testar menu, links, mapa e formulário;
7. substituir o fluxo demonstrativo por backend quando houver agendamento real;
8. remover qualquer dado de exemplo antes da publicação.

## Próximas evoluções possíveis

- backend e banco;
- painel administrativo;
- agendamento com disponibilidade real;
- gerenciamento de clientes e serviços;
- domínio próprio;
- métricas e SEO avançado.

## Licença

Defina aqui a licença comercial que você pretende usar para distribuir este template.