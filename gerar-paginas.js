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

// Mapa de SEO por nicho: título H1 e meta description otimizados
const NICHOS_SEO = {
  'cafe-da-manha': {
    h1: '☀️ Receitas de Café da Manhã Fáceis e Rápidas',
    desc: (n) => `${n} receitas de café da manhã fáceis, rápidas e gostosas. O que fazer pro café da manhã hoje? Sorteia uma ideia agora no NaFome.`,
  },
  'almoco': {
    h1: '🍽️ Receitas de Almoço Fáceis e Baratas',
    desc: (n) => `${n} receitas de almoço fáceis e baratas para fazer hoje. O que cozinhar no almoço? Sorteia uma receita rápida agora no NaFome.`,
  },
  'lanche-da-tarde': {
    h1: '🥪 Receitas de Lanche da Tarde Rápidas',
    desc: (n) => `${n} ideias de lanche da tarde gostosas e fáceis de fazer. O que comer no lanche? Sorteia uma receita agora no NaFome.`,
  },
  'jantar': {
    h1: '🌙 Receitas de Jantar Fáceis e Rápidas',
    desc: (n) => `${n} receitas de jantar fáceis, rápidas e saborosas. O que fazer pro jantar hoje? Sorteia uma ideia agora no NaFome.`,
  },
  'madrugada': {
    h1: '🦉 O Que Comer de Madrugada — Receitas Rápidas',
    desc: (n) => `${n} receitas para comer de madrugada. Tá com fome e não tem nada? Sorteia uma receita rápida de madrugada agora no NaFome.`,
  },
  'to-duro': {
    h1: '🪙 Receitas Baratas para Quando Tá Duro',
    desc: (n) => `${n} receitas baratas e fáceis para quando o dinheiro tá curto. Comida boa com pouco dinheiro. Sorteia uma receita agora no NaFome.`,
  },
  'final-do-mes': {
    h1: '💸 Receitas Baratas para o Final do Mês',
    desc: (n) => `${n} receitas baratas para o fim do mês. O que fazer pra comer com pouco dinheiro? Comida fácil e barata — sorteia agora no NaFome.`,
  },
  'recebi-hoje': {
    h1: '💰 Receitas Gostosas para Quando Recebeu o Salário',
    desc: (n) => `${n} receitas para caprichar quando o dinheiro chegou. Recebeu hoje? Sorteia uma receita especial agora no NaFome.`,
  },
  'gourmet': {
    h1: '💎 Receitas Gourmet para Fazer em Casa',
    desc: (n) => `${n} receitas gourmet para impressionar em casa. Culinária sofisticada e fácil de fazer. Sorteia uma receita especial agora no NaFome.`,
  },
  'detox': {
    h1: '🥒 Receitas Detox Saudáveis e Fáceis',
    desc: (n) => `${n} receitas detox saudáveis e gostosas. Quer comer saudável hoje? Sorteia uma receita detox fácil agora no NaFome.`,
  },
  'to-de-dieta': {
    h1: '🥑 Receitas para Dieta — Saudáveis e Fáceis',
    desc: (n) => `${n} receitas saudáveis para quem tá de dieta. Comida leve, gostosa e fácil de fazer. Sorteia uma receita fit agora no NaFome.`,
  },
  'vegano': {
    h1: '🌱 Receitas Veganas Fáceis e Gostosas',
    desc: (n) => `${n} receitas veganas fáceis e saborosas para fazer em casa. O que comer sendo vegano? Sorteia uma receita vegana agora no NaFome.`,
  },
  'vegetariano': {
    h1: '🥗 Receitas Vegetarianas Fáceis e Rápidas',
    desc: (n) => `${n} receitas vegetarianas fáceis, rápidas e gostosas. O que comer sendo vegetariano? Sorteia uma ideia agora no NaFome.`,
  },
  'sem-gluten': {
    h1: '🌾 Receitas Sem Glúten Fáceis e Saborosas',
    desc: (n) => `${n} receitas sem glúten fáceis de fazer em casa. Comida boa sem glúten para o dia a dia. Sorteia uma receita agora no NaFome.`,
  },
  'sem-lactose': {
    h1: '🥛 Receitas Sem Lactose Fáceis e Gostosas',
    desc: (n) => `${n} receitas sem lactose saborosas e fáceis. Intolerante à lactose? Sorteia uma receita sem lactose agora no NaFome.`,
  },
  'pre-treino': {
    h1: '🔋 Receitas Pré-Treino — O Que Comer Antes de Treinar',
    desc: (n) => `${n} receitas pré-treino para ter energia na academia. O que comer antes de treinar? Sorteia uma receita agora no NaFome.`,
  },
  'pos-treino': {
    h1: '💪 Receitas Pós-Treino — O Que Comer Depois de Treinar',
    desc: (n) => `${n} receitas pós-treino para recuperar depois da academia. O que comer depois de treinar? Sorteia uma receita agora no NaFome.`,
  },
  'ganhar-massa': {
    h1: '🏋️ Receitas para Ganhar Massa Muscular',
    desc: (n) => `${n} receitas para ganhar massa muscular com comida de verdade. Dieta para hipertrofia fácil e saborosa. Sorteia agora no NaFome.`,
  },
  'em-15-minutos': {
    h1: '⏱️ Receitas Rápidas em até 15 Minutos',
    desc: (n) => `${n} receitas prontas em 15 minutos ou menos. Sem tempo pra cozinhar? Sorteia uma receita ultra rápida agora no NaFome.`,
  },
  'uma-panela-so': {
    h1: '🫕 Receitas de Uma Panela Só — Fáceis e Práticas',
    desc: (n) => `${n} receitas feitas em uma panela só. Sem bagunça, sem louça. Sorteia uma receita prática agora no NaFome.`,
  },
  'na-air-fryer': {
    h1: '💨 Receitas na Air Fryer — Fáceis e Rápidas',
    desc: (n) => `${n} receitas fáceis na air fryer. Frango, batata, bolo e mais — tudo na air fryer. Sorteia uma receita agora no NaFome.`,
  },
  'no-micro-ondas': {
    h1: '📡 Receitas no Micro-ondas — Rápidas e Fáceis',
    desc: (n) => `${n} receitas práticas no micro-ondas. Comida boa sem fogão em minutos. Sorteia uma receita no micro-ondas agora no NaFome.`,
  },
  'no-forno': {
    h1: '🔆 Receitas de Forno Fáceis e Gostosas',
    desc: (n) => `${n} receitas de forno fáceis para fazer em casa. Assados, gratinados e bolos — sorteia uma receita de forno agora no NaFome.`,
  },
  'sem-fogao': {
    h1: '🚫 Receitas Sem Fogão — Fáceis e Práticas',
    desc: (n) => `${n} receitas sem fogão para fazer em casa. Sem fogo, sem complicação. Sorteia uma receita sem fogão agora no NaFome.`,
  },
  'sem-sujar-louca': {
    h1: '🙏 Receitas Sem Sujar Louça — Práticas e Rápidas',
    desc: (n) => `${n} receitas que não sujam louça. Comer bem sem lavar nada depois. Sorteia uma receita prática agora no NaFome.`,
  },
  'nao-sei-cozinhar': {
    h1: '😬 Receitas para Quem Não Sabe Cozinhar',
    desc: (n) => `${n} receitas para iniciantes na cozinha. Passo a passo fácil para quem nunca cozinhou. Sorteia uma receita simples agora no NaFome.`,
  },
  'final-de-semana': {
    h1: '😎 Receitas para o Final de Semana',
    desc: (n) => `${n} receitas gostosas para fazer no final de semana. Capricha no sábado e domingo com essas ideias. Sorteia agora no NaFome.`,
  },
  'churrasco': {
    h1: '🔥 Receitas de Churrasco para Fazer em Casa',
    desc: (n) => `${n} receitas de churrasco em casa. Carnes, acompanhamentos e petiscos para o churrasco perfeito. Sorteia agora no NaFome.`,
  },
  'boteco-em-casa': {
    h1: '🍺 Receitas de Boteco para Fazer em Casa',
    desc: (n) => `${n} receitas de petisco e boteco para fazer em casa. Tira-gostos fáceis e gostosos. Sorteia uma receita de boteco agora no NaFome.`,
  },
  'vendo-o-fut': {
    h1: '⚽ Receitas para Comer Vendo Futebol',
    desc: (n) => `${n} receitas e petiscos para comer vendo futebol. Lanches e tira-gostos perfeitos pro jogo. Sorteia agora no NaFome.`,
  },
  'jantar-romantico': {
    h1: '🕯️ Receitas de Jantar Romântico para Fazer em Casa',
    desc: (n) => `${n} receitas de jantar romântico para impressionar em casa. Jantar especial a dois fácil de preparar. Sorteia agora no NaFome.`,
  },
  'pra-impressionar': {
    h1: '🎩 Receitas para Impressionar — Sofisticadas e Fáceis',
    desc: (n) => `${n} receitas para impressionar visitas e convidados. Comida especial e sofisticada fácil de fazer. Sorteia agora no NaFome.`,
  },
  'piquenique': {
    h1: '🧺 Receitas para Piquenique — Fáceis e Práticas',
    desc: (n) => `${n} receitas fáceis para piquenique. Comida prática para levar ao parque ou praia. Sorteia uma ideia agora no NaFome.`,
  },
  'natal': {
    h1: '🎄 Receitas de Natal Fáceis para Fazer em Casa',
    desc: (n) => `${n} receitas de natal fáceis e tradicionais. Ceia de natal simples e gostosa para a família. Sorteia uma receita natalina agora no NaFome.`,
  },
  'ano-novo': {
    h1: '🥂 Receitas para o Ano Novo — Ceia Fácil e Gostosa',
    desc: (n) => `${n} receitas para a ceia de ano novo. Pratos e petiscos para a virada. Sorteia uma receita de réveillon agora no NaFome.`,
  },
  'pascoa': {
    h1: '🐣 Receitas de Páscoa Fáceis para Fazer em Casa',
    desc: (n) => `${n} receitas de páscoa fáceis. Ovo de páscoa caseiro, bacalhau e mais. Sorteia uma receita de páscoa agora no NaFome.`,
  },
  'to-doente': {
    h1: '🤒 Receitas para Quando Tá Doente — Leves e Fáceis',
    desc: (n) => `${n} receitas leves para quando tá doente. Caldos, sopas e comidas que ajudam a recuperar. Sorteia uma receita agora no NaFome.`,
  },
  'de-ressaca': {
    h1: '🤢 Receitas de Ressaca — O Que Comer na Ressaca',
    desc: (n) => `${n} receitas para ressaca. O que comer na ressaca para se sentir melhor? Caldos, sopas e comidas que salvam. Sorteia agora no NaFome.`,
  },
  'to-com-frio': {
    h1: '🥶 Receitas para o Frio — Sopas, Caldos e Comidas Quentes',
    desc: (n) => `${n} receitas quentinhas para o frio. Sopas, caldos e pratos que aquecem. O que comer no frio? Sorteia agora no NaFome.`,
  },
  'fast-food-caseiro': {
    h1: '🍔 Receitas de Fast Food Caseiro — Hambúrguer, Pizza e Mais',
    desc: (n) => `${n} receitas de fast food caseiro. Hambúrguer, batata frita, pizza e mais — feitos em casa. Sorteia uma receita agora no NaFome.`,
  },
  'comida-de-rua': {
    h1: '🥙 Receitas de Comida de Rua para Fazer em Casa',
    desc: (n) => `${n} receitas de comida de rua para fazer em casa. Tapioca, churros, pastel e mais. Sorteia uma receita agora no NaFome.`,
  },
  'comida-regional': {
    h1: '🍛 Receitas de Comida Regional Brasileira',
    desc: (n) => `${n} receitas de comida regional brasileira. Pratos típicos do Norte, Nordeste, Sul e Sudeste. Sorteia uma receita regional agora no NaFome.`,
  },
  'frutos-do-mar': {
    h1: '🦐 Receitas de Frutos do Mar Fáceis e Gostosas',
    desc: (n) => `${n} receitas de frutos do mar fáceis de fazer em casa. Camarão, peixe, lula e mais. Sorteia uma receita agora no NaFome.`,
  },
  'sobremesa': {
    h1: '🍫 Receitas de Sobremesa Fáceis e Rápidas',
    desc: (n) => `${n} receitas de sobremesa fáceis e rápidas. Bolo, pudim, mousse e mais. Sorteia uma receita de sobremesa agora no NaFome.`,
  },
  'cafe': {
    h1: '☕ Receitas com Café — Bebidas e Doces',
    desc: (n) => `${n} receitas com café. Bebidas geladas, bolos, doces e mais. Sorteia uma receita com café agora no NaFome.`,
  },
  'drinks': {
    h1: '🍹 Receitas de Drinks — Coquetéis Fáceis para Fazer em Casa',
    desc: (n) => `${n} receitas de drinks e coquetéis para fazer em casa. Caipirinha, mojito e mais. Sorteia uma receita de drink agora no NaFome.`,
  },
  'drinks-sem-alcool': {
    h1: '🧃 Receitas de Drinks Sem Álcool — Refrescantes e Fáceis',
    desc: (n) => `${n} receitas de drinks sem álcool para fazer em casa. Sucos, vitaminas e mocktails gostosos. Sorteia agora no NaFome.`,
  },
  'pra-criancada': {
    h1: '👶 Receitas para Crianças — Fáceis e Saudáveis',
    desc: (n) => `${n} receitas fáceis e gostosas para crianças. Comida saudável que a criançada adora. Sorteia uma receita infantil agora no NaFome.`,
  },
  'pra-vovo-e-vovo': {
    h1: '👴 Receitas para Idosos — Fáceis, Leves e Saborosas',
    desc: (n) => `${n} receitas leves e fáceis para idosos. Comida saborosa e saudável para vovô e vovó. Sorteia uma receita agora no NaFome.`,
  },
  'a-galera-toda': {
    h1: '🎉 Receitas para Muita Gente — Fáceis e Econômicas',
    desc: (n) => `${n} receitas para fazer para muita gente. Comida fácil, gostosa e econômica para reunião e festa. Sorteia agora no NaFome.`,
  },
};

