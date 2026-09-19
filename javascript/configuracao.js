/* ============================================================================
   CONFIGURAÇÃO DO CLIENTE
   ============================================================================
   Este é o principal arquivo para personalizar o template para uma nova
   barbearia. O restante do JavaScript consome os dados definidos aqui.
*/
const CONFIG = {
  nome: "Barbearia Template",
  logo: "recursos/identidade/logo.svg",
  logoAlt: "Logo da Barbearia Template",
  favicon: "recursos/identidade/favicon.svg",

  slogan: "Seu estilo começa aqui.",
  descricao: "Um espaço pensado para quem valoriza um bom corte, atendimento de qualidade e personalidade em cada detalhe.",

  seo: {
    titulo: "Barbearia Template | Estilo, precisão e experiência",
    descricao: "Template profissional e reutilizável para barbearias, com serviços, galeria, horários, localização e agendamento demonstrativo.",
    url: "https://alair-code.github.io/barbearia-templade/",
    imagem: "recursos/identidade/compartilhamento.svg"
  },

  whatsapp: "5500000000000",
  telefone: "(00) 00000-0000",
  instagram: "@barbearia",
  instagramUrl: "https://instagram.com/",
  endereco: "Rua Exemplo, 123 — Centro",
  mapQuery: "Rua Exemplo, 123 Centro",

  // Regras centrais do agendamento. O backend deverá usar as mesmas regras
  // quando a disponibilidade real for integrada.
  agendamento: {
    intervaloMinutos: 15,
    intervaloEntreAtendimentosMinutos: 15,
    bloquearDatasAnteriores: true,
    permitirAgendamentoHoje: true
  },

  servicos: [
    { nome: "Corte", descricao: "Corte personalizado com acabamento preciso.", preco: "R$ 40", duracao: "45 min" },
    { nome: "Barba", descricao: "Barba desenhada com cuidado e acabamento.", preco: "R$ 30", duracao: "30 min" },
    { nome: "Corte + Barba", descricao: "Experiência completa para renovar o visual.", preco: "R$ 65", duracao: "75 min" },
    { nome: "Acabamento", descricao: "Detalhes e finalização para manter o corte.", preco: "R$ 20", duracao: "20 min" },
    { nome: "Sobrancelha", descricao: "Acabamento discreto e alinhado.", preco: "R$ 15", duracao: "15 min" },
    { nome: "Combo Premium", descricao: "Serviço completo para uma experiência especial.", preco: "R$ 80", duracao: "90 min" }
  ],

  horarios: [
    ["Segunda", "Fechado"],
    ["Terça", "09:00 – 19:00"],
    ["Quarta", "09:00 – 19:00"],
    ["Quinta", "09:00 – 20:00"],
    ["Sexta", "09:00 – 20:00"],
    ["Sábado", "08:00 – 18:00"],
    ["Domingo", "Fechado"]
  ],

  galeria: [
    { label: "Ambiente", imagem: "recursos/imagens/ambiente.svg" },
    { label: "Cortes", imagem: "recursos/imagens/cortes.svg" },
    { label: "Detalhes", imagem: "recursos/imagens/detalhes.svg" },
    { label: "Experiência", imagem: "recursos/imagens/experiencia.svg" }
  ]
};
