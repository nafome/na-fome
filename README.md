# 🍳 NaFome

> **"Tô com fome. O que eu faço?"** — O NaFome responde.

Plataforma web de descoberta aleatória de receitas, organizada por **situações reais do dia a dia**.  
O diferencial não é só a receita — é o humor, a personalidade e a aleatoriedade de um sorteio que transforma a dúvida de "o que comer hoje?" numa experiência divertida.

---

## ✨ Como funciona

1. **Escolha sua situação** — são mais de 50 nichos temáticos (tô duro, de ressaca, pré-treino, jantar romântico...)
2. **Gire o slot** — uma animação sorteia uma receita dentro daquele nicho
3. **Cozinha (ou não)** — cada receita tem ingredientes, modo de preparo e uma dica bem-humorada do chef

---

## 🎯 Diferenciais

- **Humor estilo stand-up** — as receitas têm personalidade, não são só listas frias de ingredientes
- **Aleatoriedade real** — o sorteio é o ponto central da experiência, não um filtro de busca
- **Situacional** — os nichos refletem contexto emocional, financeiro e social, não apenas tipo de prato
- **Mobile-first** — interface leve, tátil e fluida para quem decide o que comer no celular antes de abrir a geladeira
- **Zero dependências** — HTML, CSS e JS puro; sem frameworks, sem build, sem burocracia

---

## 🗂️ Nichos disponíveis

Os nichos são agrupados por contexto. Cada um possui seu próprio arquivo JSON de receitas em `data/receitas/`.

### 🕐 Horário / Refeição
| Nicho | ID |
|---|---|
| Café da manhã ☀️ | `cafe-da-manha` |
| Almoço 🍽️ | `almoco` |
| Lanche da tarde 🥪 | `lanche-da-tarde` |
| Jantar 🌙 | `jantar` |
| Madrugada 🦉 | `madrugada` |

### 💸 Situação Financeira
| Nicho | ID |
|---|---|
| Tô duro 🪙 | `to-duro` |
| Final do mês 💸 | `final-do-mes` |
| Recebi hoje 💰 | `recebi-hoje` |
| Gourmet 💎 | `gourmet` |

### 🥗 Saúde / Dieta / Treino
| Nicho | ID |
|---|---|
| Detox 🥒 | `detox` |
| Tô de dieta 🥑 | `to-de-dieta` |
| Vegano 🌱 | `vegano` |
| Vegetariano 🥗 | `vegetariano` |
| Sem glúten 🌾 | `sem-gluten` |
| Sem lactose 🥛 | `sem-lactose` |
| Pré-treino 🔋 | `pre-treino` |
| Pós-treino 💪 | `pos-treino` |
| Ganhar massa 🏋️ | `ganhar-massa` |

### 🍳 Jeito de Cozinhar / Equipamento
| Nicho | ID |
|---|---|
| Em 15 minutos ⏱️ | `em-15-minutos` |
| Uma panela só 🫕 | `uma-panela-so` |
| Na Air Fryer 💨 | `na-air-fryer` |
| No micro-ondas 📡 | `no-micro-ondas` |
| No forno 🔆 | `no-forno` |
| Sem fogão 🚫🔥 | `sem-fogao` |
| Sem sujar louça 🙏 | `sem-sujar-louca` |
| Não sei cozinhar 😬 | `nao-sei-cozinhar` |

### 🎉 Ocasião / Momento
| Nicho | ID |
|---|---|
| Final de semana 😎 | `final-de-semana` |
| Churrasco 🔥 | `churrasco` |
| Boteco em casa 🍺 | `boteco-em-casa` |
| Vendo o fut ⚽ | `vendo-o-fut` |
| Cinema 🎬 | `cinema` |
| Jantar romântico 🕯️ | `jantar-romantico` |
| Pra impressionar 🎩 | `pra-impressionar` |
| Piquenique 🧺 | `piquenique` |
| Natal 🎄 | `natal` |
| Ano Novo 🥂 | `ano-novo` |
| Páscoa 🐣 | `pascoa` |

