/**
 * NaFome — Gerador de Páginas Estáticas (SEO)
 *
 * Uso:   node gerar-paginas.js      (rode na raiz do projeto)
 *
 * Gera, a partir de data/receitas/*.json:
 *   /[nicho]/index.html              página-índice do nicho (links p/ cada receita)
 *   /receita/[slug]/index.html       página individual com schema Recipe
 *   /css/paginas.css                 CSS compartilhado (não repete em cada página)
 *   /sitemap.xml  e  /robots.txt
 *   /links-nichos.snippet.html       bloco de links p/ colar na home
 *
 * Depois: git add . && git commit -m "seo: paginas de nicho e receita" && git push
 */

const fs   = require('fs');
const path = require('path');

// ─── Configuração ────────────────────────────────────────────────
const BASE_URL     = 'https://nafome.com.br';
const ROOT         = __dirname;
const RECEITAS_DIR = path.join(ROOT, 'data', 'receitas');
const OG_IMAGE     = `${BASE_URL}/og-image.jpg`;   // precisa existir (1200x630)
const EXCLUIR      = ['ultima-refeicao'];          // nichos que NÃO devem ser indexados
// ────────────────────────────────────────────────────────────────

// [slug, emoji, nome, h1, descrição ({n} = total de receitas)]
const NICHOS = [
  ['cafe-da-manha','☀️','Café da Manhã','Receitas de Café da Manhã Fáceis e Rápidas','{n} receitas de café da manhã fáceis, rápidas e gostosas. O que fazer pro café da manhã hoje? Sorteia uma ideia agora no NaFome.'],
  ['almoco','🍽️','Almoço','Receitas de Almoço Fáceis e Baratas','{n} receitas de almoço fáceis e baratas para fazer hoje. O que cozinhar no almoço? Sorteia uma receita rápida agora no NaFome.'],
  ['lanche-da-tarde','🥪','Lanche da Tarde','Receitas de Lanche da Tarde Rápidas','{n} ideias de lanche da tarde gostosas e fáceis de fazer. O que comer no lanche? Sorteia uma receita agora no NaFome.'],
  ['jantar','🌙','Jantar','Receitas de Jantar Fáceis e Rápidas','{n} receitas de jantar fáceis, rápidas e saborosas. O que fazer pro jantar hoje? Sorteia uma ideia agora no NaFome.'],
  ['madrugada','🦉','Madrugada','O Que Comer de Madrugada — Receitas Rápidas','{n} receitas para comer de madrugada. Tá com fome e não tem nada? Sorteia uma receita rápida agora no NaFome.'],
  ['to-duro','🪙','Tô Duro','Receitas Baratas para Quando Tá Duro','{n} receitas baratas e fáceis para quando o dinheiro tá curto. Comida boa com pouco dinheiro. Sorteia uma receita agora no NaFome.'],
  ['final-do-mes','💸','Final do Mês','Receitas Baratas para o Final do Mês','{n} receitas baratas para o fim do mês. O que fazer pra comer com pouco dinheiro? Sorteia agora no NaFome.'],
  ['recebi-hoje','💰','Recebi Hoje','Receitas Gostosas para Quando Recebeu o Salário','{n} receitas para caprichar quando o dinheiro chegou. Recebeu hoje? Sorteia uma receita especial agora no NaFome.'],
  ['gourmet','💎','Gourmet','Receitas Gourmet para Fazer em Casa','{n} receitas gourmet para impressionar em casa. Culinária sofisticada e fácil de fazer. Sorteia agora no NaFome.'],
  ['detox','🥒','Detox','Receitas Detox Saudáveis e Fáceis','{n} receitas detox saudáveis e gostosas. Quer comer saudável hoje? Sorteia uma receita detox fácil agora no NaFome.'],
  ['to-de-dieta','🥑','Tô de Dieta','Receitas para Dieta — Saudáveis e Fáceis','{n} receitas saudáveis para quem tá de dieta. Comida leve, gostosa e fácil de fazer. Sorteia uma receita fit agora no NaFome.'],
  ['vegano','🌱','Vegano','Receitas Veganas Fáceis e Gostosas','{n} receitas veganas fáceis e saborosas para fazer em casa. O que comer sendo vegano? Sorteia uma receita agora no NaFome.'],
  ['vegetariano','🥗','Vegetariano','Receitas Vegetarianas Fáceis e Rápidas','{n} receitas vegetarianas fáceis, rápidas e gostosas. O que comer sendo vegetariano? Sorteia uma ideia agora no NaFome.'],
  ['sem-gluten','🌾','Sem Glúten','Receitas Sem Glúten Fáceis e Saborosas','{n} receitas sem glúten fáceis de fazer em casa. Comida boa sem glúten para o dia a dia. Sorteia uma receita agora no NaFome.'],
  ['sem-lactose','🥛','Sem Lactose','Receitas Sem Lactose Fáceis e Gostosas','{n} receitas sem lactose saborosas e fáceis. Intolerante à lactose? Sorteia uma receita agora no NaFome.'],
  ['pre-treino','🔋','Pré-Treino','Receitas Pré-Treino — O Que Comer Antes de Treinar','{n} receitas pré-treino para ter energia na academia. O que comer antes de treinar? Sorteia uma receita agora no NaFome.'],
  ['pos-treino','💪','Pós-Treino','Receitas Pós-Treino — O Que Comer Depois de Treinar','{n} receitas pós-treino para recuperar depois da academia. O que comer depois de treinar? Sorteia uma receita agora no NaFome.'],
  ['ganhar-massa','🏋️','Ganhar Massa','Receitas para Ganhar Massa Muscular','{n} receitas para ganhar massa muscular com comida de verdade. Dieta para hipertrofia fácil e saborosa. Sorteia agora no NaFome.'],
  ['em-15-minutos','⏱️','Em 15 Minutos','Receitas Rápidas em até 15 Minutos','{n} receitas prontas em 15 minutos ou menos. Sem tempo pra cozinhar? Sorteia uma receita ultra rápida agora no NaFome.'],
  ['uma-panela-so','🫕','Uma Panela Só','Receitas de Uma Panela Só — Fáceis e Práticas','{n} receitas feitas em uma panela só. Sem bagunça, sem louça. Sorteia uma receita prática agora no NaFome.'],
  ['na-air-fryer','💨','Na Air Fryer','Receitas na Air Fryer — Fáceis e Rápidas','{n} receitas fáceis na air fryer. Frango, batata, bolo e mais — tudo na air fryer. Sorteia uma receita agora no NaFome.'],
  ['no-micro-ondas','📡','No Micro-ondas','Receitas no Micro-ondas — Rápidas e Fáceis','{n} receitas práticas no micro-ondas. Comida boa sem fogão em minutos. Sorteia uma receita no micro-ondas agora no NaFome.'],
  ['no-forno','🔆','No Forno','Receitas de Forno Fáceis e Gostosas','{n} receitas de forno fáceis para fazer em casa. Assados, gratinados e bolos — sorteia uma receita de forno agora no NaFome.'],
  ['sem-fogao','🚫','Sem Fogão','Receitas Sem Fogão — Fáceis e Práticas','{n} receitas sem fogão para fazer em casa. Sem fogo, sem complicação. Sorteia uma receita sem fogão agora no NaFome.'],
  ['sem-sujar-louca','🙏','Sem Sujar Louça','Receitas Sem Sujar Louça — Práticas e Rápidas','{n} receitas que não sujam louça. Comer bem sem lavar nada depois. Sorteia uma receita prática agora no NaFome.'],
  ['nao-sei-cozinhar','😬','Não Sei Cozinhar','Receitas para Quem Não Sabe Cozinhar','{n} receitas para iniciantes na cozinha. Passo a passo fácil para quem nunca cozinhou. Sorteia uma receita simples agora no NaFome.'],
  ['final-de-semana','😎','Final de Semana','Receitas para o Final de Semana','{n} receitas gostosas para fazer no final de semana. Capricha no sábado e domingo com essas ideias. Sorteia agora no NaFome.'],
  ['churrasco','🔥','Churrasco','Receitas de Churrasco para Fazer em Casa','{n} receitas de churrasco em casa. Carnes, acompanhamentos e petiscos para o churrasco perfeito. Sorteia agora no NaFome.'],
  ['boteco-em-casa','🍺','Boteco em Casa','Receitas de Boteco para Fazer em Casa','{n} receitas de petisco e boteco para fazer em casa. Tira-gostos fáceis e gostosos. Sorteia uma receita de boteco agora no NaFome.'],
  ['vendo-o-fut','⚽','Vendo o Fut','Receitas para Comer Vendo Futebol','{n} receitas e petiscos para comer vendo futebol. Lanches e tira-gostos perfeitos pro jogo. Sorteia agora no NaFome.'],
  ['jantar-romantico','🕯️','Jantar Romântico','Receitas de Jantar Romântico para Fazer em Casa','{n} receitas de jantar romântico para impressionar em casa. Jantar especial a dois fácil de preparar. Sorteia agora no NaFome.'],
  ['pra-impressionar','🎩','Pra Impressionar','Receitas para Impressionar — Sofisticadas e Fáceis','{n} receitas para impressionar visitas e convidados. Comida especial e sofisticada fácil de fazer. Sorteia agora no NaFome.'],
  ['piquenique','🧺','Piquenique','Receitas para Piquenique — Fáceis e Práticas','{n} receitas fáceis para piquenique. Comida prática para levar ao parque ou praia. Sorteia uma ideia agora no NaFome.'],
  ['natal','🎄','Natal','Receitas de Natal Fáceis para Fazer em Casa','{n} receitas de natal fáceis e tradicionais. Ceia de natal simples e gostosa para a família. Sorteia uma receita natalina agora no NaFome.'],
  ['ano-novo','🥂','Ano Novo','Receitas para o Ano Novo — Ceia Fácil e Gostosa','{n} receitas para a ceia de ano novo. Pratos e petiscos para a virada. Sorteia uma receita de réveillon agora no NaFome.'],
  ['pascoa','🐣','Páscoa','Receitas de Páscoa Fáceis para Fazer em Casa','{n} receitas de páscoa fáceis. Ovo de páscoa caseiro, bacalhau e mais. Sorteia uma receita de páscoa agora no NaFome.'],
  ['to-doente','🤒','Tô Doente','Receitas para Quando Tá Doente — Leves e Fáceis','{n} receitas leves para quando tá doente. Caldos, sopas e comidas que ajudam a recuperar. Sorteia uma receita agora no NaFome.'],
  ['de-ressaca','🤢','De Ressaca','Receitas de Ressaca — O Que Comer na Ressaca','{n} receitas para ressaca. O que comer na ressaca para se sentir melhor? Caldos, sopas e comidas que salvam. Sorteia agora no NaFome.'],
  ['to-com-frio','🥶','Tô com Frio','Receitas para o Frio — Sopas, Caldos e Comidas Quentes','{n} receitas quentinhas para o frio. Sopas, caldos e pratos que aquecem. O que comer no frio? Sorteia agora no NaFome.'],
  ['fast-food-caseiro','🍔','Fast Food Caseiro','Receitas de Fast Food Caseiro — Hambúrguer, Pizza e Mais','{n} receitas de fast food caseiro. Hambúrguer, batata frita, pizza e mais — feitos em casa. Sorteia uma receita agora no NaFome.'],
  ['comida-de-rua','🥙','Comida de Rua','Receitas de Comida de Rua para Fazer em Casa','{n} receitas de comida de rua para fazer em casa. Tapioca, churros, pastel e mais. Sorteia uma receita agora no NaFome.'],
  ['comida-regional','🍛','Comida Regional','Receitas de Comida Regional Brasileira','{n} receitas de comida regional brasileira. Pratos típicos do Norte, Nordeste, Sul e Sudeste. Sorteia uma receita regional agora no NaFome.'],
  ['frutos-do-mar','🦐','Frutos do Mar','Receitas de Frutos do Mar Fáceis e Gostosas','{n} receitas de frutos do mar fáceis de fazer em casa. Camarão, peixe, lula e mais. Sorteia uma receita agora no NaFome.'],
  ['sobremesa','🍫','Sobremesa','Receitas de Sobremesa Fáceis e Rápidas','{n} receitas de sobremesa fáceis e rápidas. Bolo, pudim, mousse e mais. Sorteia uma receita de sobremesa agora no NaFome.'],
  ['cafe','☕','Café','Receitas com Café — Bebidas e Doces','{n} receitas com café. Bebidas geladas, bolos, doces e mais. Sorteia uma receita com café agora no NaFome.'],
  ['drinks','🍹','Drinks','Receitas de Drinks — Coquetéis Fáceis para Fazer em Casa','{n} receitas de drinks e coquetéis para fazer em casa. Caipirinha, mojito e mais. Sorteia uma receita de drink agora no NaFome.'],
  ['drinks-sem-alcool','🧃','Drinks Sem Álcool','Receitas de Drinks Sem Álcool — Refrescantes e Fáceis','{n} receitas de drinks sem álcool para fazer em casa. Sucos, vitaminas e mocktails gostosos. Sorteia agora no NaFome.'],
  ['pra-criancada','👶','Pra Criançada','Receitas para Crianças — Fáceis e Saudáveis','{n} receitas fáceis e gostosas para crianças. Comida saudável que a criançada adora. Sorteia uma receita infantil agora no NaFome.'],
  ['pra-vovo-e-vovo','👴','Pra Vovô e Vovó','Receitas para Idosos — Fáceis, Leves e Saborosas','{n} receitas leves e fáceis para idosos. Comida saborosa e saudável para vovô e vovó. Sorteia uma receita agora no NaFome.'],
  ['a-galera-toda','🎉','A Galera Toda','Receitas para Muita Gente — Fáceis e Econômicas','{n} receitas para fazer para muita gente. Comida fácil, gostosa e econômica para reunião e festa. Sorteia agora no NaFome.'],
];

