let allRecipes = [];
let currentNicho = null;
let isSpinning = false;

// Configuração dos nichos (mantendo os emojis originais)
const NICHOS = [
  { id: "to-duro", name: "Tô duro 🪙", file: "to-duro-🪙" },
  { id: "final-do-mes", name: "Final do mês 💸", file: "final-do-mes-💸" },
  { id: "recebi-hoje", name: "Recebi hoje 💰", file: "recebi-hoje-💰" },
  { id: "almoco", name: "Almoço 🍽️", file: "almoco-🍽️" },
  { id: "jantar", name: "Jantar 🌙", file: "jantar-🌙" },
  { id: "cafe-da-manha", name: "Café da manhã ☀️", file: "cafe-da-manha-☀️" },
  { id: "sobremesa", name: "Sobremesa 🍫", file: "sobremesa-🍫" },
  { id: "vegano", name: "Vegano 🌱", file: "vegano-🌱" },
  { id: "vegetariano", name: "Vegetariano 🥗", file: "vegetariano-🥗" },
  { id: "em-15-minutos", name: "Em 15 minutos ⏱️", file: "em-15-minutos-⏱️" },
  { id: "na-air-fryer", name: "Na Air Fryer 💨", file: "na-air-fryer-💨" },
  { id: "uma-panela-so", name: "Uma panela só 🫕", file: "uma-panela-so-🫕" },
  { id: "boteco-em-casa", name: "Boteco em casa 🍺", file: "boteco-em-casa-🍺" },
  { id: "vendo-o-fut", name: "Vendo o fut ⚽", file: "vendo-o-fut-⚽" },
  { id: "lanche-da-tarde", name: "Lanche da tarde 🥪", file: "lanche-da-tarde-🥪" },
  { id: "madrugada", name: "Madrugada 🦉", file: "madrugada-🦉" },
  { id: "pra-impressionar", name: "Pra impressionar 🎩", file: "pra-impressionar-🎩" },
  { id: "jantar-romantico", name: "Jantar romântico 🕯️", file: "jantar-romântico-🕯️" },
  { id: "churrasco", name: "Churrasco 🔥", file: "churrasco-🔥" },
  { id: "comida-de-rua", name: "Comida de rua 🥙", file: "comida-de-rua-🥙" },
  { id: "comida-regional", name: "Comida regional 🍛", file: "comida-regional-🍛" },
  { id: "detox", name: "Detox 🥒", file: "detox-🥒" },
  { id: "to-de-dieta", name: "Tô de dieta 🥑", file: "to-de-dieta-🥑" },
  { id: "ganhar-massa", name: "Ganhar massa 🏋️", file: "ganhar-massa-🏋️" },
  { id: "pos-treino", name: "Pós-treino 💪", file: "pos-treino-💪" },
  { id: "sem-gluten", name: "Sem glúten 🌾", file: "sem-gluten-🌾" },
  { id: "sem-lactose", name: "Sem lactose 🥛", file: "sem-lactose-🥛" },
  { id: "to-doente", name: "Tô doente 🤒", file: "to-doente-🤒" },
  { id: "de-ressaca", name: "De ressaca 🤢", file: "de-ressaca-🤢" },
  { id: "to-com-frio", name: "Tô com frio 🥶", file: "to-com-frio-🥶" },
  { id: "nao-sei-cozinhar", name: "Não sei cozinhar 😬", file: "nao-sei-cozinhar-😬" },
  { id: "sem-sujar-louca", name: "Sem sujar louça 🙏", file: "sem-sujar-louca-🙏" },
  { id: "no-micro-ondas", name: "No micro-ondas 📡", file: "no-micro-ondas-📡" },
  { id: "sem-fogao", name: "Sem fogão 🚫🔥", file: "sem-fogao-🚫🔥" },
  { id: "no-forno", name: "No forno 🔆", file: "no-forno-🔆" },
  { id: "fast-food-caseiro", name: "Fast food caseiro 🍔", file: "fast-food-caseiro-🍔" },
  { id: "receita-de-famosos", name: "Receita de famosos ⭐", file: "receita-de-famosos-⭐" },
  { id: "pra-criancada", name: "Pra criançada 👶", file: "pra-criancada-👶" },
  { id: "pra-vovo-e-vovo", name: "Pra vovô e vovó 👴", file: "pra-vovo-e-vovo-👴" },
  { id: "a-galera-toda", name: "A galera toda 🎉", file: "a-galera-toda-🎉" },
  { id: "piquenique", name: "Piquenique 🧺", file: "piquenique-🧺" },
  { id: "drinks", name: "Drinks 🍹", file: "drinks-🍹" },
  { id: "cafe", name: "Café ☕", file: "cafe-☕" }
];

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('anoFooter').textContent = new Date().getFullYear();
  renderNichos();
  loadRecipes();
});

