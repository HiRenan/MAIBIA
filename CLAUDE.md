# DevQuest — Plataforma de Inteligência de Carreira Gamificada

## Regras do Projeto (Avaliação Intermediária — IA Generativa)

### Informações Gerais
- **Valor:** 30 pontos (30% da nota final)
- **Entrega:** 20/02/2026 (Aula 6)
- **Formato:** Individual
- **Aluno:** Renan Carvalho

### Restrições Críticas
- **SEM integração de LLM/modelo de IA** — usar mocks/placeholders onde a IA atuaria
- **Endpoint público obrigatório** — deve estar acessível via internet no dia da avaliação
- **Tudo gerado via agente de codificação (Claude Code)** — documentar prompts e iterações
- **Commits frequentes** — nunca fazer um commit gigante, sempre incremental por feature
- **README detalhado obrigatório** — documentar processo, escolhas, o que funcionou e o que não

### Critérios de Avaliação (30 pontos)

| Critério | Pts | Como garantir nota máxima |
|---|---|---|
| **Endpoint Funcional** | 8 | Todas as 6 telas navegáveis, interações funcionando com dados simulados |
| **Complexidade/Ambição** | 6 | Múltiplos fluxos, UI variada (3D, grafos, cards, chat, upload, gráficos), visão de IA futura |
| **Repositório GitHub** | 4 | 10+ commits incrementais, estrutura organizada, .gitignore, código legível |
| **README Documentação** | 8 | 4 seções: problema/solução, escolhas de design, o que funcionou, o que não funcionou |
| **Uso do Agente** | 4 | Evidência de uso extensivo: prompts, logs, screenshots, iterações |

### Stack Técnica
- **Backend:** Python + FastAPI
- **Frontend:** React + Vite + TypeScript
- **DB:** SQLite (arquivo .db, sem Docker)
- **Animações:** Framer Motion (motion/react)
- **3D:** Three.js via React Three Fiber (@react-three/fiber + @react-three/drei)
- **Estilo:** Tailwind CSS
- **Deploy:** Vercel (front) + Railway/ngrok (back)

### Estrutura de Telas
1. **Hero/Landing** — Background 3D, avatar, stats, barra de XP
2. **Skill Tree** — Árvore interativa de habilidades com níveis
3. **Quest Log** — Projetos GitHub (API real) + mock de análise IA
4. **Chronicle** — Timeline carreira + posts LinkedIn + scroll animations
5. **Guild Hall** — CV interativo como ficha de RPG + upload + mock análise IA
6. **Oracle** — Chat mockado (placeholder para LLM futuro)

### Mocks de IA (implementar como respostas simuladas)
- Análise de projeto GitHub → JSON pré-definido com feedback
- Análise de currículo → Sugestões estáticas por seção
- Chat Oracle → Respostas pré-programadas contextuais
- Resumo semanal → Texto fixo
- Classificação de skills → Algoritmo simples de pontuação

### Gamificação
- Sistema de XP (cada projeto/skill contribui)
- Níveis 1-20
- Achievements/Badges ("First Commit", "Polyglot", "Star Collector")
- Classe do Dev (Frontend Mage, Backend Warrior, Full-Stack Paladin, etc.)
- Barra de progresso animada
- Easter eggs (Konami code, temas desbloqueáveis)

### Integrações Reais (dados, não IA)
- **GitHub API** — repos, linguagens, contribuições, stars
- **LinkedIn** — posts recentes (dados estáticos copiados manualmente)
- **CV** — informações reais do Renan

### Ordem de Desenvolvimento
1. Setup (repo + FastAPI + React + Vite)
2. Hero page (Three.js + animações)
3. Skill Tree (componente interativo)
4. Quest Log (GitHub API + cards + filtros + mock IA)
5. Chronicle (timeline + posts + scroll animations)
6. Guild Hall (CV + upload + mock análise)
7. Oracle (chat mockado)
8. Gamificação (XP, níveis, badges)
9. Polish (responsividade, dark/light, transições)
10. Deploy (endpoint público)
11. README (documentação completa)

### Regras de Desenvolvimento para o Agente
- Sempre fazer commits pequenos e descritivos ao completar cada feature
- Nunca integrar LLM real — sempre usar mock_ai.py para respostas simuladas
- Manter código limpo e organizado seguindo a estrutura de pastas definida
- Usar TypeScript no frontend, Python com type hints no backend
- Testar endpoint antes de considerar feature completa
- Documentar cada decisão importante no README
- Priorizar funcionalidade sobre perfeição visual
- Responsividade é obrigatória (professor abre no navegador dele)

### Entregáveis Finais
1. Link do endpoint funcional (público)
2. Link do repositório GitHub (público)
3. README.md completo no repositório