const META = {};
NICHOS.forEach(([slug, emoji, nome, h1, desc]) => { META[slug] = { emoji, nome, h1, desc }; });

// ─── Helpers ─────────────────────────────────────────────────────
const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const jsonLd = o => JSON.stringify(o).replace(/</g, '\\u003c');

const corta = (s, n = 155) =>
  s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…';

const slugify = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function isoDuracao(t) {
  if (!t) return undefined;
  const s = String(t).toLowerCase();
  let h = 0, m = 0, x;
  if ((x = s.match(/(\d+)\s*h\w*\s*(\d+)/))) { h = +x[1]; m = +x[2]; }
  else {
    if ((x = s.match(/(\d+)\s*h/)))   h = +x[1];
    if ((x = s.match(/(\d+)\s*min/))) m = +x[1];
    if (!h && !m && (x = s.match(/\d+/))) m = +x[0];
  }
  if (!h && !m) return undefined;
  return `PT${h ? h + 'H' : ''}${m ? m + 'M' : ''}`;
}

function nichoInfo(nicho, total) {
  const m = META[nicho];
  if (m) return { emoji: m.emoji, nome: m.nome, h1: m.h1, desc: m.desc.replace('{n}', total) };
  const nome = nicho.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return { emoji: '🍳', nome, h1: `Receitas de ${nome}`,
    desc: `${total} receitas de ${nome}. Rápidas, baratas e fáceis de fazer. Sorteia uma agora no NaFome.` };
}

