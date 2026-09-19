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
  if (!CONFIG || !Array.isArray(CONFIG.servicos) || !Array.isArray(CONFIG.horarios) || !Array.isArray(CONFIG.galeria)) {
    console.error("Configuração inválida: verifique javascript/configuracao.js.");
    return;
  }

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

  const heroMedia = $("[data-hero-media]");
  const heroImage = $("[data-hero-image]");
  const heroConfig = CONFIG.cabecalho;

  if (heroMedia && heroImage) {
    if (heroConfig?.usarImagem === false || !heroConfig?.imagem) {
      heroMedia.hidden = true;
    } else {
      heroImage.src = heroConfig.imagem;
      heroImage.alt = heroConfig.imagemAlt || "";
      heroImage.addEventListener("error", () => {
        if (heroConfig.fallback && heroImage.src !== new URL(heroConfig.fallback, document.baseURI).href) {
          heroImage.src = heroConfig.fallback;
        } else {
          heroMedia.hidden = true;
        }
      });
    }
  }

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
  const serviceGroup = $("#booking-services");

  if (!list || !serviceGroup) return;

  list.innerHTML = "";
  serviceGroup.innerHTML = "";

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

    const option = document.createElement("label");
    option.className = "booking-service-option";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "services";
    checkbox.value = String(index);
    checkbox.setAttribute("aria-describedby", "booking-service-help");

    const content = document.createElement("span");
    content.className = "booking-service-option-content";

    const optionTitle = document.createElement("strong");
    optionTitle.textContent = service.nome;

    const optionMeta = document.createElement("span");
    optionMeta.textContent = service.preco + " • " + service.duracao;

    content.append(optionTitle, optionMeta);
    option.append(checkbox, content);
    serviceGroup.appendChild(option);
  });
}

