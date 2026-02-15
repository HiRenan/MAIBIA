# DevQuest — Gamified Career Intelligence Platform

> An RPG-themed interactive portfolio that transforms a developer's career into a gamified quest system with skill trees, achievements, real GitHub integration, and an AI oracle.

**Aluno:** Renan Carvalho
**Disciplina:** IA Generativa — Avaliacao Intermediaria
**Entrega:** 20/02/2026

---

## 1. Problema e Solucao

### O Problema

Portfolios tradicionais de desenvolvedores sao estaticos e genericos. Eles listam tecnologias e projetos sem transmitir a jornada dinamica de crescimento profissional. Recrutadores veem dezenas de portfolios identicos, e o candidato nao consegue se diferenciar.

### A Solucao

DevQuest reimagina o portfolio como uma aventura RPG. Cada aspecto da carreira do desenvolvedor eh mapeado para mecanicas de jogo:

- **Projetos GitHub** = Quests com raridade (Common, Rare, Epic, Legendary) baseada em stars
- **Habilidades tecnicas** = Arvore de skills interativa com 3 branches e 15 nos
- **Marcos de carreira** = Timeline cronologica (Chronicle) com scroll animations
- **Curriculo** = Ficha de personagem RPG com stats e radar chart
- **Analise de IA** = Oracle que responde perguntas sobre carreira (mock para avaliacao)

O resultado eh uma experiencia imersiva que prende a atencao, demonstra habilidades tecnicas no proprio portfolio, e diferencia o candidato.

### Telas do Sistema

| # | Tela | Descricao |
|---|------|-----------|
| 1 | **Hero** | Landing page com avatar animado, stats, barra de XP, badges |
| 2 | **Skill Tree** | Arvore SVG interativa com 15 skills em 3 branches |
| 3 | **Quest Log** | Projetos GitHub reais com filtros, busca, raridade e modal de detalhes |
| 4 | **Chronicle** | Timeline de carreira com scroll animations e carrossel LinkedIn |
| 5 | **Guild Hall** | CV como ficha RPG, upload de arquivo, radar chart, mock analise |
| 6 | **Oracle** | Chat interativo com respostas mock baseadas em keywords |

---

## 2. Escolhas de Design

### Stack Tecnica

| Tecnologia | Motivo |
|------------|--------|
| **React 19 + TypeScript** | Type safety, hooks modernos, ecossistema maduro |
| **Vite 7** | Dev server mais rapido, HMR excelente, build otimizado |
| **Tailwind CSS v4** | Utility-first com custom properties via `@theme` |
| **Framer Motion** | Animacoes production-grade para React (stagger, scroll, spring) |
| **Three.js + R3F** | Background 3D com particulas, parallax de mouse, blob organico |
| **Lucide React** | Icones consistentes e leves |
| **FastAPI + SQLModel** | API async em Python, auto docs OpenAPI, ORM tipo-seguro |
| **SQLite** | Zero config, arquivo unico, perfeito para MVP |
| **httpx** | Cliente HTTP async para chamadas ao GitHub API |

### Arquitetura

```
frontend/                    backend/
  src/                         app/
    pages/        (6 telas)      routers/     (github, cv, oracle, gamification)
    components/                  services/    (mock_ai.py)
      ui/         (6 shared)     models.py    (SQLModel tables)
      layout/     (Navbar)       seed.py      (dados iniciais)
      3d/         (Particles)    database.py  (SQLite + session)
    services/     (api.ts)       main.py      (FastAPI app)
    hooks/        (useAPI.ts)
```

**Decisao chave: Frontend-first com graceful degradation.** Todas as paginas funcionam standalone com dados hardcoded. A API adiciona dados reais mas, se cair, o frontend usa fallback automaticamente. Isso garante que o portfolio sempre funciona.

### Tema RPG

A metafora de gamificacao mapeia naturalmente para crescimento profissional:

- **XP e Niveis** = Progresso acumulado na carreira
- **Classes** (Frontend Mage, Backend Warrior, Full-Stack Paladin) = Especializacao
- **Achievements/Badges** = Marcos conquistados
- **Raridade de projetos** = Impacto e complexidade
- **Oracle** = Placeholder para futuro LLM advisor