function escreve(rel, conteudo) {
  const destino = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, conteudo, 'utf8');
}

// ─── Templates ───────────────────────────────────────────────────
const CSS = `*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;background:#f7f7f7;color:#1a1a1a;line-height:1.6}
a{color:#ff6b35;text-decoration:none}a:hover{text-decoration:underline}
.ad-banner{width:100%;min-height:90px;background:#f0f0f0;display:flex;flex-direction:column;align-items:center;justify-content:center;border-bottom:1px solid #e0e0e0;padding:8px 0}
.ad-banner.ad-bottom{border-bottom:none;border-top:1px solid #e0e0e0;margin-top:32px}
.ad-label{font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
.topbar{background:#fff;border-bottom:2px solid #ff6b35;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.logo{font-size:22px;font-weight:800;color:#1a1a1a}.logo span{color:#ff6b35}
.btn-sortear{background:#ff6b35;color:#fff;padding:10px 22px;border-radius:10px;font-weight:700;font-size:15px;white-space:nowrap;display:inline-block}
.btn-sortear:hover{background:#e55a25;text-decoration:none}
.container{max-width:900px;margin:0 auto;padding:0 20px 60px}
.breadcrumb{font-size:13px;color:#888;padding:18px 0 0}
.breadcrumb a{color:#888}.breadcrumb span{margin:0 6px}
.hero{text-align:center;padding:32px 0 20px}
.hero h1{font-size:clamp(24px,5vw,36px);font-weight:800;margin-bottom:10px;line-height:1.25}
.hero p{color:#666;font-size:15px}
.count{display:inline-block;margin-top:12px;background:#fff;border:1.5px solid #ff6b35;border-radius:20px;padding:4px 14px;font-size:13px;color:#ff6b35;font-weight:600}
.receita-card{background:#fff;border:1px solid #e8e8e8;border-radius:16px;padding:24px 28px;margin-bottom:16px;box-shadow:0 2px 8px rgba(0,0,0,.04)}
.receita-card:hover{border-color:#ff6b35;box-shadow:0 4px 16px rgba(255,107,53,.12)}
.receita-titulo{font-size:19px;font-weight:800;line-height:1.3;margin-bottom:6px}
.receita-titulo a{color:#1a1a1a}.receita-titulo a:hover{color:#ff6b35;text-decoration:none}
.receita-desc{color:#666;font-size:14px;margin-bottom:12px}
.receita-badges{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:6px}
.badge{background:#f5f5f5;border:1px solid #e0e0e0;border-radius:20px;padding:4px 12px;font-size:12px;color:#555}
.receita-pagina{background:#fff;border:1px solid #e8e8e8;border-radius:16px;padding:28px;margin-bottom:24px}
.receita-cols{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:20px 0 16px}
@media(max-width:600px){.receita-cols{grid-template-columns:1fr}}
.receita-cols h2{font-size:14px;font-weight:700;color:#ff6b35;margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px}
.ingredientes,.preparo{font-size:15px;color:#444;padding-left:20px}
.ingredientes li,.preparo li{margin-bottom:8px}
.receita-dica{background:#fff8f5;border-left:3px solid #ff6b35;border-radius:0 8px 8px 0;padding:12px 16px;font-size:14px;color:#555}
.relacionadas h2{font-size:18px;font-weight:800;margin:32px 0 14px}
.relacionadas ul{list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:10px}
@media(max-width:600px){.relacionadas ul{grid-template-columns:1fr}}
.relacionadas a{display:block;background:#fff;border:1px solid #e8e8e8;border-radius:12px;padding:12px 16px;font-weight:600;font-size:14px;color:#1a1a1a}
.relacionadas a:hover{border-color:#ff6b35;text-decoration:none}
.cta-box{background:linear-gradient(135deg,#ff6b35,#e55a25);border-radius:16px;padding:32px;text-align:center;margin:32px 0}
.cta-box h2{font-size:22px;font-weight:800;color:#fff;margin-bottom:8px}
.cta-box p{color:rgba(255,255,255,.88);margin-bottom:20px;font-size:15px}
.btn-cta{background:#fff;color:#ff6b35;padding:12px 28px;border-radius:10px;font-weight:800;font-size:16px;display:inline-block}
.btn-cta:hover{text-decoration:none;color:#e55a25}
footer{text-align:center;padding:24px 20px;color:#888;font-size:13px;border-top:1px solid #e8e8e8}
`;