// Renderiza os horários configurados na seção de funcionamento.
function renderHours() {
  const list = $("#hours-list");
  if (!list) return;

  list.innerHTML = "";

  CONFIG.horarios.forEach(item => {
    const day = Array.isArray(item) ? item[0] : item?.dia;
    const time = Array.isArray(item)
      ? item[1]
      : item?.aberto
        ? item.abertura + " – " + item.fechamento
        : "Fechado";

    if (!day) return;

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
// Destaca a seção atual na navegação conforme o usuário percorre a página.
function setupScrollSpy() {
  const links = Array.from(document.querySelectorAll('.main-nav a[href^="#"]'));
  if (!links.length || !('IntersectionObserver' in window)) return;

  const sections = links
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const setActive = id => {
    links.forEach(link => {
      const active = link.getAttribute('href') === '#' + id;
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  };

  const observer = new IntersectionObserver(entries => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible) setActive(visible.target.id);
  }, {
    rootMargin: '-30% 0px -55% 0px',
    threshold: [0.1, 0.3, 0.6]
  });

  sections.forEach(section => observer.observe(section));
}

function setupMenu() {
  const button = $(".menu-toggle");
  const nav = $("#main-menu");

  if (!button || !nav) return;

  const setMenuState = open => {
    nav.classList.toggle("open", open);
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.body.classList.toggle("menu-open", open);
  };

  const closeMenu = (restoreFocus = false) => {
    setMenuState(false);
    if (restoreFocus) button.focus();
  };

  button.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    const open = button.getAttribute("aria-expanded") !== "true";
    setMenuState(open);

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
  if (value && typeof value === "object" && !Array.isArray(value)) {
    if (value.aberto === false) return null;
    if (value.abertura && value.fechamento) {
      value = value.abertura + " – " + value.fechamento;
    }
  }

  if (!value || typeof value !== "string" || value.toLowerCase() === "fechado") return null;

  const parts = value.split(/[–-]/).map(part => part.trim());
  if (parts.length !== 2) return null;

  const toMinutes = time => {
    const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(time);
    if (!match) return null;
    return Number(match[1]) * 60 + Number(match[2]);
  };

  const start = toMinutes(parts[0]);
  const end = toMinutes(parts[1]);

  if (start === null || end === null || end <= start) return null;

  return { start, end };
}

function parseDuration(value) {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(1, value);
  if (typeof value !== "string") return 30;

  const normalized = value.toLowerCase().replace(",", ".");
  const hoursMatch = normalized.match(/(\d+(?:\.\d+)?)\s*h/);
  const minutesMatch = normalized.match(/(\d+)\s*(?:min|m)/);

  const hours = hoursMatch ? Number(hoursMatch[1]) * 60 : 0;
  const minutes = minutesMatch ? Number(minutesMatch[1]) : 0;
  const parsed = hours + minutes;

  return parsed > 0 ? parsed : 30;
}

function parsePrice(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return 0;

  const normalized = value.replace(/[^0-9,.-]/g, "").replace(/\.(?=.*\.)/g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatPrice(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function getSelectedServices() {
  return Array.from(document.querySelectorAll("#booking-services input[name='services']:checked"))
    .map(input => CONFIG.servicos[Number(input.value)])
    .filter(Boolean);
}

function getSelectedServiceIndexes() {
  return Array.from(document.querySelectorAll("#booking-services input[name='services']:checked"))
    .map(input => Number(input.value))
    .filter(Number.isInteger);
}

function getBookingSelection() {
  const services = getSelectedServices();
  const duration = services.reduce((total, item) => total + parseDuration(item.duracao), 0);
  const total = services.reduce((sum, item) => sum + parsePrice(item.preco), 0);
  return { services, duration, total };
}

function getNextLocalDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return date.getFullYear() + "-" + month + "-" + day;
}

// Gera horários demonstrativos respeitando funcionamento, duração e intervalo de 15 minutos.
function isDateBeforeToday(dateValue) {
  return Boolean(dateValue) && dateValue < getLocalDate();
}

function isValidBookingDate(dateValue) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return false;
  if (CONFIG.agendamento?.bloquearDatasAnteriores !== false && isDateBeforeToday(dateValue)) return false;
  if (CONFIG.agendamento?.permitirAgendamentoHoje === false && dateValue === getLocalDate()) return false;
  return true;
}

// Gera horários demonstrativos respeitando funcionamento, duração e intervalo de 15 minutos.
function buildDemoTimes(dateValue, services) {
  const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const dayName = dayNames[getDayIndex(dateValue)];
  const row = CONFIG.horarios.find(item => {
    const day = Array.isArray(item) ? item[0] : item?.dia;
    return day === dayName;
  });
  const opening = parseOpeningHours(row);

  if (!opening) return [];

  const selectedServices = Array.isArray(services) ? services : services ? [services] : [];
  const duration = selectedServices.length
    ? selectedServices.reduce((total, item) => total + parseDuration(item.duracao), 0)
    : 15;
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
  const serviceGroup = $("#booking-services");
  const summary = $("#booking-summary");
  const form = $("#booking-form");

  if (!date || !time || !serviceGroup || !summary || !form) return;

  const updateBookingSummary = () => {
    const selection = getBookingSelection();

    if (date.value && time.value && selection.services.length) {
      const names = selection.services.map(item => item.nome).join(" + ");
      summary.textContent =
        names + " • " +
        date.value.split("-").reverse().join("/") + " • " +
        time.value + " • " +
        formatPrice(selection.total) + " • " +
        selection.duration + " min";
      return;
    }

    if (selection.services.length) {
      summary.textContent =
        selection.services.map(item => item.nome).join(" + ") +
        " • " + formatPrice(selection.total) +
        " • " + selection.duration + " min. Selecione data e horário.";
      return;
    }

    summary.textContent = "Selecione um ou mais serviços, data e horário.";
  };

  const updateTimes = () => {
    const selection = getBookingSelection();
    const validDate = isValidBookingDate(date.value);
    const validTimes = validDate && selection.services.length
      ? buildDemoTimes(date.value, selection.services)
      : [];

    const dateIsInvalid = Boolean(date.value) && !validDate;
    date.setCustomValidity(dateIsInvalid ? "Escolha hoje ou uma data futura." : "");
    date.setAttribute("aria-invalid", String(dateIsInvalid));

    const previousTime = time.value;
    time.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.disabled = false;
    placeholder.textContent = !date.value
      ? "Selecione uma data"
      : !selection.services.length
        ? "Selecione ao menos um serviço"
        : !validDate
          ? "Escolha uma data válida"
          : validTimes.length
            ? "Selecione um horário"
            : "Nenhum horário disponível";
    time.appendChild(placeholder);

    validTimes.forEach(value => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      time.appendChild(option);
    });

    time.disabled = false;

    if (previousTime && validTimes.includes(previousTime)) {
      time.value = previousTime;
    } else {
      time.value = "";
    }

    updateBookingSummary();
  };

  const today = getLocalDate();
  const minimumDate = CONFIG.agendamento?.permitirAgendamentoHoje === false
    ? getNextLocalDate()
    : today;

  if (CONFIG.agendamento?.bloquearDatasAnteriores !== false || CONFIG.agendamento?.permitirAgendamentoHoje === false) {
    date.min = minimumDate;
  } else {
    date.removeAttribute("min");
  }

  date.value = isValidBookingDate(date.value) ? date.value : minimumDate;
  date.removeAttribute("disabled");
  date.removeAttribute("readonly");

  serviceGroup.addEventListener("change", updateTimes);
  date.addEventListener("change", updateTimes);
  time.addEventListener("change", updateBookingSummary);

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const selection = getBookingSelection();

    if (!date.value || !time.value || !selection.services.length) {
      summary.textContent = "Selecione pelo menos um serviço, data e horário.";
      return;
    }

    if (!isValidBookingDate(date.value)) {
      date.setCustomValidity("Escolha hoje ou uma data futura.");
      date.reportValidity();
      summary.textContent = "Não é possível agendar para uma data anterior a hoje.";
      return;
    }

    if (!buildDemoTimes(date.value, selection.services).includes(time.value)) {
      summary.textContent = "Esse horário não está disponível para os serviços selecionados.";
      return;
    }

    const submitButton = form.querySelector("button[type='submit']");
    if (submitButton) submitButton.disabled = true;
    summary.textContent = "Consultando disponibilidade real...";

    try {
      const response = await fetch("/api/agendamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: $("#booking-name")?.value.trim() || "",
          telefone: $("#booking-phone")?.value.trim() || "",
          data: date.value,
          hora: time.value,
          servicos: selection.services.map(item => item.nome)
        })
      });

      const result = await response.json();

      if (!response.ok) {
        summary.textContent = result.error || "Não foi possível concluir o agendamento.";
        return;
      }

      summary.textContent = result.message + " • " + date.value.split("-").reverse().join("/") + " • " + time.value + " • " + formatPrice(result.booking.valorTotal);
      form.reset();
      updateTimes();
      showToast("Agendamento realizado com sucesso.");
    } catch (error) {
      console.error("Erro ao conectar com o backend:", error);
      summary.textContent = "Não foi possível conectar ao sistema de agendamento. Tente novamente.";
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
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
setupScrollSpy();
setupBooking();