O tema visual usa dark fantasy: fundo escuro (#0a0a1a), acentos dourados (#f0c040), glassmorphism, fontes medievais (Cinzel Decorative), e animacoes de particulas.

### Mocks de IA

Conforme requisito do projeto, nenhum LLM real eh integrado. Todas as features de IA sao mocks:

- `mock_ai.py` no backend com funcoes deterministicas
- Oracle chat usa keyword matching com 12 respostas pre-definidas
- Analise de CV retorna scores fixos por secao
- Analise de projeto retorna feedback generico baseado no nome do repo

---

## 3. O que Funcionou Bem

### Claude Code como Pair Programmer

O projeto foi desenvolvido inteiramente via Claude Code (agente de codificacao). Os principais beneficios:

- **Velocidade:** 6 paginas completas com animacoes em poucas horas
- **Consistencia:** O agente manteve o tema RPG coeso em todas as telas
- **Iteracao rapida:** Sprint 1 (base) → Sprint 1.5 (polish) → Sprint 2 (backend) em sequencia
- **Conhecimento tecnico:** Three.js, SVG interativo, Framer Motion avancado — tudo gerado corretamente

### Desenvolvimento Incremental

20+ commits incrementais, cada um focado em uma feature:
- Primeiro as paginas basicas, depois upgrade visual, depois backend
- Cada commit eh pequeno e descritivo, facilitando review

### Graceful Degradation

O padrao `useAPI(fetcher, fallback)` garante que:
- Sem backend → paginas funcionam com dados hardcoded
- Com backend → dados reais do GitHub, perfil dinamico
- API lenta → usuario ve o conteudo imediatamente, dados atualizam quando chegam

### GitHub API Real

O Quest Log mostra repositorios REAIS do GitHub com:
- Estrelas, forks, linguagem — tudo vindo da API
- Raridade calculada automaticamente por numero de stars
- XP estimado por metricas do repositorio
- Fallback para dados mock se a API estiver indisponivel

---

## 4. O que Nao Funcionou / Desafios

### Performance do Three.js no Mobile

O background 3D com 5000+ particulas, sparkles e organic blob causa queda de FPS em dispositivos moveis. Mitigacao:
- Lazy loading do component via `React.lazy()` + `Suspense`
- `prefers-reduced-motion` desabilita animacoes em dispositivos que solicitam

**Se fosse refazer:** Usaria um canvas 2D mais leve ou desativaria 3D completamente em mobile.

### SQLite em Deploy Ephemeral

Railway usa storage efemero — o banco de dados eh apagado a cada redeploy. Solucao: `seed.py` reconstroi todos os dados no startup. Funciona porque os dados sao estaticos (perfil, skills, achievements).

**Se fosse refazer:** Usaria PostgreSQL no Railway ou armazenaria dados em JSON files.

### Tailwind CSS v4 Migration

A sintaxe do Tailwind v4 difere significativamente do v3:
- `@theme` em vez de `tailwind.config.js`
- Custom properties como classes (`bg-bg-primary` em vez de variaveis manuais)
- Algumas classes mudaram de nome

**Aprendizado:** Sempre verificar a documentacao da versao especifica antes de comecar.

### Scope de IA

Originalmente planejado com analises mais sofisticadas (NLP, embeddings), mas o requisito de "sem LLM" limitou a keyword matching simples. O Oracle funciona bem como demo, mas as respostas sao visivelmente pre-definidas.

**Se fosse refazer:** Implementaria um sistema de templates mais rico com variaveis dinamicas baseadas nos dados reais do usuario.

---

## Como Rodar Localmente

### Pre-requisitos

- Node.js 18+
- Python 3.11+
- Git

### Frontend

```bash
cd frontend
npm install
npm run dev
# Acesse http://localhost:5173
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
# API em http://localhost:8000
# Docs em http://localhost:8000/docs
```

O Vite proxy ja encaminha `/api` para o backend automaticamente.

---

## Estrutura do Projeto

```
MAIBIA/
├── frontend/
│   ├── src/
│   │   ├── pages/           # 6 paginas + NotFound
│   │   ├── components/
│   │   │   ├── ui/          # GlassCard, Modal, Badge, AnimatedCounter, etc.
│   │   │   ├── layout/      # Navbar, Layout
│   │   │   └── 3d/          # ParticleBackground
│   │   ├── services/        # api.ts (typed API client)
│   │   ├── hooks/           # useAPI.ts
│   │   ├── App.tsx          # Router
│   │   └── index.css        # Theme + keyframes
│   ├── vercel.json
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── routers/         # github, cv, oracle, gamification
│   │   ├── services/        # mock_ai.py
│   │   ├── models.py        # SQLModel tables
│   │   ├── seed.py          # Initial data
│   │   ├── database.py      # SQLite config
│   │   └── main.py          # FastAPI app
│   ├── requirements.txt
│   └── Procfile
├── data/                    # SQLite database
├── CLAUDE.md                # Project rules
└── README.md
```

---

## Documentacao do Uso do Agente

Este projeto foi construido inteiramente usando **Claude Code** (CLI do Claude da Anthropic). Principais iteracoes:

1. **Sprint 1 — Setup + Paginas basicas:** Criacao do repo, configuracao de React/Vite/Tailwind/Three.js, 6 paginas placeholder com animacoes
2. **Sprint 1.5 — Polish visual:** Upgrade de todas as paginas para 9-10/10 de qualidade visual — skill tree SVG interativo, scroll animations, chat funcional, filtros, upload
3. **Sprint 2 — Backend + Integracao:** FastAPI com SQLModel, endpoints reais (GitHub API), mock AI, conexao frontend-backend com graceful fallback, deploy config

O agente foi usado para:
- Gerar componentes React com TypeScript e animacoes complexas
- Implementar SVG interativo (skill tree com 15 nos conectados por linhas animadas)
- Configurar Three.js com parallax de mouse e particulas
- Escrever endpoints FastAPI com SQLModel e httpx
- Criar sistema de graceful degradation (API down = fallback automatico)
- Gerar este README

**Total de commits:** 20+
**Linhas de codigo (frontend):** ~3000
**Linhas de codigo (backend):** ~500
**Tempo total de desenvolvimento:** ~8 horas com agente

---

## Endpoints da API

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/health` | Health check |
| GET | `/api/github/repos` | Repos reais do GitHub |
| GET | `/api/github/repos/:owner/:repo` | Detalhe de um repo |
| POST | `/api/github/repos/:owner/:repo/analyze` | Mock analise de projeto |
| GET | `/api/github/profile` | Perfil do GitHub |
| POST | `/api/cv/upload` | Upload de CV + mock analise |
| GET | `/api/cv/analysis` | Ultima analise de CV |
| POST | `/api/oracle/chat` | Chat com Oracle (mock) |
| GET | `/api/gamification/profile` | Perfil do jogador |
| GET | `/api/gamification/skills` | Skills agrupadas por branch |
| GET | `/api/gamification/achievements` | Achievements |
| GET | `/api/gamification/weekly-summary` | Resumo semanal (mock) |

---

## Licenca

Projeto academico — uso educacional.