function head({ title, desc, canonical, schemas }) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:site_name" content="NaFome">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${OG_IMAGE}">
  <meta name="twitter:card" content="summary_large_image">
${schemas.map(s => `  <script type="application/ld+json">${jsonLd(s)}</script>`).join('\n')}
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍳</text></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/paginas.css">
</head>
<body>
  <div class="ad-banner ad-top"><span class="ad-label">publicidade</span><!-- AdSense topo --></div>
  <nav class="topbar">
    <a href="${BASE_URL}/" class="logo">Na<span>Fome</span> 🍳</a>
    <a href="${BASE_URL}/" class="btn-sortear">🎲 Sortear receita</a>
  </nav>
`;
}

const FOOT = `
  <div class="ad-banner ad-bottom"><span class="ad-label">publicidade</span><!-- AdSense rodapé --></div>
  <footer>
    <a href="${BASE_URL}/">NaFome</a> — Feito pra quem tá com fome e sem ideia 🍽️
  </footer>
</body>
</html>`;

function badges(r) {
  return [
    r.tempo       && `⏱ ${r.tempo}`,
    r.dificuldade && `📊 ${r.dificuldade}`,
    r.preco       && `💰 ${r.preco}`,
    r.porcoes     && `👤 ${r.porcoes}`,
  ].filter(Boolean).map(b => `<span class="badge">${esc(b)}</span>`).join('\n        ');
}

function paginaNicho(nicho, receitas) {
  const info = nichoInfo(nicho, receitas.length);
  const canonical = `${BASE_URL}/${nicho}/`;
  const title = `${info.h1} | NaFome`;

  const schemas = [
    {
      '@context': 'https://schema.org', '@type': 'CollectionPage',
      name: info.h1, description: info.desc, url: canonical, inLanguage: 'pt-BR',
      isPartOf: { '@type': 'WebSite', name: 'NaFome', url: BASE_URL },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: receitas.map((r, i) => ({
          '@type': 'ListItem', position: i + 1, url: `${BASE_URL}/receita/${r._slug}/`, name: r.titulo,
        })),
      },
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'NaFome', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: info.nome, item: canonical },
      ],
    },
  ];

  const cards = receitas.map(r => `
    <article class="receita-card">
      <h2 class="receita-titulo"><a href="/receita/${r._slug}/">${esc(r.titulo)}</a></h2>
      <p class="receita-desc">${esc(r.descricao)}</p>
      <div class="receita-badges">
        ${badges(r)}
      </div>
    </article>`).join('\n');

  return head({ title, desc: corta(info.desc), canonical, schemas }) + `
  <main class="container">
    <nav class="breadcrumb" aria-label="Você está em"><a href="${BASE_URL}/">NaFome</a><span>›</span>${esc(info.nome)}</nav>
    <header class="hero">
      <h1>${info.emoji} ${esc(info.h1)}</h1>
      <p>${esc(info.desc)}</p>
      <span class="count">${receitas.length} receitas disponíveis</span>
    </header>

    <div class="cta-box">
      <h2>Quer ser surpreendido?</h2>
      <p>A máquina sorteia uma receita de ${esc(info.nome)} pra você agora.</p>
      <a href="${BASE_URL}/?nicho=${nicho}" class="btn-cta">🎰 Girar o sorteio!</a>
    </div>

    ${cards}
  </main>
