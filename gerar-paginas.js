/**
 * NaFome — Gerador de Páginas Estáticas por Nicho
 * 
 * Como usar:
 *   node gerar-paginas.js
 * 
 * O script lê os JSONs em data/receitas/ e gera uma pasta
 * por nicho em pages/[nicho]/index.html
 * 
 * Rode na raiz do projeto (onde fica o index.html principal).
 */

const fs   = require('fs');
const path = require('path');

// ─── Configuração ────────────────────────────────────────────────
const BASE_URL      = 'https://nafome.com.br';
const RECEITAS_DIR  = path.join(__dirname, 'data', 'receitas');
const OUTPUT_DIR    = path.join(__dirname, 'pages');
// ────────────────────────────────────────────────────────────────

// Mapa de nicho → nome legível e emoji
const NICHOS_META = {
  'cafe-da-manha':    { nome: 'Café da Manhã',        emoji: '☀️' },
  'almoco':           { nome: 'Almoço',                emoji: '🍽️' },
  'lanche-da-tarde':  { nome: 'Lanche da Tarde',       emoji: '🥪' },
  'jantar':           { nome: 'Jantar',                 emoji: '🌙' },
  'madrugada':        { nome: 'Madrugada',              emoji: '🦉' },
  'to-duro':          { nome: 'Tô Duro',               emoji: '🪙' },
  'final-do-mes':     { nome: 'Final do Mês',          emoji: '💸' },
  'recebi-hoje':      { nome: 'Recebi Hoje',           emoji: '💰' },
  'gourmet':          { nome: 'Gourmet',               emoji: '💎' },
  'detox':            { nome: 'Detox',                  emoji: '🥒' },
  'to-de-dieta':      { nome: 'Tô de Dieta',           emoji: '🥑' },
  'vegano':           { nome: 'Vegano',                 emoji: '🌱' },
  'vegetariano':      { nome: 'Vegetariano',            emoji: '🥗' },
  'sem-gluten':       { nome: 'Sem Glúten',            emoji: '🌾' },
  'sem-lactose':      { nome: 'Sem Lactose',           emoji: '🥛' },
  'pre-treino':       { nome: 'Pré-Treino',            emoji: '🔋' },
  'pos-treino':       { nome: 'Pós-Treino',            emoji: '💪' },
  'ganhar-massa':     { nome: 'Ganhar Massa',          emoji: '🏋️' },
  'em-15-minutos':    { nome: 'Em 15 Minutos',         emoji: '⏱️' },
  'uma-panela-so':    { nome: 'Uma Panela Só',         emoji: '🫕' },
  'na-air-fryer':     { nome: 'Na Air Fryer',          emoji: '💨' },
  'no-micro-ondas':   { nome: 'No Micro-ondas',        emoji: '📡' },
  'no-forno':         { nome: 'No Forno',              emoji: '🔆' },
  'sem-fogao':        { nome: 'Sem Fogão',             emoji: '🚫' },
  'sem-sujar-louca':  { nome: 'Sem Sujar Louça',      emoji: '🙏' },
  'nao-sei-cozinhar': { nome: 'Não Sei Cozinhar',     emoji: '😬' },
  'final-de-semana':  { nome: 'Final de Semana',       emoji: '😎' },
  'churrasco':        { nome: 'Churrasco',              emoji: '🔥' },
  'boteco-em-casa':   { nome: 'Boteco em Casa',        emoji: '🍺' },
  'vendo-o-fut':      { nome: 'Vendo o Fut',           emoji: '⚽' },
  'jantar-romantico': { nome: 'Jantar Romântico',      emoji: '🕯️' },
  'pra-impressionar': { nome: 'Pra Impressionar',      emoji: '🎩' },
  'piquenique':       { nome: 'Piquenique',             emoji: '🧺' },
  'natal':            { nome: 'Natal',                  emoji: '🎄' },
  'ano-novo':         { nome: 'Ano Novo',              emoji: '🥂' },
  'pascoa':           { nome: 'Páscoa',                emoji: '🐣' },
  'to-doente':        { nome: 'Tô Doente',             emoji: '🤒' },
  'de-ressaca':       { nome: 'De Ressaca',            emoji: '🤢' },
  'to-com-frio':      { nome: 'Tô com Frio',           emoji: '🥶' },
  'fast-food-caseiro':{ nome: 'Fast Food Caseiro',     emoji: '🍔' },
  'comida-de-rua':    { nome: 'Comida de Rua',         emoji: '🥙' },
  'comida-regional':  { nome: 'Comida Regional',       emoji: '🍛' },
  'frutos-do-mar':    { nome: 'Frutos do Mar',         emoji: '🦐' },
  'sobremesa':        { nome: 'Sobremesa',              emoji: '🍫' },
  'cafe':             { nome: 'Café',                   emoji: '☕' },
  'drinks':           { nome: 'Drinks',                 emoji: '🍹' },
  'drinks-sem-alcool':{ nome: 'Drinks Sem Álcool',    emoji: '🧃' },
  'pra-criancada':    { nome: 'Pra Criançada',         emoji: '👶' },
  'pra-vovo-e-vovo':  { nome: 'Pra Vovô e Vovó',     emoji: '👴' },
  'a-galera-toda':    { nome: 'A Galera Toda',         emoji: '🎉' },
};