async function loadRecipes() {
  try {
    const response = await fetch('data/receitas.json');
    all_recipes = await response.json();
    console.log(`Carregadas ${all_recipes.length} receitas.`);
  } catch (error) {
    console.error('Erro ao carregar receitas:', error);
  }
}

function renderNichos() {
  const container = document.getElementById('nichosScroll');
  container.innerHTML = '';
  
  NICHOS.forEach(nicho => {
    const card = document.createElement('div');
    card.className = 'nicho-card';
    card.id = `nicho-${nicho.id}`;
    card.onclick = () => selectNicho(nicho);
    
    const emoji = nicho.name.split(' ').pop();
    const name = nicho.name.replace(emoji, '').trim();
    
    card.innerHTML = `
      <span class="nicho-emoji">${emoji}</span>
      <span class="nicho-name">${name}</span>
    `;
    container.appendChild(card);
  });
}

function selectNicho(nicho) {
  if (isSpinning) return;
  
  currentNicho = nicho;
  
  // Update UI
  document.querySelectorAll('.nicho-card').forEach(c => c.classList.remove('active'));
  document.getElementById(`nicho-${nicho.id}`).classList.add('active');
  
  const blocoTag = document.getElementById('blocoTag');
  blocoTag.textContent = nicho.name;
  blocoTag.style.display = 'block';
  
  const slotHint = document.getElementById('slotHint');
  slotHint.textContent = `Pronto para sortear em: ${nicho.name}`;
  
  // Reset slot
  const slotInner = document.getElementById('slotInner');
  slotInner.style.transition = 'none';
  slotInner.style.transform = 'translateY(0)';
  slotInner.innerHTML = `<div class="slot-item"><span>🎰 ${nicho.name}</span></div>`;
  
  // Reset result
  document.getElementById('resultSection').classList.remove('visible');
}