` + FOOT;
}

function paginaReceita(r, nicho, irmas) {
  const info = nichoInfo(nicho, 0);
  const canonical = `${BASE_URL}/receita/${r._slug}/`;
  const nichoURL = `${BASE_URL}/${nicho}/`;

  const extra = [r.tempo && `pronta em ${r.tempo}`, r.dificuldade && `dificuldade ${String(r.dificuldade).toLowerCase()}`]
    .filter(Boolean).join(', ');
  const desc = corta(`${r.descricao || ''} Receita de ${info.nome}${extra ? ': ' + extra : ''}. Ingredientes e modo de preparo no NaFome.`.trim());
  const title = `${r.titulo} | Receita ${info.nome} | NaFome`;

  const ingredientes = Array.isArray(r.ingredientes) ? r.ingredientes : [];
  const passos = Array.isArray(r.modoPreparo) ? r.modoPreparo : [];
  const tempoISO = isoDuracao(r.tempo);

  const schemas = [
    {
      '@context': 'https://schema.org', '@type': 'Recipe',
      name: r.titulo, description: r.descricao || desc,
      image: [OG_IMAGE], inLanguage: 'pt-BR', url: canonical,
      mainEntityOfPage: canonical,
      author: { '@type': 'Organization', name: 'NaFome', url: BASE_URL },
      recipeCategory: r.categoria || info.nome, recipeCuisine: 'Brasileira',
      keywords: `${r.titulo}, receita ${info.nome.toLowerCase()}, receita fácil`,
      prepTime: tempoISO, totalTime: tempoISO,
      recipeYield: r.porcoes || undefined,
      recipeIngredient: ingredientes,
      recipeInstructions: passos.map((p, i) => ({ '@type': 'HowToStep', position: i + 1, text: p })),
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'NaFome', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: info.nome, item: nichoURL },
        { '@type': 'ListItem', position: 3, name: r.titulo, item: canonical },
      ],
    },
  ];

  const relacionadas = irmas.length ? `
    <section class="relacionadas">
      <h2>Mais receitas de ${esc(info.nome)}</h2>
      <ul>
        ${irmas.map(i => `<li><a href="/receita/${i._slug}/">${esc(i.titulo)}</a></li>`).join('\n        ')}
      </ul>
    </section>` : '';

  return head({ title, desc, canonical, schemas }) + `
  <main class="container">
    <nav class="breadcrumb" aria-label="Você está em"><a href="${BASE_URL}/">NaFome</a><span>›</span><a href="/${nicho}/">${esc(info.nome)}</a><span>›</span>${esc(r.titulo)}</nav>

    <article class="receita-pagina" style="margin-top:20px">
      <h1 style="font-size:clamp(24px,5vw,32px);font-weight:800;line-height:1.25;margin-bottom:10px">${esc(r.titulo)}</h1>
      <p class="receita-desc">${esc(r.descricao)}</p>
      <div class="receita-badges">
        ${badges(r)}
      </div>
      <div class="receita-cols">
        <section>
          <h2>🛒 Ingredientes</h2>
          <ul class="ingredientes">
            ${ingredientes.map(i => `<li>${esc(i)}</li>`).join('\n            ')}
          </ul>
        </section>
        <section>
          <h2>👨‍🍳 Modo de Preparo</h2>
          <ol class="preparo">
            ${passos.map(p => `<li>${esc(p)}</li>`).join('\n            ')}
          </ol>
        </section>
      </div>
      ${r.dica ? `<div class="receita-dica">💡 <strong>Dica:</strong> ${esc(r.dica)}</div>` : ''}
    </article>

    <div class="cta-box">
      <h2>Sem vontade de fazer essa?</h2>
      <p>Sorteia outra receita de ${esc(info.nome)} em um clique.</p>
      <a href="${BASE_URL}/?nicho=${nicho}" class="btn-cta">🎲 Sortear outra</a>
    </div>
    ${relacionadas}
  </main>