// ─── Helpers ─────────────────────────────────────────────────────

function slugParaTitulo(nicho) {
  const meta = NICHOS_META[nicho];
  return meta ? `${meta.emoji} ${meta.nome}` : nicho;
}

function slugParaNome(nicho) {
  const meta = NICHOS_META[nicho];
  return meta ? meta.nome : nicho;
}

function gerarDescricaoNicho(nicho, totalReceitas) {
  const nome = slugParaNome(nicho);
  return `${totalReceitas} receitas para quem está na situação "${nome}". Sorteia uma agora no NaFome — rápidas, baratas e com personalidade.`;
}

function gerarHTML(nicho, receitas) {
  const titulo    = slugParaTitulo(nicho);
  const nome      = slugParaNome(nicho);
  const descricao = gerarDescricaoNicho(nicho, receitas.length);
  const canonical = `${BASE_URL}/${nicho}/`;
  const sorteioURL = `${BASE_URL}/?nicho=${nicho}`;

  const receitasHTML = receitas.map(r => {
    const ingredientes = Array.isArray(r.ingredientes)
      ? r.ingredientes.map(i => `<li>${i}</li>`).join('\n              ')
      : '';

    const passos = Array.isArray(r.modoPreparo)
      ? r.modoPreparo.map(p => `<li>${p}</li>`).join('\n              ')
      : '';

    const badges = [
      r.tempo       ? `<span class="badge">⏱ ${r.tempo}</span>`       : '',
      r.dificuldade ? `<span class="badge">📊 ${r.dificuldade}</span>` : '',
      r.preco       ? `<span class="badge">💰 ${r.preco}</span>`       : '',
      r.porcoes     ? `<span class="badge">👤 ${r.porcoes}</span>`     : '',
    ].filter(Boolean).join('\n          ');

    return `
    <article class="receita-card" id="${r.slug || ''}">
      <h2 class="receita-titulo">${r.titulo || 'Receita'}</h2>
      <p class="receita-desc">${r.descricao || ''}</p>
      <div class="receita-badges">
          ${badges}
      </div>
      <div class="receita-cols">
        <div>
          <h3>🛒 Ingredientes</h3>
          <ul class="ingredientes">
              ${ingredientes}
          </ul>
        </div>
        <div>
          <h3>👨‍🍳 Modo de Preparo</h3>
          <ol class="preparo">
              ${passos}
          </ol>
        </div>
      </div>
      ${r.dica ? `<div class="receita-dica">💡 <strong>Dica:</strong> ${r.dica}</div>` : ''}
    </article>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titulo} — Receitas NaFome</title>
  <meta name="description" content="${descricao}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonical}">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${titulo} — Receitas NaFome">
  <meta property="og:description" content="${descricao}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${BASE_URL}/og-image.jpg">

  <!-- Schema.org -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "${titulo} — NaFome",
    "description": "${descricao}",
    "url": "${canonical}",
    "isPartOf": {
      "@type": "WebSite",
      "name": "NaFome",
      "url": "${BASE_URL}"
    }
  }
  <\/script>

  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍳</text></svg>">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #0f0f0f;
      color: #e8e8e8;
      line-height: 1.6;
    }

    a { color: #ff6b35; text-decoration: none; }
    a:hover { text-decoration: underline; }

    .topbar {
      background: #1a1a1a;
      border-bottom: 2px solid #ff6b35;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }

    .logo {
      font-size: 22px;
      font-weight: 800;
      color: #fff;
    }

    .logo span { color: #ff6b35; }

    .btn-sortear {
      background: #ff6b35;
      color: #fff;
      padding: 10px 22px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 15px;
      white-space: nowrap;
      transition: background 0.2s, transform 0.2s;
      display: inline-block;
    }

    .btn-sortear:hover {
      background: #e55a25;
      transform: scale(1.03);
      text-decoration: none;
    }

    .hero {
      text-align: center;
      padding: 40px 20px 24px;
      max-width: 700px;
      margin: 0 auto;
    }

    .hero h1 {
      font-size: clamp(24px, 5vw, 38px);
      font-weight: 800;
      color: #fff;
      margin-bottom: 10px;
    }

    .hero p {
      color: #aaa;
      font-size: 15px;
    }

    .hero .count {
      display: inline-block;
      margin-top: 12px;
      background: #1e1e1e;
      border: 1px solid #333;
      border-radius: 20px;
      padding: 4px 14px;
      font-size: 13px;
      color: #ff6b35;
      font-weight: 600;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 0 20px 60px;
    }

    .receita-card {
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      border-radius: 16px;
      padding: 28px;
      margin-bottom: 24px;
      transition: border-color 0.2s;
    }

    .receita-card:hover {
      border-color: #ff6b35;
    }

    .receita-titulo {
      font-size: 20px;
      font-weight: 800;
      color: #fff;
      margin-bottom: 8px;
      line-height: 1.3;
    }

    .receita-desc {
      color: #aaa;
      font-size: 14px;
      margin-bottom: 14px;
    }

    .receita-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 20px;
    }

    .badge {
      background: #252525;
      border: 1px solid #333;
      border-radius: 20px;
      padding: 4px 12px;
      font-size: 12px;
      color: #ccc;
    }

    .receita-cols {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 16px;
    }

    @media (max-width: 600px) {
      .receita-cols { grid-template-columns: 1fr; }
    }

    .receita-cols h3 {
      font-size: 14px;
      font-weight: 700;
      color: #ff6b35;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .ingredientes, .preparo {
      font-size: 14px;
      color: #ccc;
      padding-left: 18px;
    }

    .ingredientes li, .preparo li {
      margin-bottom: 6px;
    }

    .receita-dica {
      background: #252525;
      border-left: 3px solid #ff6b35;
      border-radius: 0 8px 8px 0;
      padding: 12px 16px;
      font-size: 13px;
      color: #bbb;
      margin-top: 4px;
    }

    .cta-box {
      background: linear-gradient(135deg, #ff6b35 0%, #e55a25 100%);
      border-radius: 16px;
      padding: 32px;
      text-align: center;
      margin: 40px 0;
    }

    .cta-box h2 {
      font-size: 22px;
      font-weight: 800;
      color: #fff;
      margin-bottom: 8px;
    }

    .cta-box p {
      color: rgba(255,255,255,0.85);
      margin-bottom: 20px;
      font-size: 15px;
    }

    .btn-cta {
      background: #fff;
      color: #ff6b35;
      padding: 12px 28px;
      border-radius: 10px;
      font-weight: 800;
      font-size: 16px;
      display: inline-block;
      transition: transform 0.2s;
    }

    .btn-cta:hover {
      transform: scale(1.04);
      text-decoration: none;
      color: #e55a25;
    }

    footer {
      text-align: center;
      padding: 24px 20px;
      color: #555;
      font-size: 13px;
      border-top: 1px solid #222;
    }

    footer a { color: #ff6b35; }
  </style>
</head>
<body>

  <nav class="topbar">
    <a href="${BASE_URL}" class="logo">Na<span>Fome</span> 🍳</a>
    <a href="${sorteioURL}" class="btn-sortear">🎲 Sortear receita de ${nome}</a>
  </nav>

  <div class="hero">
    <h1>${titulo}</h1>
    <p>${descricao}</p>
    <span class="count">${receitas.length} receitas disponíveis</span>
  </div>

  <div class="container">

    <div class="cta-box">
      <h2>Quer ser surpreendido?</h2>
      <p>Clica no botão e a máquina sorteia uma receita de ${nome} pra você agora.</p>
      <a href="${sorteioURL}" class="btn-cta">🎰 Girar o sorteio!</a>
    </div>

    ${receitasHTML}

    <div class="cta-box">
      <h2>Gostou? Sorteia outra!</h2>
      <p>Mais de 1.700 receitas te esperando. Cada giro é uma surpresa.</p>
      <a href="${BASE_URL}" class="btn-cta">🍳 Ver todos os nichos</a>
    </div>

  </div>

  <footer>
    <a href="${BASE_URL}">NaFome</a> — Feito pra quem tá com fome e sem ideia 🍽️
  </footer>

</body>
</html>`;
}

// ─── Main ─────────────────────────────────────────────────────────

function main() {
  console.log('🍳 NaFome — Gerador de Páginas Estáticas\n');

  if (!fs.existsSync(RECEITAS_DIR)) {
    console.error(`❌ Pasta não encontrada: ${RECEITAS_DIR}`);
    console.error('   Rode o script na raiz do projeto.');
    process.exit(1);
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const arquivos = fs.readdirSync(RECEITAS_DIR).filter(f => f.endsWith('.json'));
  let totalPaginas = 0;
  let totalReceitas = 0;

  arquivos.forEach(arquivo => {
    const nicho = arquivo.replace('.json', '');
    const filePath = path.join(RECEITAS_DIR, arquivo);

    let receitas = [];
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      receitas = JSON.parse(raw);
      if (!Array.isArray(receitas)) {
        console.warn(`⚠️  ${arquivo} — não é um array, pulando.`);
        return;
      }
    } catch (e) {
      console.warn(`⚠️  ${arquivo} — erro ao ler JSON: ${e.message}`);
      return;
    }

    if (receitas.length === 0) {
      console.warn(`⚠️  ${nicho} — sem receitas, pulando.`);
      return;
    }

    const pastaDestino = path.join(OUTPUT_DIR, nicho);
    if (!fs.existsSync(pastaDestino)) {
      fs.mkdirSync(pastaDestino, { recursive: true });
    }

    const html = gerarHTML(nicho, receitas);
    fs.writeFileSync(path.join(pastaDestino, 'index.html'), html, 'utf8');

    console.log(`✅ ${nicho} — ${receitas.length} receitas → pages/${nicho}/index.html`);
    totalPaginas++;
    totalReceitas += receitas.length;
  });

  console.log(`\n🎉 Concluído!`);
  console.log(`   ${totalPaginas} páginas geradas`);
  console.log(`   ${totalReceitas} receitas indexáveis`);
  console.log(`\n📁 Pasta de saída: ${OUTPUT_DIR}`);
  console.log(`\n🚀 Próximo passo: git add pages/ && git commit -m "feat: páginas estáticas por nicho" && git push`);
}

main();