function gerarSEO(nicho, totalReceitas) {
  const seo = NICHOS_SEO[nicho];
  if (seo) {
    return {
      h1: seo.h1,
      desc: seo.desc(totalReceitas),
    };
  }
  // fallback genérico
  const nome = slugParaNome(nicho);
  return {
    h1: slugParaTitulo(nicho),
    desc: `${totalReceitas} receitas para ${nome}. Rápidas, baratas e fáceis de fazer. Sorteia uma agora no NaFome.`,
  };
}

function gerarHTML(nicho, receitas) {
  const seo      = gerarSEO(nicho, receitas.length);
  const titulo   = seo.h1;
  const nome     = slugParaNome(nicho);
  const descricao = seo.desc;
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
  <title>${titulo} | NaFome</title>
  <meta name="description" content="${descricao}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonical}">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${titulo} | NaFome">
  <meta property="og:description" content="${descricao}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${BASE_URL}/og-image.jpg">

  <!-- Schema.org -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "${titulo} | NaFome",
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
      background: #f7f7f7;
      color: #1a1a1a;
      line-height: 1.6;
    }

    a { color: #ff6b35; text-decoration: none; }
    a:hover { text-decoration: underline; }

    /* ── Anúncio ── */
    .ad-banner {
      width: 100%;
      min-height: 90px;
      background: #f0f0f0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid #e0e0e0;
      padding: 8px 0;
    }
    .ad-banner.ad-bottom {
      border-bottom: none;
      border-top: 1px solid #e0e0e0;
      margin-top: 32px;
    }
    .ad-label {
      font-size: 10px;
      color: #aaa;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }

    /* ── Topbar ── */
    .topbar {
      background: #fff;
      border-bottom: 2px solid #ff6b35;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }

    .logo {
      font-size: 22px;
      font-weight: 800;
      color: #1a1a1a;
      text-decoration: none;
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

    /* ── Hero ── */
    .hero {
      text-align: center;
      padding: 40px 20px 24px;
      max-width: 700px;
      margin: 0 auto;
    }

    .hero h1 {
      font-size: clamp(24px, 5vw, 38px);
      font-weight: 800;
      color: #1a1a1a;
      margin-bottom: 10px;
    }

    .hero p {
      color: #666;
      font-size: 15px;
    }

    .hero .count {
      display: inline-block;
      margin-top: 12px;
      background: #fff;
      border: 1.5px solid #ff6b35;
      border-radius: 20px;
      padding: 4px 14px;
      font-size: 13px;
      color: #ff6b35;
      font-weight: 600;
    }

    /* ── Container ── */
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 0 20px 60px;
    }

    /* ── Cards de receita ── */
    .receita-card {
      background: #fff;
      border: 1px solid #e8e8e8;
      border-radius: 16px;
      padding: 28px;
      margin-bottom: 24px;
      transition: border-color 0.2s, box-shadow 0.2s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }

    .receita-card:hover {
      border-color: #ff6b35;
      box-shadow: 0 4px 16px rgba(255,107,53,0.12);
    }

    .receita-titulo {
      font-size: 20px;
      font-weight: 800;
      color: #1a1a1a;
      margin-bottom: 8px;
      line-height: 1.3;
    }

    .receita-desc {
      color: #666;
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
      background: #f5f5f5;
      border: 1px solid #e0e0e0;
      border-radius: 20px;
      padding: 4px 12px;
      font-size: 12px;
      color: #555;
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
      color: #444;
      padding-left: 18px;
    }

    .ingredientes li, .preparo li {
      margin-bottom: 6px;
    }

    .receita-dica {
      background: #fff8f5;
      border-left: 3px solid #ff6b35;
      border-radius: 0 8px 8px 0;
      padding: 12px 16px;
      font-size: 13px;
      color: #555;
      margin-top: 4px;
    }

    /* ── Anúncio inline entre receitas ── */
    .ad-inline {
      background: #f0f0f0;
      border: 1px dashed #ddd;
      border-radius: 12px;
      min-height: 100px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
      padding: 12px;
    }

    /* ── CTA box ── */
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

    /* ── Footer ── */
    footer {
      text-align: center;
      padding: 24px 20px;
      color: #888;
      font-size: 13px;
      border-top: 1px solid #e8e8e8;
    }

    footer a { color: #ff6b35; }
  </style>
</head>
<body>

  <!-- Anúncio topo -->
  <div class="ad-banner ad-top">
    <span class="ad-label">publicidade</span>
    <!-- Cole aqui o código do Google AdSense quando aprovado -->
  </div>

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

    <!-- Anúncio inline -->
    <div class="ad-inline">
      <span class="ad-label">publicidade</span>
      <!-- Cole aqui o código do Google AdSense quando aprovado -->
    </div>

    ${receitasHTML}

    <div class="cta-box">
      <h2>Gostou? Sorteia outra!</h2>
      <p>Mais de 2.000 receitas te esperando. Cada giro é uma surpresa.</p>
      <a href="${BASE_URL}" class="btn-cta">🍳 Ver todos os nichos</a>
    </div>

  </div>

  <!-- Anúncio rodapé -->
  <div class="ad-banner ad-bottom">
    <span class="ad-label">publicidade</span>
    <!-- Cole aqui o código do Google AdSense quando aprovado -->
  </div>

  <footer>
    <a href="${BASE_URL}">NaFome</a> — Feito pra quem tá com fome e sem ideia 🍽️ &middot;
    <a href="${BASE_URL}">Ver todos os nichos</a>
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