` + FOOT;
}

// ─── Main ────────────────────────────────────────────────────────
function main() {
  console.log('🍳 NaFome — Gerador de Páginas Estáticas (SEO)\n');

  if (!fs.existsSync(RECEITAS_DIR)) {
    console.error(`❌ Pasta não encontrada: ${RECEITAS_DIR}\n   Rode o script na raiz do projeto.`);
    process.exit(1);
  }

  const arquivos = fs.readdirSync(RECEITAS_DIR).filter(f => f.endsWith('.json')).sort();
  const slugsUsados = new Set();
  const nichosOk = [];   // { nicho, receitas }

  for (const arquivo of arquivos) {
    const nicho = arquivo.replace('.json', '');
    if (EXCLUIR.includes(nicho)) { console.log(`⏭️  ${nicho} — excluído`); continue; }

    let receitas;
    try {
      receitas = JSON.parse(fs.readFileSync(path.join(RECEITAS_DIR, arquivo), 'utf8'));
    } catch (e) { console.warn(`⚠️  ${arquivo} — JSON inválido: ${e.message}`); continue; }
    if (!Array.isArray(receitas) || !receitas.length) { console.warn(`⚠️  ${nicho} — vazio, pulando`); continue; }

    // Garante slug único e estável em todo o site
    const validas = [];
    for (const r of receitas) {
      if (!r || !r.titulo) continue;
      let slug = r.slug ? slugify(r.slug) : slugify(r.titulo);
      if (!slug) continue;
      if (slugsUsados.has(slug)) {
        console.warn(`   ↳ slug repetido ignorado: ${slug} (em ${nicho})`);
        continue;
      }
      slugsUsados.add(slug);
      validas.push({ ...r, _slug: slug });
    }
    if (validas.length) nichosOk.push({ nicho, receitas: validas });
  }

  // CSS compartilhado
  escreve('css/paginas.css', CSS);

  // Páginas
  let totalReceitas = 0;
  for (const { nicho, receitas } of nichosOk) {
    escreve(`${nicho}/index.html`, paginaNicho(nicho, receitas));

    receitas.forEach((r, idx) => {
      // até 4 receitas "irmãs" (as seguintes na lista) para link interno
      const irmas = [];
      for (let k = 1; k < receitas.length && irmas.length < 4; k++) {
        irmas.push(receitas[(idx + k) % receitas.length]);
      }
      escreve(`receita/${r._slug}/index.html`, paginaReceita(r, nicho, irmas));
    });

    totalReceitas += receitas.length;
    console.log(`✅ ${nicho} — ${receitas.length} receitas`);
  }

  // Sitemap
  const hoje = new Date().toISOString().split('T')[0];
  const urls = [`${BASE_URL}/`];
  nichosOk.forEach(({ nicho, receitas }) => {
    urls.push(`${BASE_URL}/${nicho}/`);
    receitas.forEach(r => urls.push(`${BASE_URL}/receita/${r._slug}/`));
  });
  escreve('sitemap.xml',
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc><lastmod>${hoje}</lastmod></url>`).join('\n')}
</urlset>
`);

  // robots.txt
  escreve('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${BASE_URL}/sitemap.xml\n`);

  // Bloco de links para a home (HTML puro, rastreável)
  const links = nichosOk.map(({ nicho }) => {
    const i = nichoInfo(nicho, 0);
    return `    <li><a href="/${nicho}/">${i.emoji} ${esc(i.nome)}</a></li>`;
  }).join('\n');
  escreve('links-nichos.snippet.html',
`<!-- Cole este bloco no index.html, logo antes do <footer> -->
<nav class="todos-nichos" aria-label="Receitas por situação" style="max-width:900px;margin:32px auto;padding:0 20px;text-align:center">
  <h2 style="font-size:18px;margin-bottom:12px">Receitas por situação</h2>
  <ul style="list-style:none;display:flex;flex-wrap:wrap;gap:8px 16px;justify-content:center;font-size:14px">
${links}
  </ul>
</nav>
`);

  console.log(`\n🎉 Concluído!`);
  console.log(`   ${nichosOk.length} páginas de nicho`);
  console.log(`   ${totalReceitas} páginas de receita`);
  console.log(`   ${urls.length} URLs no sitemap.xml`);
  console.log(`\n📌 Falta: colar links-nichos.snippet.html na home e o redirect no <head> (veja instruções).`);
}

main();
