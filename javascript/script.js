/* ============================================================================
   CONFIGURAÇÃO CENTRAL
   ============================================================================
   Edite principalmente este bloco para adaptar o template a um novo cliente.
   O restante do arquivo usa esses dados para preencher a página automaticamente.
*/
// Dados comerciais, identidade visual, contatos, serviços, horários e galeria.
const CONFIG={
  // Identidade e textos principais.
  nome:"Barbearia Template",
  logo:"recursos/identidade/logo.svg",
  logoAlt:"Logo da Barbearia Template",
  favicon:"recursos/identidade/favicon.svg",
  slogan:"Seu estilo começa aqui.",
  descricao:"Um espaço pensado para quem valoriza um bom corte, atendimento de qualidade e personalidade em cada detalhe.",
  // Canais de contato e redes sociais.
  whatsapp:"5500000000000",
  telefone:"(00) 00000-0000",
  instagram:"@barbearia",
  instagramUrl:"https://instagram.com/",
  endereco:"Rua Exemplo, 123 — Centro",
  mapQuery:"Rua Exemplo, 123 Centro",
  // Serviços exibidos no site e usados no cálculo do agendamento demonstrativo.
  servicos:[
    {nome:"Corte",descricao:"Corte personalizado com acabamento preciso.",preco:"R$ 40",duracao:"45 min"},
    {nome:"Barba",descricao:"Barba desenhada com cuidado e acabamento.",preco:"R$ 30",duracao:"30 min"},
    {nome:"Corte + Barba",descricao:"Experiência completa para renovar o visual.",preco:"R$ 65",duracao:"75 min"},
    {nome:"Acabamento",descricao:"Detalhes e finalização para manter o corte.",preco:"R$ 20",duracao:"20 min"},
    {nome:"Sobrancelha",descricao:"Acabamento discreto e alinhado.",preco:"R$ 15",duracao:"15 min"},
    {nome:"Combo Premium",descricao:"Serviço completo para uma experiência especial.",preco:"R$ 80",duracao:"90 min"}
  ],
  // Horários de funcionamento por dia da semana.
  horarios:[
    ["Segunda","Fechado"],["Terça","09:00 – 19:00"],["Quarta","09:00 – 19:00"],
    ["Quinta","09:00 – 20:00"],["Sexta","09:00 – 20:00"],["Sábado","08:00 – 18:00"],["Domingo","Fechado"]
  ],
  // Imagens exibidas na galeria.
  galeria:[
    {label:"Ambiente",imagem:"recursos/imagens/ambiente.svg"},{label:"Cortes",imagem:"recursos/imagens/cortes.svg"},{label:"Detalhes",imagem:"recursos/imagens/detalhes.svg"},{label:"Experiência",imagem:"recursos/imagens/experiencia.svg"}
  ]
};

// Atalhos para selecionar um elemento ou vários elementos no DOM.
const $=selector=>document.querySelector(selector);
const $$=selector=>document.querySelectorAll(selector);

// Aplica a configuração central nos elementos marcados no HTML.
  // Atualiza título, favicon, textos, logo e links externos.
  document.title=CONFIG.nome;
  const favicon=document.querySelector("link[rel=\"icon\"]");if(favicon)favicon.href=CONFIG.favicon;
  document.querySelectorAll("[data-config]").forEach(el=>{const key=el.dataset.config;if(CONFIG[key]!==undefined)el.textContent=CONFIG[key]});
  document.querySelectorAll("[data-logo]").forEach(el=>{el.src=CONFIG.logo;el.alt=CONFIG.logoAlt});
  $$("[data-config-link='instagram']").forEach(el=>el.href=CONFIG.instagramUrl);
  $$(".whatsapp-link").forEach(el=>el.href="https://wa.me/"+CONFIG.whatsapp+"?text="+encodeURIComponent("Olá! Gostaria de agendar um horário."));
  const mapLink=$(".map-link");if(mapLink)mapLink.href="https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(CONFIG.mapQuery);
  const year=$("#current-year");if(year)year.textContent=new Date().getFullYear();
}

// Cria os cards de serviços e as opções do campo de agendamento.
  const list=$("#services-list"),select=$("#booking-service");if(!list||!select)return;
  // Um card e uma opção do formulário são criados para cada serviço.
  CONFIG.servicos.forEach((service,index)=>{
    const card=document.createElement("article");card.className="service-card";
    const title=document.createElement("h3");title.textContent=service.nome;
    const description=document.createElement("p");description.textContent=service.descricao;
    const meta=document.createElement("div");meta.className="service-meta";
    const price=document.createElement("span");price.className="price";price.textContent=service.preco;
    const duration=document.createElement("span");duration.className="duration";duration.textContent=service.duracao;
    meta.append(price,duration);card.append(title,description,meta);list.appendChild(card);
    const option=document.createElement("option");option.value=String(index);option.textContent=service.nome+" — "+service.preco;select.appendChild(option);
  });
}

// Renderiza os horários configurados na seção de funcionamento.
  const list=$("#hours-list");if(!list)return;
  // Cada par [dia, horário] vira uma linha visual.
  CONFIG.horarios.forEach(([day,time])=>{const row=document.createElement("div");row.className="hours-row";const dayEl=document.createElement("span"),timeEl=document.createElement("span");dayEl.textContent=day;timeEl.textContent=time;row.append(dayEl,timeEl);list.appendChild(row)});
}

