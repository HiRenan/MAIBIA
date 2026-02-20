# ⚔️ DevQuest — Gamified Career Intelligence Platform

> *An RPG-themed interactive portfolio that transforms a developer's career into a gamified quest system.*

> *Um portfolio interativo com tema RPG que transforma a carreira de um desenvolvedor em um sistema gamificado de quests.*

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Three.js-r182-000000?style=for-the-badge&logo=threedotjs&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
</p>

**Aluno:** Renan Mocelin
**Disciplina:** IA Generativa — Avaliacao Intermediaria
**Entrega:** 20/02/2026

---

## Sumario

- [Links da Entrega](#-links-da-entrega)
- [Sobre o Projeto](#-sobre-o-projeto)
- [Telas do Sistema](#-telas-do-sistema)
- [Stack Tecnica](#-stack-tecnica)
- [Arquitetura](#-arquitetura)
- [Sistema de Gamificacao](#-sistema-de-gamificacao)
- [Sistema de Temas](#-sistema-de-temas)
- [API — Endpoints](#-api--endpoints)
- [Modelos de Dados](#-modelos-de-dados)
- [Como Rodar Localmente](#-como-rodar-localmente)
- [Troubleshooting Rapido](#-troubleshooting-rapido)
- [Deploy](#-deploy)
- [Escolhas de Design](#-escolhas-de-design)
- [O que Funcionou / Desafios](#-o-que-funcionou--desafios)
- [Documentacao do Agente](#-documentacao-do-agente)
- [Licenca](#-licenca)

---

## 🔗 Links da Entrega

- **Endpoint publico (Frontend):** `https://maib.com.br`
- **Endpoint publico (API/Health):** `https://maib.com.br/api/health`
- **Backend origin (Railway):** `https://maibia-production.up.railway.app/api/health`
- **Repositorio GitHub:** `https://github.com/HiRenan/MAIBIA`
- **LinkedIn:** `https://www.linkedin.com/in/renan-mocelin-br/`
- **GitHub (perfil):** `https://github.com/HiRenan`
- **Dev.to:** `https://dev.to/hirenan`


---

## 🏰 Sobre o Projeto

Portfolios tradicionais de desenvolvedores sao estaticos e genericos — listam tecnologias e projetos sem transmitir a jornada de crescimento profissional. DevQuest reimagina o portfolio como uma **aventura RPG**, onde cada aspecto da carreira eh mapeado para mecanicas de jogo:

| Conceito Real | Equivalente RPG | Tela |
|---------------|----------------|------|
| Projetos GitHub | Quests com raridade (Common → Legendary) | Quest Log |
| Habilidades tecnicas | Arvore de skills com 3 branches e 15 nos | Skill Tree |
| Marcos de carreira | Timeline cronologica com 15 entradas | Chronicle |
| Curriculo | Ficha de personagem com stats e radar chart | Guild Hall |
| Mentoria de IA | Oracle advisor com chat persistente | Oracle |
| Blog pessoal | Tavern Board com CRUD e categorias | Tavern Board |
| Progresso geral | XP, niveis, achievements e level-ups | Todo o sistema |

### Features Principais

- 🎮 **Gamificacao completa** — XP, niveis, 12 achievements, 4 stats RPG, level-up celebrations
- 🌳 **Skill Tree interativa** — SVG com 15 skills, 5 tiers, particulas animadas, conexoes entre nos
- 🐙 **GitHub API real** — Repos reais com estrelas, forks, linguagens e calculo de raridade
- 🤖 **Oracle AI** — Chat persistente com respostas context-aware baseadas no perfil do jogador
- 📄 **Analise de CV** — Upload de arquivo, mock analysis com score, secoes e dicas
- 🌗 **Dark/Light theme** — Toggle com transicoes suaves, persistencia em localStorage
- 📱 **100% responsivo** — Mobile, tablet e desktop com breakpoints otimizados
- ✨ **Animacoes avancadas** — Framer Motion (stagger, scroll, spring) + Three.js (particulas 3D)
- 🛡️ **Graceful degradation** — Frontend funciona standalone, API adiciona dados reais
- 📝 **Blog integrado** — CRUD completo com markdown, categorias, tags e pins

---

## 🗺️ Telas do Sistema

| # | Tela | Rota | Descricao |
|---|------|------|-----------|
| 1 | **Hero** | `/` | Landing page com avatar animado, stats, barra de XP e particulas 3D |
| 2 | **Skill Tree** | `/skills` | Arvore SVG interativa com 15 skills em 3 branches |
| 3 | **Quest Log** | `/quests` | Projetos GitHub reais com filtros, raridade e analise AI |
| 4 | **Chronicle** | `/chronicle` | Timeline de carreira com scroll animations |
| 5 | **Guild Hall** | `/guild` | Ficha RPG, upload de CV, radar chart e analise mock |
| 6 | **Oracle** | `/oracle` | Chat interativo com respostas context-aware |
| 7 | **Tavern Board** | `/tavern` | Blog com CRUD, markdown, categorias e social links |

<details>
<summary><strong>🏠 Hero — Landing Page</strong></summary>

A porta de entrada do DevQuest. Apresenta o jogador com:

- **Avatar animado** com borda brilhante (conic gradient rotativo + blur)
- **Efeito typewriter** no titulo
- **Stats cards** — Level, Total XP, Class com contadores animados
- **Barra de XP** com preenchimento animado e indicador de progresso
- **Achievement badges** — Mostra ate 6 conquistas desbloqueadas
- **CTA "Begin Your Quest"** — Leva ao Quest Log
- **Background 3D** — Particulas Three.js com parallax de mouse (via React Three Fiber)
- **Fallback data** — Funciona sem backend com dados hardcoded

</details>

<details>
<summary><strong>🌳 Skill Tree — Arvore de Habilidades</strong></summary>

Visualizacao interativa de 15 habilidades tecnicas organizadas em 3 branches:

- **Frontend Arcana** (roxo #8b5cf6) — React, TypeScript, Tailwind CSS, Three.js, Next.js
- **Backend Warfare** (azul #3b82f6) — Python, FastAPI, Node.js, SQL, Docker
- **Data Sorcery** (verde #22c55e) — Pandas, PostgreSQL, ETL Pipelines, Analytics, Machine Learning

**Features:**
- **SVG Tree (desktop)** — Layout radial com no central mostrando Power Score
- **Linhas animadas** conectando skills com particulas se movendo
- **Arcos de progresso** ao redor de cada no
- **Sistema de tiers** — Locked → Novice → Apprentice → Adept → Expert → Master
- **Painel de detalhes** — Level bar, XP contribution, projetos relacionados, proximo tier
- **Stats bar** — Skills Unlocked, Power Score, Skill Points, Strongest Branch
- **Filtros por branch** — Toggle de visualizacao por categoria
- **15+ icones SVG customizados** para cada tecnologia
- **Mobile view** — Lista accordion colapsavel (substitui SVG tree)

</details>

<details>
<summary><strong>📜 Quest Log — Projetos</strong></summary>

Showcase de projetos GitHub reais apresentados como quests de RPG:

**Sistema de Raridade:**
| Stars | Raridade | Cor |
|-------|----------|-----|
| 50+ | Legendary | Dourado |
| 20-49 | Epic | Roxo |
| 5-19 | Rare | Azul |
| 0-4 | Common | Cinza |

**Calculo de XP por Projeto:**
- Base: 100 XP
- +10 por star
- +15 por fork
- +25 se tem wiki
- Maximo: 500 XP

**Features:**
- **GitHub API real** — Busca repos do usuario `HiRenan` em tempo real
- **Fallback** — 6 projetos hardcoded se API indisponivel
- **Modos de visualizacao** — Grid (2 colunas + featured card) e List (compacto)
- **Filtros** — Por status (Active/Completed), raridade, linguagem, busca textual
- **Ordenacao** — Stars, XP, Nome, Data de atualizacao
- **Analise AI mock** — Score 0-100, breakdown por secao, strengths/improvements
- **Painel de detalhes** — Side panel com info completa (desktop)
- **Metricas** — Language breakdown, stars, forks, issues, tamanho do repo

</details>

<details>
<summary><strong>⏳ Chronicle — Timeline</strong></summary>

Linha do tempo cronologica da carreira com 15 entradas:

- **Layout alternado** — Cards esquerda/direita no desktop, alinhados a esquerda no mobile
- **Linha de progresso animada** — Cresce conforme scroll da pagina
- **Categorias** — Experience (6), Education (2), Awards (2 hackathons), Certifications (5)
- **Cada entrada mostra:**
  - Ano e periodo
  - Badge de categoria colorido
  - Duracao (ex: "2y")
  - Indicador "LIVE" para cargo atual
  - Titulo + local
  - Descricao expandivel
  - Tags de skills (aparecem ao expandir)
- **Stats bar** — Years Active (7+), Roles Held, Awards Won, Current Role
- **Skills Constellation** — Nuvem dinamica com as 24 skills mais frequentes
- **Grid de certificacoes** — Exibicao separada em 2 colunas

</details>

<details>
<summary><strong>⚔️ Guild Hall — Ficha de Personagem</strong></summary>

Central de character sheet e analise de CV:

**Coluna Esquerda — Character Sheet:**
- Avatar com iniciais e borda brilhante
- Nome, titulo, nivel com barra de XP
- **Radar chart** — Visualizacao 4 stats (STR, INT, DEX, WIS)
- Barras individuais de cada stat com cores
- **Titulos conquistados** — Achievements como badges
- **Equipment slots** — Skills agrupadas por branch com indicador de nivel

**Coluna Direita — CV Analysis:**
- **Zona de upload** — Drag-and-drop, preview de arquivo, max 5MB (PDF/DOC/DOCX)
- **Botao de analise** — Dispara mock analysis com loading spinner
- **Painel de resultados:**
  - Score Ring com cor baseada na nota
  - Breakdown por secao (6-10 secoes) com feedback individual
  - Chips de strengths e weaknesses
  - Lista de pro tips
- **Historico de analises** — Lista expandivel com analises anteriores
- **Download RPG CV** — Gera character sheet em texto para download

</details>

<details>
<summary><strong>🔮 Oracle — Chat AI</strong></summary>

Advisor de carreira com chat persistente e respostas context-aware:

- **Interface de chat** — Bubbles com avatares, efeito typewriter nas respostas, typing indicator
- **Suggestion chips** — 6 prompts rapidos: "How can I improve?", "Analyze my skills", "Career advice", etc.
- **Respostas context-aware** — Oracle usa perfil do jogador (nome, nivel, stats) e skills para personalizar respostas
- **25+ keywords** reconhecidas: improve, skill, learn, career, github, react, python, frontend, backend, etc.
- **Chat persistido** — Mensagens salvas no banco de dados com historico paginado
- **XP por interacao** — Cada pergunta rende 25 XP
- **Stats bar** — Messages Sent, Wisdom Score, Topics Explored, Oracle Level
- **Sidebar direita:**
  - **Weekly Scroll** — Resumo semanal com XP ganho, quests completas, skills praticadas
  - **Oracle Knowledge** — 6 topicos com hover effects e links para perguntar

</details>

<details>
<summary><strong>🍺 Tavern Board — Blog</strong></summary>

Hub de blog e conteudo com sistema CRUD completo:

- **4 posts pre-carregados:**
  - "Won ActInSpace Hackathon — 1st Place!" (pinned, achievement)
  - "Started AI Residency at SENAI/SC" (update)
  - "DevQuest: Building My Career as an RPG" (project)
  - "2nd Place at AKCIT Hackathon" (achievement)
- **Categorias** — Updates, Projects, Achievements, Thoughts (cada com cor propria)
- **Cards estilizados** — Badge de categoria, indicador de pinned, preview de conteudo
- **Suporte a markdown** — Renderizacao simplificada (headings, negrito e listas)
- **CRUD completo** — Criar, ler, atualizar e deletar posts
- **XP por criacao** — 75 XP ao criar um post
- **Social links** — Links para redes sociais

</details>

---

## 🛠️ Stack Tecnica

### Frontend

| Tecnologia | Versao | Motivo |
|------------|--------|--------|
| **React** | 19.2 | Hooks modernos, ecossistema maduro, renderizacao eficiente |
| **TypeScript** | 5.9 (strict) | Type safety, autocomplete, prevencao de bugs em compile-time |
| **Vite** | 7.3 | Dev server ultra-rapido, HMR instantaneo, build otimizado |
| **Tailwind CSS** | 4.1 | Utility-first com custom properties via `@theme`, dark/light mode |
| **Framer Motion** | 12.34 | Animacoes production-grade: stagger, scroll triggers, spring physics |
| **Three.js + R3F** | r182 | Background 3D com particulas, parallax de mouse |
| **React Router** | 7.13 | Roteamento declarativo com 7 rotas |
| **Lucide React** | 0.564 | Icones consistentes, tree-shakeable, leves |

### Backend

| Tecnologia | Motivo |
|------------|--------|
| **FastAPI** | Framework async em Python, auto-documentacao OpenAPI, type hints |
| **SQLModel** | ORM que combina SQLAlchemy + Pydantic — tipo-seguro e validado |
| **SQLite** | Zero configuracao, arquivo unico, perfeito para MVP |
| **httpx** | Cliente HTTP async para chamadas a API do GitHub |
| **python-multipart** | Suporte a upload de arquivos (CV) |
| **Uvicorn** | Servidor ASGI de alta performance com hot reload |

### Deploy

| Servico | Uso |
|---------|-----|
| **Vercel** | Frontend — CDN global, build automatico, SPA rewrites |
| **Railway** | Backend — Procfile-based, ASGI hosting, auto-deploy |

---

## 🏗️ Arquitetura

### Estrutura do Projeto

```
MAIBIA/
├── frontend/                          # React 19 + Vite + TypeScript
│   ├── src/
│   │   ├── pages/                     # 7 paginas + NotFound
│   │   │   ├── Hero.tsx               # Landing page com particulas 3D
│   │   │   ├── SkillTree.tsx          # Arvore SVG interativa
│   │   │   ├── QuestLog.tsx           # Projetos GitHub como quests
│   │   │   ├── Chronicle.tsx          # Timeline de carreira
│   │   │   ├── GuildHall.tsx          # Character sheet + CV analysis
│   │   │   ├── Oracle.tsx             # Chat AI advisor
│   │   │   ├── TavernBoard.tsx        # Blog CRUD
│   │   │   └── NotFound.tsx           # 404
│   │   ├── components/
│   │   │   ├── ui/                    # GlassCard, Modal, Badge, AnimatedCounter, PageHeader, SkeletonLoader
│   │   │   ├── layout/               # Navbar, Layout
│   │   │   └── 3d/                    # ParticleBackground (Three.js)
│   │   ├── contexts/
│   │   │   ├── ThemeContext.tsx        # Dark/Light theme provider
│   │   │   └── GamificationContext.tsx # XP toasts, achievements, level-ups
│   │   ├── services/
│   │   │   └── api.ts                 # Typed API client com error handling
│   │   ├── hooks/
│   │   │   └── useAPI.ts              # Hook de graceful degradation
│   │   ├── App.tsx                    # Router + providers
│   │   └── index.css                  # Tailwind v4 @theme + keyframes
│   ├── vite.config.ts                 # Proxy /api → localhost:8000
│   ├── vercel.json                    # SPA rewrite rules
│   └── package.json
│
├── backend/                           # FastAPI + SQLModel + SQLite
│   ├── app/
│   │   ├── routers/
│   │   │   ├── github.py              # GitHub API + raridade + XP
│   │   │   ├── gamification.py        # Profile, skills, achievements, timeline
│   │   │   ├── cv.py                  # Upload + mock analysis
│   │   │   ├── oracle.py              # Chat + history + stats
│   │   │   └── blog.py               # CRUD de posts
│   │   ├── services/
│   │   │   ├── mock_ai.py            # Respostas simuladas (sem LLM)
│   │   │   └── gamification_engine.py # XP, level-up, achievements, stats
│   │   ├── models.py                  # 7 tabelas SQLModel
│   │   ├── database.py                # SQLite config + session
│   │   ├── seed.py                    # Dados iniciais
│   │   └── main.py                    # FastAPI app + CORS + lifespan
│   ├── requirements.txt
│   └── Procfile                       # Railway deploy
│
├── data/                              # SQLite database (auto-criado)
├── CLAUDE.md                          # Convencoes do projeto
└── README.md                          # Esta documentacao
```

### Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                                                              │
│   useAPI(fetcher, fallback)                                  │
│       │                                                      │
│       ├── Retorna fallback imediatamente (UX instantanea)    │
│       ├── Faz fetch em background                            │
│       ├── Sucesso → substitui com dados reais                │
│       └── Falha → mantem fallback (graceful degradation)     │
│                                                              │
│   ThemeContext ──→ Dark/Light CSS variables                   │
│   GamificationContext ──→ Toasts, modals, celebrations       │
└──────────────────────┬──────────────────────────────────────┘
                       │ /api/* (Vite proxy em dev)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
│                                                              │
│   FastAPI ──→ 5 Routers ──→ Services ──→ SQLite             │
│                                                              │
│   github.py      → GitHub API (httpx) + fallback repos       │
│   gamification.py → Profile + Skills + Achievements + Stats  │
│   cv.py          → Upload + mock_ai.analyze_cv()             │
│   oracle.py      → Chat + mock_ai.oracle_chat() (context)   │
│   blog.py        → CRUD + gamification_engine.award_xp()     │
│                                                              │
│   gamification_engine.py:                                    │
│       award_xp() → aplica XP → verifica level-up            │
│                  → check_achievements() → unlock             │
│                  → recalculate_stats() → STR/INT/DEX/WIS     │
└─────────────────────────────────────────────────────────────┘
```

### Graceful Degradation

O padrao `useAPI<T>(fetcher, fallback)` garante que o frontend **sempre funciona**:

```typescript
// Hook retorna fallback imediatamente, substitui com dados reais se API responder
const { data, loading, error } = useAPI(fetchProfile, FALLBACK_PROFILE);
```

- **Sem backend** → Paginas renderizam com dados hardcoded
- **Com backend** → Dados reais do GitHub, perfil dinamico, chat persistido
- **API lenta** → Usuario ve conteudo imediatamente, dados atualizam quando chegam
- **API falha** → Fallback transparente, sem tela de erro

---

## 🎮 Sistema de Gamificacao

### XP e Niveis

O sistema de progressao funciona com XP acumulado e niveis crescentes:

- **Formula de level-up:** `xp_next_level = level × 1000`
- **Loop de level-up:** Enquanto `xp >= xp_next_level`, subtrai threshold e incrementa nivel
- **Estado inicial:** Level 15, XP 6450, proximo nivel em 10000 XP

**Acoes que concedem XP:**

| Acao | XP | Router |
|------|----|--------|
| Pergunta ao Oracle | 25 | oracle.py |
| Upload de CV | 100 | cv.py |
| Criar blog post | 75 | blog.py |

### Achievements (12 total)

**Pre-desbloqueados (8):**

| Achievement | Categoria | Icone |
|-------------|-----------|-------|
| First Commit | coding | git-branch |
| Polyglot | skills | code |
| Star Collector | social | star |
| Quest Master | quests | trophy |
| Bug Hunter | coding | flame |
| Code Wizard | skills | code |
| Shield Bearer | quality | shield |
| Quest Champion | quests | trophy |

**Dinamicos (4) — desbloqueados por acao:**

| Achievement | Condicao | Categoria |
|-------------|----------|-----------|
| Oracle Initiate | 1+ mensagem no chat | oracle |
| Oracle Sage | 20+ mensagens no chat | oracle |
| Scroll Keeper | 3+ blog posts | writing |
| CV Master | 1+ analise de CV | career |

### Stats RPG

Os 4 atributos do personagem sao **recalculados automaticamente** apos cada award de XP:

| Stat | Nome | Formula | Cap |
|------|------|---------|-----|
| **STR** | Problem Solving | `50 + (blog_posts × 3) + (achievements × 2)` | 100 |
| **INT** | Technical Knowledge | `50 + (soma_niveis_skills × 2)` | 100 |
| **DEX** | Adaptability | `50 + (acoes_distintas × 5) + (cv_analyses × 3)` | 100 |
| **WIS** | Soft Skills | `50 + oracle_messages + (oracle_level × 2)` | 100 |

> Stats nunca diminuem — a formula usa `max(atual, calculado)`.

### Skills (15 total, 3 branches)

| Branch | Cor | Skills | Niveis |
|--------|-----|--------|--------|
| **Frontend Arcana** | #8b5cf6 | React (4), TypeScript (4), Tailwind CSS (3), Three.js (2), Next.js (locked) | 0-5 |
| **Backend Warfare** | #3b82f6 | Python (4), FastAPI (3), Node.js (3), SQL (3), Docker (locked) | 0-5 |
| **Data Sorcery** | #22c55e | Pandas (3), PostgreSQL (3), ETL Pipelines (2), Analytics (2), ML (locked) | 0-5 |

**Tier System:** Locked → Novice (1) → Apprentice (2) → Adept (3) → Expert (4) → Master (5)

### Notificacoes e Celebracoes

- **Toast de XP** — Popup "+X XP" com icone Zap, auto-dismiss 4s
- **Toast de achievement** — Staggered (800ms entre cada), icone trophy, auto-dismiss 6s
- **Modal de level-up** — Full-screen com burst radial, estrela animada, numero grande com gradiente, auto-close 5s
- **Stack de toasts** — Maximo 3 visiveis, spring animation, canto superior direito

---

## 🌗 Sistema de Temas

### Dark Mode (Padrao)

Estetica dark fantasy com tons escuros e acentos dourados:

```
Background:  #0a0a1a (primario), #12122a (secundario), #1a1a3e (cards)
Borders:     #2a2a5a (sutil)
Acentos:     #f0c040 (dourado), #8b5cf6 (roxo), #3b82f6 (azul), #22c55e (verde)
Texto:       #e2e8f0 (primario), #94a3b8 (secundario)
Efeitos:     Glassmorphism, conic gradients, glow effects
```

### Light Mode

Estetica de pergaminho medieval com tons quentes:

```
Background:  #f5f0e8 (parchment), tons beige
Texto:       Cores escuras para contraste
Acentos:     Versoes ajustadas para fundo claro
```

### Implementacao

- **ThemeContext** — Provider React com toggle e persistencia
- **localStorage** — Salvo como `devquest-theme`
- **prefers-color-scheme** — Respeita preferencia do sistema na primeira visita
- **CSS variables** — Todas as cores via `@theme` do Tailwind v4
- **Transicao suave** — Classe `light` no `<html>`, animacao de 300ms

### Tipografia

| Fonte | Uso |
|-------|-----|
| **Cinzel Decorative** | Titulos display, logotipo |
| **Cinzel** | Headings de secao |
| **Raleway** | Corpo de texto |

---

## 📡 API — Endpoints

Base URL: `http://localhost:8000/api`
Base URL (producao): `https://maib.com.br/api`
Documentacao interativa: `http://localhost:8000/docs`

### Health

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/health` | Health check — retorna status, quest name e versao |

### GitHub (`/api/github`)

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/repos` | Lista todos os repos do GitHub (com fallback) |
| GET | `/repos/{owner}/{repo}` | Detalhe de um repo com language breakdown |
| POST | `/repos/{owner}/{repo}/analyze` | Mock analise AI de um projeto |
| GET | `/quest-stats` | Stats agregados: total stars, XP, linguagens, quests |
| GET | `/profile` | Perfil publico do GitHub |

### Gamification (`/api/gamification`)

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/profile` | Perfil do jogador: nome, classe, nivel, XP, stats RPG |
| GET | `/skills` | Skills agrupadas por branch (3 categorias, 15 skills) |
| GET | `/achievements` | Todos os achievements com status de unlock |
| GET | `/timeline` | Timeline de carreira com 15 entradas |
| GET | `/activity-log` | Log de atividades recentes (param: `limit`, default: 20) |
| GET | `/weekly-summary` | Resumo semanal com narrativa mock |

### CV (`/api/cv`)

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| POST | `/upload` | Upload de CV (multipart) + mock analysis + XP |
| GET | `/analysis` | Ultima analise de CV |
| GET | `/analyses` | Historico de todas as analises (newest first) |

### Oracle (`/api/oracle`)

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| POST | `/chat` | Envia mensagem, recebe resposta context-aware + XP |
| GET | `/history` | Historico de chat paginado (params: `limit`, `offset`) |
| GET | `/stats` | Stats: messages_sent, wisdom_score, topics, oracle_level |
| GET | `/weekly-summary` | Resumo semanal estruturado com dicas |

### Blog (`/api/blog`)

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/posts` | Lista todos os posts (pinned first, newest) |
| GET | `/posts/{post_id}` | Detalhe de um post |
| POST | `/posts` | Cria novo post + 75 XP |
| PUT | `/posts/{post_id}` | Atualiza post existente |
| DELETE | `/posts/{post_id}` | Deleta post |

---

## 🗄️ Modelos de Dados

O banco de dados usa **SQLite** com **SQLModel** (SQLAlchemy + Pydantic). 7 tabelas:

### PlayerProfile

| Campo | Tipo | Default | Descricao |
|-------|------|---------|-----------|
| name | str | "Renan Carvalho" | Nome do jogador |
| title | str | "Full-Stack Mage" | Titulo RPG |
| dev_class | str | "Full-Stack Mage" | Classe do personagem |
| level | int | 15 | Nivel atual |
| xp | int | 6450 | XP acumulado |
| xp_next_level | int | 10000 | XP necessario para proximo nivel |
| avatar_initials | str | "RC" | Iniciais do avatar |
| strength | int | 72 | STR — Problem Solving |
| intelligence | int | 88 | INT — Technical Knowledge |
| dexterity | int | 65 | DEX — Adaptability |
| wisdom | int | 70 | WIS — Soft Skills |

### Skill

| Campo | Tipo | Descricao |
|-------|------|-----------|
| skill_id | str (indexed) | ID unico (ex: "react", "python") |
| name | str | Nome de exibicao |
| category | str | "frontend", "backend", "data" |
| category_name | str | "Frontend Arcana", "Backend Warfare", "Data Sorcery" |
| level / max_level | int | Nivel atual / maximo (0-5) |
| unlocked | bool | Se a skill esta disponivel |
| description | str | Descricao da habilidade |
| color | str | Cor hexadecimal da branch |
| projects | str | Projetos relacionados (comma-separated) |

### Achievement

| Campo | Tipo | Descricao |
|-------|------|-----------|
| name | str | Nome unico do achievement |
| description | str | Descricao da conquista |
| icon | str | Nome do icone (ex: "trophy", "star") |
| category | str | coding, skills, social, quests, quality, oracle, writing, career |
| color | str | Cor hexadecimal |
| unlocked | bool | Status de desbloqueio |
| unlock_date | str? | Data ISO de quando foi desbloqueado |

### BlogPost

| Campo | Tipo | Descricao |
|-------|------|-----------|
| title | str | Titulo do post |
| content | str | Conteudo em markdown |
| category | str | update, project, achievement, thought |
| tags | str | Tags comma-separated |
| color | str | Cor do card |
| pinned | bool | Se aparece no topo |
| created_at / updated_at | str | Timestamps ISO |

### CVAnalysis

| Campo | Tipo | Descricao |
|-------|------|-----------|
| filename | str | Nome do arquivo enviado |
| file_size | int | Tamanho em bytes |
| score | int | Score geral (0-95) |
| sections | str (JSON) | Array de {name, score, feedback} |
| strengths / weaknesses / tips | str (JSON) | Arrays de strings |
| created_at | str | Timestamp ISO |

### ChatMessage

| Campo | Tipo | Descricao |
|-------|------|-----------|
| role | str | "user" ou "oracle" |
| text | str | Conteudo da mensagem |
| context_topic | str | Keyword matched para analytics |
| created_at | str | Timestamp ISO |

### ActivityLog

| Campo | Tipo | Descricao |
|-------|------|-----------|
| action | str | "oracle_chat", "cv_upload", "blog_create" |
| xp_gained | int | XP concedido pela acao |
| description | str | Descricao da atividade |
| created_at | str | Timestamp ISO |

### Dados Iniciais (Seed)

Na primeira execucao, `seed.py` popula:
- **1 PlayerProfile** — Renan Carvalho, Level 15, XP 6450
- **15 Skills** — 5 por branch, niveis variados (0-4), 3 locked (Next.js, Docker, ML)
- **12 Achievements** — 8 pre-unlocked + 4 lockable
- **4 BlogPosts** — Hackathons, AI Residency, DevQuest write-up
- **1 ChatMessage** — Greeting do Oracle

---

## 🚀 Como Rodar Localmente

### Pre-requisitos

- **Node.js** 18+
- **Python** 3.11+
- **Git**

### 1. Clone o repositorio

```bash
git clone https://github.com/HiRenan/MAIBIA.git
cd MAIBIA
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse: **http://localhost:5173**

### 3. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API: **http://localhost:8000**
Docs: **http://localhost:8000/docs**
Health: **http://localhost:8000/api/health**

> O Vite proxy encaminha automaticamente `/api/*` para o backend (configurado em `vite.config.ts`).

### 4. Variaveis de Ambiente

| Variavel | Default | Descricao |
|----------|---------|-----------|
| `FRONTEND_URL` | `http://localhost:5173` | URL do frontend (CORS) |
| `DB_PATH` | `data` | Diretorio do SQLite (`<DB_PATH>/devquest.db`) |
| `VITE_API_URL` | `/api` | Base URL da API no frontend |
| `RAILWAY_BACKEND_URL` | `https://maibia-production.up.railway.app` | Backend alvo usado pela funcao proxy da Vercel |

### Workflow Tipico

Abra dois terminais:

```bash
# Terminal 1 — Backend
cd backend && uvicorn app.main:app --reload

# Terminal 2 — Frontend
cd frontend && npm run dev
```

O banco de dados SQLite eh criado automaticamente no primeiro startup com dados seed.

---

## 🧰 Troubleshooting Rapido

### PowerShell bloqueando `npm` (`npm.ps1`)

Se aparecer erro de ExecutionPolicy ao rodar `npm`, use:

```powershell
cmd /c "cd frontend && npm run dev"
```

Ou ajuste a policy do usuario atual:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### Upload de CV: formato e tamanho

- O frontend limita tamanho para **5MB**.
- O input sugere `.pdf`, `.doc`, `.docx`.
- O backend atual nao valida MIME/tamanho; se precisar regra estrita, adicione validacao no endpoint `/api/cv/upload`.

---

## ☁️ Deploy

### Frontend — Vercel

Configuracao em `frontend/vercel.json`:

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/proxy?path=$1" },
    { "source": "/((?!api).*)", "destination": "/index.html" }
  ]
}
```

- Build command: `npm run build`
- Output directory: `dist`
- Framework preset: Vite
- Variavel: `VITE_API_URL=/api`
- Variavel: `RAILWAY_BACKEND_URL=https://maibia-production.up.railway.app`
- Arquivo: `frontend/api/proxy.js` faz proxy de `/api/*` para o backend Railway

### Backend — Railway

Configuracao em `backend/Procfile`:

```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

- Variavel: `FRONTEND_URL=https://maib.com.br`

### Nota sobre SQLite Ephemeral

Railway usa storage efemero — o banco eh **recriado a cada redeploy**. Isso funciona porque `seed.py` reconstroi todos os dados automaticamente no startup. Dados dinamicos (chat, CV analyses, blog posts criados pelo usuario) sao perdidos no redeploy.

---

## 🎨 Escolhas de Design

### Frontend-First com Graceful Degradation

**Decisao:** Todas as paginas funcionam standalone com dados hardcoded. A API adiciona dados reais, mas se cair, o frontend usa fallback automaticamente.

**Motivo:** Garante que o portfolio **sempre funciona**, independente do estado do backend. O avaliador ve conteudo imediato sem esperar loading.

### Tema RPG

A metafora de gamificacao mapeia naturalmente para crescimento profissional:

- **XP e Niveis** → Progresso acumulado na carreira
- **Classes** (Frontend Mage, Backend Warrior) → Especializacao tecnica
- **Achievements/Badges** → Marcos conquistados
- **Raridade de projetos** → Impacto e complexidade
- **Oracle** → Placeholder para futuro LLM advisor

O tema visual usa **dark fantasy**: fundo escuro (#0a0a1a), acentos dourados (#f0c040), glassmorphism, fontes medievais (Cinzel Decorative), e animacoes de particulas.

### Mock AI (sem LLM real)

Conforme requisito do projeto, nenhum LLM real eh integrado. Todas as features de IA sao mocks deterministicos:

- **`mock_ai.py`** no backend com funcoes deterministicas
- **Oracle chat** usa keyword matching com 25+ respostas pre-definidas, personalizadas por perfil e skills
- **Analise de CV** retorna scores variados baseados no hash do filename (72-95)
- **Analise de projeto** retorna feedback generico baseado no nome do repo

A arquitetura eh preparada para substituir mocks por LLM real sem mudancas estruturais.

### Tailwind CSS v4 com @theme

Ao inves de `tailwind.config.js`, o projeto usa a nova sintaxe do Tailwind v4 com `@theme` em `index.css`. Todas as cores, fontes e espacamentos sao definidos como CSS custom properties, permitindo:

- Troca de tema instantanea via classe CSS
- Consistencia visual em todo o projeto
- Zero JavaScript para troca de cores

---

## 💡 O que Funcionou / Desafios

### ✅ O que Funcionou Bem

**Claude Code como Pair Programmer**
- 7 paginas completas com animacoes avancadas
- O agente manteve o tema RPG coeso em todas as telas
- Iteracao rapida: Sprint 1 (base) → Sprint 1.5 (polish) → Sprint 2 (backend) → Sprint 3 (gamification)
- Conhecimento tecnico: Three.js, SVG interativo, Framer Motion avancado — tudo gerado corretamente

**Desenvolvimento Incremental**
- 20+ commits incrementais, cada um focado em uma feature
- Conventional commits (`feat:`, `fix:`, `chore:`) facilitam review

**Graceful Degradation**
- `useAPI(fetcher, fallback)` garante UX fluida com ou sem backend
- Zero telas de loading bloqueante — conteudo aparece imediatamente

**GitHub API Real**
- Quest Log com repos reais, estrelas, forks, linguagens
- Raridade e XP calculados automaticamente
- Fallback transparente se API indisponivel

**Sistema de Gamificacao**
- Engine completa com XP, levels, achievements, stats
- Notificacoes visuais (toasts, level-up modal) tornam a experiencia envolvente
- Stats recalculados dinamicamente baseados em acoes do usuario

### ⚠️ Desafios e Limitacoes

**Performance do Three.js no Mobile**
O background 3D causa queda de FPS em dispositivos moveis.
*Mitigacao:* `prefers-reduced-motion` desabilita animacoes pesadas.

**SQLite em Deploy Ephemeral**
Railway apaga o banco a cada redeploy.
*Mitigacao:* `seed.py` reconstroi todos os dados no startup.

**Tailwind CSS v4 Migration**
Sintaxe significativamente diferente do v3: `@theme` em vez de config JS, classes renomeadas.
*Aprendizado:* Sempre verificar docs da versao especifica.

**Scope de IA**
Originalmente planejado com analises mais sofisticadas, mas o requisito de "sem LLM" limitou a keyword matching.
*Se fosse refazer:* Templates mais ricos com variaveis dinamicas baseadas nos dados reais.

---

## 🤖 Documentacao do Agente

Este projeto foi construido inteiramente usando **Claude Code** (CLI do Claude da Anthropic).

### Sprints de Desenvolvimento

| Sprint | Foco | Descricao |
|--------|------|-----------|
| **1** | Setup + Paginas basicas | Repo, React/Vite/Tailwind/Three.js, 6 paginas placeholder com animacoes |
| **1.5** | Polish visual | Upgrade para 9-10/10: skill tree SVG, scroll animations, chat, filtros, upload |
| **2** | Backend + Integracao | FastAPI, SQLModel, GitHub API, mock AI, graceful fallback, deploy config |
| **3** | Gamification + Features | Engine de XP/achievements/level-up, blog CRUD, Oracle redesign, theme toggle |
| **4** | Responsividade + Polish | Breakpoints tablet, animacoes refinadas, dark/light theme, UX polish |

### Uso do Agente

O Claude Code foi utilizado para:
- Gerar componentes React com TypeScript e animacoes complexas
- Implementar SVG interativo (skill tree com 15 nos conectados por linhas animadas com particulas)
- Configurar Three.js com React Three Fiber, parallax de mouse e particulas 3D
- Escrever endpoints FastAPI com SQLModel, httpx e gamification engine
- Criar sistema completo de graceful degradation
- Implementar dark/light theme com CSS variables
- Construir gamification engine (XP, levels, achievements, stats)
- Gerar seed data e modelos de banco de dados
- Configurar deploy (Vercel + Railway)

### Prompts Reais Usados (exemplos)

1. `Crie uma pagina Skill Tree RPG com 3 branches, 15 skills, animacoes e fallback de dados.`
Resultado: estrutura inicial da tela, layout e estados principais.

2. `Refatore para integrar com API FastAPI mantendo graceful degradation com dados mock.`
Resultado: padrao `useAPI(fetcher, fallback)` aplicado nas paginas com fallback consistente.

3. `Implemente backend FastAPI com routers github/cv/oracle/gamification e SQLite via SQLModel.`
Resultado: API completa com persistencia, seed e endpoints de integracao frontend-backend.

4. `Adicione sistema de gamificacao com XP, level-up, achievements dinamicos e activity log.`
Resultado: `gamification_engine.py` com progressao de XP, desbloqueios e recalculo de stats.

5. `Melhore UX e design com tema RPG, dark/light toggle e animacoes sem quebrar responsividade.`
Resultado: polimento visual, toasts/modais e ajustes para mobile/tablet.

### O que exigiu intervencao manual

- Ajustes finos de responsividade e contraste em componentes especificos.
- Correcao e centralizacao de links sociais para evitar divergencia.
- Revisao de consistencia do README com o estado real do codigo.

### Metricas

| Metrica | Valor |
|---------|-------|
| Total de commits | 20+ |
| Paginas frontend | 7 + NotFound |
| Componentes compartilhados | 6 (ui/) + 2 (layout/) + 1 (3d/) |
| Endpoints API | ~23 |
| Modelos de dados | 7 tabelas |
| Skills mapeadas | 15 |
| Achievements | 12 |

---

## 📄 Licenca

Projeto academico — uso educacional.

Desenvolvido para a disciplina de **IA Generativa** do curso de graduacao.
