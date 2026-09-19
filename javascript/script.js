/* ============================================================================
   LÓGICA PRINCIPAL DO TEMPLATE
   ============================================================================
   A personalização fica em javascript/configuracao.js.
   Este arquivo cuida somente do comportamento e da renderização.
*/

// Atalhos para selecionar um elemento ou vários elementos no DOM.
const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

// Atualiza metadados, identidade, textos e links a partir da configuração.
function applyConfig() {
  document.title = CONFIG.seo?.titulo || CONFIG.nome;

  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon) favicon.href = CONFIG.favicon;

  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = CONFIG.seo?.descricao || CONFIG.descricao;

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.content = CONFIG.seo?.titulo || CONFIG.nome;

  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) ogDescription.content = CONFIG.seo?.descricao || CONFIG.descricao;

  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl && CONFIG.seo?.url) ogUrl.content = CONFIG.seo.url;

  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  if (twitterTitle) twitterTitle.content = CONFIG.seo?.titulo || CONFIG.nome;

  const twitterDescription = document.querySelector('meta[name="twitter:description"]');
  if (twitterDescription) twitterDescription.content = CONFIG.seo?.descricao || CONFIG.descricao;

  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage) ogImage.content = toAbsoluteUrl(CONFIG.seo?.imagem || CONFIG.logo);

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical && CONFIG.seo?.url) canonical.href = CONFIG.seo.url;

  const twitterImage = document.querySelector('meta[name="twitter:image"]');
  if (twitterImage) twitterImage.content = toAbsoluteUrl(CONFIG.seo?.imagem || CONFIG.logo);

  $$("[data-config]").forEach(element => {
    const key = element.dataset.config;
    if (CONFIG[key] !== undefined) element.textContent = CONFIG[key];
  });

  $$("[data-logo]").forEach(element => {
    element.src = CONFIG.logo;
    element.alt = CONFIG.logoAlt;
  });

  $$("[data-config-link='instagram']").forEach(element => {
    element.href = CONFIG.instagramUrl;
  });

  $$(".whatsapp-link").forEach(element => {
    const message = "Olá! Gostaria de agendar um horário.";
    element.href = "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(message);
  });

  const mapLink = $(".map-link");
  if (mapLink) {
    mapLink.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(CONFIG.mapQuery);
  }

  const year = $("#current-year");
  if (year) year.textContent = new Date().getFullYear();

  renderStructuredData();
}

// Converte caminhos locais de recursos em URLs absolutas quando houver URL do site.
function toAbsoluteUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (!CONFIG.seo?.url) return path;

  return new URL(path, CONFIG.seo.url).href;
}

// Insere dados estruturados para ajudar mecanismos de busca a entenderem o negócio.
function renderStructuredData() {
  let schema = document.getElementById("business-schema");

  if (!schema) {
    schema = document.createElement("script");
    schema.id = "business-schema";
    schema.type = "application/ld+json";
    document.head.appendChild(schema);
  }

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BarberShop",
    name: CONFIG.nome,
    description: CONFIG.seo?.descricao || CONFIG.descricao,
    url: CONFIG.seo?.url || "",
    image: toAbsoluteUrl(CONFIG.seo?.imagem || CONFIG.logo),
    telephone: CONFIG.telefone,
    address: {
      "@type": "PostalAddress",
      streetAddress: CONFIG.endereco
    },
    sameAs: CONFIG.instagramUrl ? [CONFIG.instagramUrl] : []
  };

  schema.textContent = JSON.stringify(schemaData);
}

// Renderiza os serviços e as opções do formulário de agendamento.
function renderServices() {
  const list = $("#services-list");
  const select = $("#booking-service");

  if (!list || !select) return;

  list.innerHTML = "";
  select.innerHTML = '<option value="">Selecione um serviço</option>';

  CONFIG.servicos.forEach((service, index) => {
    const card = document.createElement("article");
    card.className = "service-card";

    const title = document.createElement("h3");
    title.textContent = service.nome;

    const description = document.createElement("p");
    description.textContent = service.descricao;

    const meta = document.createElement("div");
    meta.className = "service-meta";

    const price = document.createElement("span");
    price.className = "price";
    price.textContent = service.preco;

    const duration = document.createElement("span");
    duration.className = "duration";
    duration.textContent = service.duracao;

    meta.append(price, duration);
    card.append(title, description, meta);
    list.appendChild(card);

    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = service.nome + " — " + service.preco;
    select.appendChild(option);
  });
}