// Cria a galeria e trata falhas de carregamento das imagens.
  const list=$("#gallery-list");if(!list)return;
  // Cada item configurado vira uma figura com carregamento otimizado.
  CONFIG.galeria.forEach((item,index)=>{
    const figure=document.createElement("figure");figure.className="gallery-item";
    const label=document.createElement("span");label.textContent=String(index+1).padStart(2,"0")+" • "+item.label;
    if(item.imagem){
      figure.classList.add("has-image");
      const image=document.createElement("img");image.src=item.imagem;image.alt=item.label;image.loading="lazy";image.decoding="async";
      image.addEventListener("error",()=>{image.remove();figure.classList.remove("has-image")});
      figure.append(image);
    }
    figure.append(label);list.appendChild(figure);
  });
}

// Controla o menu mobile, acessibilidade e fechamento automático.
  const button=$(".menu-toggle"),nav=$("#main-menu");if(!button||!nav)return;
  // Função centralizada para fechar o menu e restaurar o estado de acessibilidade.
  const closeMenu=()=>{nav.classList.remove("open");button.setAttribute("aria-expanded","false");button.setAttribute("aria-label","Abrir menu");document.body.classList.remove("menu-open")};
  button.addEventListener("click",()=>{const open=nav.classList.toggle("open");button.setAttribute("aria-expanded",String(open));button.setAttribute("aria-label",open?"Fechar menu":"Abrir menu");document.body.classList.toggle("menu-open",open)});
  nav.querySelectorAll("a").forEach(link=>link.addEventListener("click",closeMenu));
  document.addEventListener("keydown",event=>{if(event.key==="Escape")closeMenu()});
  document.addEventListener("click",event=>{if(nav.classList.contains("open")&&!nav.contains(event.target)&&!button.contains(event.target))closeMenu()});
  window.addEventListener("resize",()=>{if(window.innerWidth>700)closeMenu()});
}

// Retorna a data atual no formato aceito pelo input type="date".
  // Usa a data local do navegador para evitar depender de servidor.
  const now=new Date(),month=String(now.getMonth()+1).padStart(2,"0"),day=String(now.getDate()).padStart(2,"0");
  return now.getFullYear()+"-"+month+"-"+day;
}

// Converte uma data YYYY-MM-DD para o índice do dia da semana.
  const [year,month,day]=dateValue.split("-").map(Number);
  return new Date(year,month-1,day).getDay();
}

// Converte "09:00 – 19:00" em minutos para facilitar os cálculos.
  if(!value||value.toLowerCase()==="fechado")return null;
  // O template usa o travessão "–" como separador do intervalo.
  const parts=value.split("–").map(part=>part.trim());
  if(parts.length!==2)return null;
  const toMinutes=time=>{const [hours,minutes]=time.split(":").map(Number);return hours*60+minutes};
  return {start:toMinutes(parts[0]),end:toMinutes(parts[1])};
}

// Gera horários demonstrativos respeitando funcionamento e duração do serviço.
  const dayNames=["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];
  const dayName=dayNames[getDayIndex(dateValue)];
  const row=CONFIG.horarios.find(([day])=>day===dayName);
  const opening=parseOpeningHours(row?.[1]);
  if(!opening)return [];
  // Duração vem da configuração; 30 minutos é o fallback seguro.
  const duration=parseInt(service?.duracao,10)||30;
  const interval=15;
  const times=[];
  for(let start=opening.start;start+duration<=opening.end;start+=duration+interval){
    const hours=String(Math.floor(start/60)).padStart(2,"0"),minutes=String(start%60).padStart(2,"0");
    times.push(hours+":"+minutes);
  }
  return times;
}

// Inicializa o formulário e atualiza horários/resumo conforme as escolhas.
  const date=$("#booking-date"),time=$("#booking-time"),service=$("#booking-service"),summary=$("#booking-summary"),form=$("#booking-form");
  if(!date||!time||!service||!summary||!form)return;
  // Recalcula as opções sempre que serviço ou data mudarem.
  const update=()=>{
    time.innerHTML="";
    const empty=document.createElement("option");empty.value="";empty.textContent=date.value?"Selecione um horário":"Selecione uma data";time.appendChild(empty);
    const selected=service.value!==""?CONFIG.servicos[Number(service.value)]:null;
    if(date.value){
      const times=buildDemoTimes(date.value,selected);
      if(!times.length)empty.textContent="Fechado nesta data";
      times.forEach(value=>{const option=document.createElement("option");option.value=value;option.textContent=value;time.appendChild(option)});
    }
    summary.textContent=date.value&&time.value&&selected?selected.nome+" • "+date.value.split("-").reverse().join("/")+" • "+time.value+" • "+selected.preco:"Selecione os dados acima.";
  };
  date.min=getLocalDate();
  [date,time,service].forEach(field=>field.addEventListener("change",update));
  // O envio é apenas demonstrativo: não grava dados em banco.
  form.addEventListener("submit",event=>{
    event.preventDefault();
    if(!date.value||!time.value||service.value===""){summary.textContent="Preencha serviço, data e horário.";return}
    showToast("Agendamento demonstrativo confirmado.");
  });
}

// Exibe uma mensagem temporária no canto da tela.
  const toast=$("#toast");if(!toast)return;
  toast.textContent=message;toast.classList.add("show");window.setTimeout(()=>toast.classList.remove("show"),3200);
}

// Inicializa todos os recursos depois que o script é carregado.
applyConfig();renderServices();renderHours();renderGallery();setupMenu();setupBooking();