### 🤒 Estado Físico
| Nicho | ID |
|---|---|
| Tô doente 🤒 | `to-doente` |
| De ressaca 🤢 | `de-ressaca` |
| Tô com frio 🥶 | `to-com-frio` |

### 🍔 Tipo de Comida
| Nicho | ID |
|---|---|
| Fast food caseiro 🍔 | `fast-food-caseiro` |
| Comida de rua 🥙 | `comida-de-rua` |
| Comida regional 🍛 | `comida-regional` |
| Frutos do mar 🦐 | `frutos-do-mar` |
| Sobremesa 🍫 | `sobremesa` |

### 🍹 Bebidas
| Nicho | ID |
|---|---|
| Café ☕ | `cafe` |
| Drinks 🍹 | `drinks` |
| Drinks sem álcool 🧃 | `drinks-sem-alcool` |

### 👨‍👩‍👧 Público
| Nicho | ID |
|---|---|
| Pra criançada 👶 | `pra-criancada` |
| Pra vovô e vovó 👴 | `pra-vovo-e-vovo` |
| A galera toda 🎉 | `a-galera-toda` |

### 💀 Especiais
| Nicho | ID |
|---|---|
| Receita de famosos ⭐ | `receita-de-famosos` |
| Última refeição ☠️🔒 | `ultima-refeicao` |

---

## 📁 Estrutura de Arquivos

```txt
nafome/
├── index.html                    # Estrutura principal da aplicação
├── css/
│   └── style.css                 # Estilos globais e responsividade
├── js/
│   └── script.js                 # Lógica de sorteio, renderização e URL sharing
├── data/
│   ├── slug-index.json           # Índice slug → arquivo de nicho (para deep linking)
│   └── receitas/
│       ├── cafe-da-manha.json
│       ├── almoco.json
│       ├── to-duro.json
│       └── ...                   # Um arquivo por nicho
└── README.md
```

---

## 🧩 Estrutura de uma Receita (JSON)

Cada arquivo de nicho é um array de receitas com o seguinte schema:

```json
{
  "slug": "ovo-mexido-cremoso",
  "titulo": "Ovo Mexido Cremoso",
  "categoria": "Café da manhã",
  "descricao": "O clássico que salva qualquer manhã sem inspiração.",
  "tempo": "10 min",
  "preco": "Baratinho",
  "dificuldade": "Fácil",
  "porcoes": "1 pessoa",
  "ingredientes": [
    "2 ovos",
    "1 colher de manteiga",
    "Sal e pimenta a gosto"
  ],
  "modoPreparo": [
    "Quebre os ovos numa tigela e bata levemente.",
    "Aqueça a manteiga em fogo baixo.",
    "Adicione os ovos e mexa devagar até cremoso."
  ],
  "dica": "Fogo baixo é o segredo. Alta temperatura é crime contra a humanidade."
}
```

---

## 🔗 Deep Linking

Toda receita sorteada gera uma URL compartilhável no formato:

```
https://nafome.github.io/na-fome/?receita=slug-da-receita
```

O `slug-index.json` mapeia cada slug ao arquivo de nicho correspondente, permitindo carregar qualquer receita diretamente pela URL sem varrer todos os arquivos.

---

## 🚀 Stack

| Camada | Tecnologia |
|---|---|
| Frontend | HTML5 |
| Estilização | CSS3 |
| Lógica | JavaScript Vanilla |
| Dados | JSON estático |
| Hospedagem | GitHub Pages |
| Versionamento | Git + GitHub |

---

## 🤝 Contribuindo com receitas

Quer adicionar receitas a um nicho ou criar um nicho novo?

1. Faça um fork do repositório
2. Adicione ou edite o arquivo JSON correspondente em `data/receitas/`
3. Se for um nicho novo, adicione a entrada em `NICHOS` no `script.js` e registre os slugs no `slug-index.json`
4. Abra um Pull Request com o nome do nicho no título

> As receitas devem seguir o espírito do projeto: simples, acessíveis, com personalidade. Receitas chatas não passam no code review.

---

## 📄 Licença

MIT — faça o que quiser, mas não tire o humor das receitas.