function scrollNichos(dir) {
  const scroll = document.getElementById('nichosScroll');

  const scrollAmount = 240;
  const maxScroll = scroll.scrollWidth - scroll.clientWidth;

  if (dir > 0) {
    // Se chegou no final → volta pro começo
    if (scroll.scrollLeft + scrollAmount >= maxScroll) {
      scroll.scrollTo({
        left: 0,
        behavior: 'smooth'
      });
    } else {
      scroll.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  } else {
    // Se está no começo → vai pro final
    if (scroll.scrollLeft <= 0) {
      scroll.scrollTo({
        left: maxScroll,
        behavior: 'smooth'
      });
    } else {
      scroll.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    }
  }
}

function spin() {
  if (!currentNicho || isSpinning) {
    if (!currentNicho) alert('Escolha uma situação primeiro!');
    return;
  }
  
  const filtered = all_recipes.filter(r => {
    // Busca aproximada pela categoria formatada
    const catSearch = currentNicho.name.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const recipeCat = r.categoria.toLowerCase().replace(/[^\w\s]/g, '').trim();
    return recipeCat === catSearch || r.categoria.includes(currentNicho.name.split(' ')[0]);
  });

  if (filtered.length === 0) {
    alert('Nenhuma receita encontrada para este nicho no momento.');
    return;
  }

  isSpinning = true;
  const btn = document.getElementById('spinBtn');
  const btnText = document.getElementById('spinBtnText');
  btn.disabled = true;
  btnText.textContent = 'Girando...';
  
  const slotInner = document.getElementById('slotInner');
  slotInner.innerHTML = '';
  
  // Criar itens para o efeito visual
  const itemsCount = 20;
  for (let i = 0; i < itemsCount; i++) {
    const randomRecipe = filtered[Math.floor(Math.random() * filtered.length)];
    const item = document.createElement('div');
    item.className = 'slot-item';
    item.innerHTML = `<span>${randomRecipe.titulo}</span>`;
    slotInner.appendChild(item);
  }
  
  // A receita final
  const finalRecipe = filtered[Math.floor(Math.random() * filtered.length)];
  const finalItem = document.createElement('div');
  finalItem.className = 'slot-item';
  finalItem.innerHTML = `<span>${finalRecipe.titulo}</span>`;
  slotInner.appendChild(finalItem);
  
  const itemHeight = 80;
  const totalTravel = itemsCount * itemHeight;
  
  slotInner.style.transition = 'transform 2.5s cubic-bezier(0.15, 0, 0.15, 1)';
  slotInner.style.transform = `translateY(-${totalTravel}px)`;
  
  setTimeout(() => {
    showResult(finalRecipe);
    isSpinning = false;
    btn.disabled = false;
    btnText.textContent = '🎲 Girar novamente!';
  }, 2600);
}

function showResult(recipe) {

  history.pushState({}, '', `?receita=${recipe.slug}`);

  const resultSection = document.getElementById('resultSection');
  const resultContent = document.getElementById('resultContent');
  
  const emoji = currentNicho ? currentNicho.name.split(' ').pop() : '🍳';
  
  resultContent.innerHTML = `
    <div class="result-card">
      <div class="result-header">
        <span class="result-emoji">${emoji}</span>
        <h2 class="result-name">${recipe.titulo}</h2>
        <span class="result-nicho-tag">${recipe.categoria}</span>
        <p class="result-desc">${recipe.descricao || ''}</p>
      </div>
      <div class="result-body">
        <div class="info-grid">
          <div class="info-chip">
            <div class="info-chip-label">Tempo</div>
            <div class="info-chip-value">⏱️ ${recipe.tempo || 'N/A'}</div>
          </div>
          <div class="info-chip">
            <div class="info-chip-label">Custo</div>
            <div class="info-chip-value">💰 ${recipe.preco || 'N/A'}</div>
          </div>
          <div class="info-chip">
            <div class="info-chip-label">Dificuldade</div>
            <div class="info-chip-value">👨‍🍳 ${recipe.dificuldade || 'Fácil'}</div>
          </div>
          <div class="info-chip">
            <div class="info-chip-label">Porções</div>
            <div class="info-chip-value">🍽️ ${recipe.porcoes || 'N/A'}</div>
          </div>
        </div>

        <div class="section-block">
          <div class="section-block-title">Ingredientes</div>
          <div class="section-block-content">
            <ul>
              ${recipe.ingredientes.map(ing => `<li>${ing}</li>`).join('')}
            </ul>
          </div>
        </div>

        <div class="section-block">
          <div class="section-block-title">Modo de Preparo</div>
          <div class="section-block-content">
            <ol>
              ${recipe.modoPreparo.map(step => `<li>${step}</li>`).join('')}
            </ol>
          </div>
        </div>

        ${recipe.dica ? `
          <div class="funny-tip">
            <strong>💡 Dica do Chef:</strong> ${recipe.dica}
          </div>
        ` : ''}
      </div>
    </div>
  `;
  
  resultSection.classList.add('visible');
  resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function abrirModal(tipo) {
  const modal = document.getElementById('modalOverlay');
  modal.classList.add('open');
  trocarAba(tipo);
}

function fecharModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

function fecharModalFora(e) {
  if (e.target.id === 'modalOverlay') fecharModal();
}

function trocarAba(tipo) {
  const tabs = ['sobre', 'privacidade'];
  tabs.forEach(t => {
    document.getElementById(`tab${t.charAt(0).toUpperCase() + t.slice(1)}`).classList.toggle('active', t === tipo);
    document.getElementById(`content${t.charAt(0).toUpperCase() + t.slice(1)}`).classList.toggle('active', t === tipo);
  });
  document.getElementById('modalTitle').textContent = tipo === 'sobre' ? 'Sobre o Na Fome' : 'Privacidade';
}

function voltarInicio() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => location.reload(), 500);
}