// Renderiza os horários configurados na seção de funcionamento.
function renderHours() {
  const list = $("#hours-list");
  if (!list) return;

  list.innerHTML = "";

  CONFIG.horarios.forEach(([day, time]) => {
    const row = document.createElement("div");
    row.className = "hours-row";

    const dayElement = document.createElement("span");
    dayElement.textContent = day;

    const timeElement = document.createElement("span");
    timeElement.textContent = time;

    row.append(dayElement, timeElement);
    list.appendChild(row);
  });
}

// Renderiza a galeria e remove imagens que não puderem ser carregadas.
function renderGallery() {
  const list = $("#gallery-list");
  if (!list) return;

  list.innerHTML = "";

  CONFIG.galeria.forEach((item, index) => {
    const figure = document.createElement("figure");
    figure.className = "gallery-item";

    const label = document.createElement("span");
    label.textContent = String(index + 1).padStart(2, "0") + " • " + item.label;

    if (item.imagem) {
      figure.classList.add("has-image");

      const image = document.createElement("img");
      image.src = item.imagem;
      image.alt = item.label;
      image.loading = "lazy";
      image.decoding = "async";

      image.addEventListener("error", () => {
        image.remove();
        figure.classList.remove("has-image");
      });

      figure.appendChild(image);
    }

    figure.appendChild(label);
    list.appendChild(figure);
  });
}

// Controla o menu mobile e mantém o estado acessível para teclado e leitores de tela.
function setupMenu() {
  const button = $(".menu-toggle");
  const nav = $("#main-menu");

  if (!button || !nav) return;

  const closeMenu = (restoreFocus = false) => {
    nav.classList.remove("open");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", "Abrir menu");
    document.body.classList.remove("menu-open");
    if (restoreFocus) button.focus();
  };

  button.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.body.classList.toggle("menu-open", open);

    if (open) {
      const firstLink = nav.querySelector("a");
      if (firstLink) firstLink.focus();
    }
  });

  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => closeMenu(false));
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && nav.classList.contains("open")) closeMenu(true);

    if (event.key === "Tab" && nav.classList.contains("open")) {
      const focusable = nav.querySelectorAll("a");
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        button.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        button.focus();
      }
    }
  });

  document.addEventListener("click", event => {
    if (nav.classList.contains("open") && !nav.contains(event.target) && !button.contains(event.target)) {
      closeMenu(true);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 700) closeMenu(false);
  });
}

// Retorna a data local atual no formato YYYY-MM-DD.
function getLocalDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return now.getFullYear() + "-" + month + "-" + day;
}

// Converte YYYY-MM-DD para o índice do dia da semana.
function getDayIndex(dateValue) {
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Date(year, month - 1, day).getDay();
}

// Converte um intervalo como "09:00 – 19:00" em minutos.
function parseOpeningHours(value) {
  if (!value || value.toLowerCase() === "fechado") return null;

  const parts = value.split("–").map(part => part.trim());
  if (parts.length !== 2) return null;

  const toMinutes = time => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  return {
    start: toMinutes(parts[0]),
    end: toMinutes(parts[1])
  };
}

// Gera horários demonstrativos respeitando funcionamento, duração e intervalo de 15 minutos.
function isDateBeforeToday(dateValue) {
  return Boolean(dateValue) && dateValue < getLocalDate();
}

function isValidBookingDate(dateValue) {
  if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(dateValue)) return false;
  if (CONFIG.agendamento?.bloquearDatasAnteriores !== false && isDateBeforeToday(dateValue)) return false;
  return true;
}

// Gera horários demonstrativos respeitando funcionamento, duração e intervalo de 15 minutos.
function buildDemoTimes(dateValue, service) {
  const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const dayName = dayNames[getDayIndex(dateValue)];
  const row = CONFIG.horarios.find(([day]) => day === dayName);
  const opening = parseOpeningHours(row?.[1]);

  if (!opening) return [];

  // O horário de início trabalha sempre em blocos de 15 minutos.
  // Se um serviço foi escolhido, usamos sua duração para impedir início
  // próximo demais do fechamento.
  const duration = service ? parseInt(service.duracao, 10) || 30 : 30;
  const interval = Number(CONFIG.agendamento?.intervaloMinutos) || 15;
  const now = new Date();
  const isToday = dateValue === getLocalDate();
  const currentMinutes = isToday ? now.getHours() * 60 + now.getMinutes() : -1;
  const times = [];

  for (let start = opening.start; start + duration <= opening.end; start += interval) {
    if (isToday && start <= currentMinutes) continue;

    const hours = String(Math.floor(start / 60)).padStart(2, "0");
    const minutes = String(start % 60).padStart(2, "0");
    times.push(hours + ":" + minutes);
  }

  return times;
}

