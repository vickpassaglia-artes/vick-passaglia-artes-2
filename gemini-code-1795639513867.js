const WHATSAPP_NUMBER = "5511999999999"; // Troque pelo seu número com DDI + DDD + número

const FIREBASE_CONFIG = {
  // Opcional: cole aqui a URL do Firebase Realtime Database quando quiser sincronizar online
  databaseURL: ""
};

function updateWhatsappLinks() {
  const name = document.getElementById('authorName')?.value.trim();
  const topic = document.getElementById('topicTag')?.value;
  const msg = document.getElementById('messageText')?.value.trim();

  const customText = msg
    ? `Olá Vick! Sou ${name || 'alguém da roda de arte'}. Sobre "${topic}": ${msg}`
    : `Olá Vick! Vi o site Vick Passaglia Artes e gostaria de trocar ideias sobre arte e criação!`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(customText)}`;
  ['heroWhatsappBtn', 'formWhatsappBtn', 'floatingWhatsapp'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.href = url;
  });
}

['authorName', 'topicTag', 'messageText'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', updateWhatsappLinks);
});
document.getElementById('topicTag')?.addEventListener('change', updateWhatsappLinks);
updateWhatsappLinks();

const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

const filterBtns = document.querySelectorAll('.filter-btn');
const artCards = document.querySelectorAll('.art-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    artCards.forEach(card => {
      if (filter === 'todos' || card.dataset.category === filter) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

const modal = document.getElementById('artModal');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalClose = document.getElementById('modalClose');

artCards.forEach(card => {
  card.addEventListener('click', () => {
    const img = card.querySelector('img');
    modalImg.src = img.src;
    modalTitle.textContent = card.dataset.title;
    modalDesc.textContent = card.dataset.desc;
    modal.classList.add('open');
  });
});

modalClose.addEventListener('click', () => modal.classList.remove('open'));
modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.classList.remove('open');
});

const swatchBtns = document.querySelectorAll('.swatch-btn');
const swatchPreview = document.getElementById('swatchPreview');
const swatchTitle = document.getElementById('swatchTitle');
const swatchNote = document.getElementById('swatchNote');

swatchBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    swatchBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const color = btn.style.getPropertyValue('--swatch');
    swatchPreview.style.backgroundColor = color;
    swatchTitle.textContent = btn.dataset.name;
    swatchNote.textContent = btn.dataset.note;
  });
});

const desafios = [
  "Experimente pressionar folhas naturais ou tecido rústico sobre uma placa de argila fresca para gravar texturas orgânicas!",
  "Crie uma pequena paleta usando apenas 3 tons terrosos e branco para estudar luz e sombra sem pressa.",
  "Modele uma miniatura livre em 15 minutos sem usar ferramentas — apenas a ponta dos dedos e a palma da mão.",
  "Misture pigmentos ou tons terrosos em papel texturizado para criar um fundo acolhedor antes de desenhar."
];

document.getElementById('btnInspire').addEventListener('click', () => {
  const sorteado = desafios[Math.floor(Math.random() * desafios.length)];
  document.getElementById('creativePrompt').textContent = `💡 Desafio: ${sorteado}`;
});

const defaultMessages = [
  {
    author: "Vick Passaglia",
    topic: "☕ Bate-papo Livre",
    text: "Sejam muito bem-vindos! Que textura ou técnica você tem vontade de experimentar esta semana? Vamos trocar ideias por aqui!",
    date: "Anfitriã do Ateliê"
  },
  {
    author: "Clara M.",
    topic: "🏺 Dúvida sobre Materiais & Argila",
    text: "Amei ver seu estudo facial no espelho! Qual tipo de argila você mais gosta para modelar detalhes finos?",
    date: "Visitante"
  }
];

const STORAGE_KEY = 'vick_artes_mural_v2';
const messagesList = document.getElementById('messagesList');
const chatForm = document.getElementById('chatForm');
const syncBadge = document.getElementById('syncBadge');

function escapeHTML(str) {
  return String(str).replace(/[&<>'"]/g, tag => ({
    '&': '&', '<': '<', '>': '>', "'": ''', '"': '"'
  }[tag]));
}

function renderMessages(list) {
  messagesList.innerHTML = '';
  const items = list && list.length ? list : defaultMessages;
  items.forEach(msg => {
    const div = document.createElement('div');
    div.className = 'msg-item';
    div.innerHTML = `
      <div class="msg-meta">
        <strong>${escapeHTML(msg.author)}</strong>
        <span class="msg-tag">${escapeHTML(msg.topic)}</span>
      </div>
      <p>${escapeHTML(msg.text)}</p>
    `;
    messagesList.appendChild(div);
  });
}

let dbRef = null;
const useFirebase = Boolean(FIREBASE_CONFIG.databaseURL && window.firebase);

if (useFirebase) {
  firebase.initializeApp(FIREBASE_CONFIG);
  dbRef = firebase.database().ref('mural_mensagens');
  syncBadge.textContent = '● Sincronizado Online';

  dbRef.limitToLast(40).on('value', (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      renderMessages(defaultMessages);
      return;
    }
    const ordered = Object.values(data).reverse();
    renderMessages(ordered);
  });
} else {
  const localMsgs = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultMessages;
  renderMessages(localMsgs);
}

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const author = document.getElementById('authorName').value.trim();
  const topic = document.getElementById('topicTag').value;
  const text = document.getElementById('messageText').value.trim();

  if (!author || !text) return;

  const newMsg = {
    author,
    topic,
    text,
    date: new Date().toLocaleDateString('pt-BR')
  };

  if (useFirebase && dbRef) {
    dbRef.push(newMsg);
  } else {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultMessages;
    current.unshift(newMsg);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    renderMessages(current);
  }

  chatForm.reset();
  updateWhatsappLinks();
});