// Inicializa o formulário demonstrativo de agendamento.
function setupBooking() {
  const date = $("#booking-date");
  const time = $("#booking-time");
  const service = $("#booking-service");
  const summary = $("#booking-summary");
  const form = $("#booking-form");

  if (!date || !time || !service || !summary || !form) return;

  // Cria todos os horários possíveis uma única vez.
  // Assim o seletor nunca fica vazio nem depende de uma atualização
  // do JavaScript para poder ser aberto.
  const allTimes = [];
  for (let minutes = 6 * 60; minutes <= 22 * 60; minutes += 15) {
    const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
    const mins = String(minutes % 60).padStart(2, "0");
    allTimes.push(hours + ":" + mins);
  }

  time.innerHTML = '<option value="">Selecione um horário</option>';
  allTimes.forEach(value => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    time.appendChild(option);
  });
  time.disabled = false;

  const updateTimes = () => {
    const selected = service.value !== "" ? CONFIG.servicos[Number(service.value)] : null;
    const validDate = isValidBookingDate(date.value);
    const validTimes = validDate ? buildDemoTimes(date.value, selected) : [];

    if (date.value && !validDate) {
      date.setCustomValidity("Escolha hoje ou uma data futura.");
      summary.textContent = "A data escolhida não é válida. Selecione hoje ou uma data futura.";
    } else {
      date.setCustomValidity("");
    }

    Array.from(time.options).forEach((option, index) => {
      if (index === 0) {
        option.disabled = false;
        return;
      }

      option.disabled = !validTimes.includes(option.value);
    });

    // Mantém o seletor aberto e utilizável mesmo quando não houver
    // horários válidos para a data escolhida.
    time.disabled = false;

    if (time.value && !validTimes.includes(time.value)) {
      time.value = "";
    }

    updateBookingSummary();
  };

  const updateBookingSummary = () => {
    const selected = service.value !== "" ? CONFIG.servicos[Number(service.value)] : null;

    summary.textContent =
      date.value && time.value && selected
        ? selected.nome + " • " + date.value.split("-").reverse().join("/") + " • " + time.value + " • " + selected.preco
        : "Selecione serviço, data e horário.";
  };

  // A data deve aparecer preenchida imediatamente, sem depender da seleção de serviço.
  const today = getLocalDate();
  if (CONFIG.agendamento?.bloquearDatasAnteriores !== false) {
    date.min = today;
  }
  date.value = isValidBookingDate(date.value) ? date.value : today;
  date.removeAttribute("disabled");
  date.removeAttribute("readonly");

  date.addEventListener("change", updateTimes);
  service.addEventListener("change", updateTimes);
  time.addEventListener("change", updateBookingSummary);

  form.addEventListener("submit", event => {
    event.preventDefault();

    if (!date.value || !time.value || service.value === "") {
      summary.textContent = "Preencha serviço, data e horário.";
      return;
    }

    if (!isValidBookingDate(date.value)) {
      date.setCustomValidity("Escolha hoje ou uma data futura.");
      date.reportValidity();
      summary.textContent = "Não é possível agendar para uma data anterior a hoje.";
      return;
    }

    if (!buildDemoTimes(date.value, CONFIG.servicos[Number(service.value)]).includes(time.value)) {
      summary.textContent = "Esse horário não está disponível para o serviço selecionado.";
      return;
    }

    showToast("Agendamento demonstrativo confirmado. A disponibilidade real será validada quando o backend estiver integrado.");
  });

  updateTimes();
}

// Mostra uma mensagem temporária no canto da tela.
function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  window.setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

// Inicializa todos os recursos depois que o DOM já foi carregado pelo HTML.
applyConfig();
renderServices();
renderHours();
renderGallery();
setupMenu();
setupBooking();
