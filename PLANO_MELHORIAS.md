# 📋 Plano de Melhorias — Portal Região 655

> **Última atualização:** 29/04/2026
> **Status:** Fase 1 concluída — Fase 2 pronta para iniciar

---

## 🏗️ Visão Geral do Projeto

- **Tipo:** Portal web de gestão eclesiástica (IEQ Região 655 — Londrina/PR)
- **Stack:** HTML + CSS + JavaScript vanilla + Firebase (Auth + Firestore)
- **Deploy:** Firebase Hosting (GitHub: eduardoalx2/AdmReg)
- **Páginas:** ~30 arquivos HTML (painel admin, pastor, recibos, agenda, eventos, presenças, dashboards, etc.)
- **Autenticação:** Firebase Auth com permissões armazenadas no Firestore (coleção `usuarios`)
- **Banco:** Firestore com coleções: `usuarios`, `igrejas`, `pastores`, `recibos`, `saldos_virada`, `agenda`, `eventos`, `presencas`, `avisos`, `avisos_ciencia`, `pendencias_manuais`, `configuracoes`

---

## 🔐 Sistema de Permissões Atual

- Login via Firebase Auth (email/senha)
- Após login, dados do usuário são buscados do Firestore (coleção `usuarios`) e cacheados no `localStorage`
- Módulo centralizado `js/auth.js` gerencia autenticação e verificação de permissões
- Cada página usa `requireAuth()` para proteção de rota (verificação Firestore)
- Hierarquia de permissões: `admin > secretario > superintendente > pastor_titular > coordenador > obreiro > membro`
- **MITIGADO:** Permissões agora são verificadas contra Firestore, não apenas localStorage

---

## 📊 Análise Realizada (29/04/2026)

### Arquivos analisados:
- `index.html` (painel principal, admin + pastor)
- `firebase-config.js` (configuração Firebase)
- `login.html` (tela de autenticação)
- Todas as ~30 páginas HTML do projeto

### Problemas identificados:
1. ~~Permissões no localStorage (inseguro)~~ → **MITIGADO na Fase 1** (verificação Firestore)
2. Monolitos de 1000+ linhas por arquivo
3. CSS/HTML/JS misturados em cada página
4. Sem framework ou build system
5. Duplicação massiva de código entre páginas
6. Dependências CDN sem versão fixa (`lucide@latest`)
7. Queries Firestore sem filtros (baixa performance)
8. Sem testes automatizados
9. Sem PWA/Service Worker
10. Sem TypeScript
11. HTML inline extenso no JS (template literals)
12. Sem tratamento de erro global
13. Acessibilidade limitada

---

## 🗺️ Plano de Ação por Fases

### ✅ Fase 0 — Análise (CONCLUÍDA em 29/04/2026)
- [x] Analisar estrutura do projeto
- [x] Identificar problemas de segurança, arquitetura e performance
- [x] Criar plano de melhorias

### ✅ Fase 1 — Segurança Crítica (CONCLUÍDA em 29/04/2026)
- [x] Criar módulo `js/auth.js` centralizado (requireAuth, hasPermission, isAdmin, logout)
- [x] Atualizar `login.html` para usar módulo auth + buscar dados do Firestore
- [x] Atualizar `index.html` com auth gate seguro (verificação Firestore via requireAuth)
- [x] Atualizar logout em `index.html` para usar módulo auth
- [x] Commit `389015b` — "Fase 1: Autenticação centralizada via Firestore (js/auth.js)"
- [ ] Revisar/configurar Firestore Security Rules no console Firebase (manual)
- [ ] Fixar versões de dependências CDN (adiado para Fase 2)

### 🟠 Fase 2 — Modularização do Código (PRÓXIMA)
- [x] Extrair CSS compartilhado em `styles/main.css` (variáveis, reset, scrollbar, animações base)
- [x] Extrair CSS do pastor em `styles/pastor.css` (p-card, p-action, presenca, agenda, etc.)
- [x] Extrair CSS do admin em `styles/admin.css` (cards-grid, link-card, section-label, admin-bar)
- [ ] Extrair CSS de componentes em `styles/components.css` (tags, badges, skeleton, footer)
- [ ] Padronizar auth gate nas páginas restantes (~6 páginas) usando `js/auth.js`
- [x] Criar módulo `js/utils.js` com funções utilitárias (esc, escA, fmt, periodoRefToChave, etc.)
- [ ] Criar módulo `js/firebase-helpers.js` com funções reutilizáveis de Firestore
- [ ] Fixar versões CDN (lucide@0.300.0, phosphor-icons, html2pdf@0.10.1)

#### Páginas para padronizar auth (Fase 2):
Prioridade alta (acesso admin/sensível):
- ~~`gestao_usuarios.html`~~ ✅
- ~~`gerenciar_layout.html`~~ ✅
- ~~`editpagpastores.html`~~ ✅
- ~~`s_pastores.html`~~ ✅
- ~~`s_igrejas.html`~~ ✅
- ~~`coordenadorias.html`~~ ✅
- ~~`gerenciar_saldos.html`~~ ✅
- ~~`editarrecibos.html`~~ ✅
- ~~`visualizar_como.html`~~ ✅

Prioridade média (acesso operacional):
- ~~`saldodeviradareg655.html`~~ ✅
- ~~`recibosreg655.html`~~ ✅
- ~~`agendareg655.html`~~ ✅
- ~~`agendarapidareg655.html`~~ ✅
- ~~`eventosreg655.html`~~ ✅
- ~~`presencareg655.html`~~ ✅
- ~~`controleeventosreg655.html`~~ ✅
- ~~`pendenciasreg655.html`~~ ✅
- ~~`relatorio_pendencias.html`~~ ✅

Prioridade baixa (dashboards/ferramentas):
- ~~`dashreg655.html`~~ ✅
- ~~`dashsaldo.html`~~ ✅
- `agendaieqcentral.html`
- `agendarapidaieqcentral.html`
- ~~`controle_avisos.html`~~ ✅
- ~~`debitos_manuais.html`~~ ✅
- `importador_presencas.html`
- `importador_recibos.html`
- `migrar_agenda.html`
- `migrar_nomes_igrejas.html`
- `migrar_periodoChave.html`
- `migrar_periodos.html`
- `sorteio.html`
- `util_limpeza_convocacao.html`

### 🟡 Fase 3 — Performance
- [ ] Otimizar queries Firestore com filtros `where()` no servidor
- [ ] Implementar paginação para recibos e saldos
- [ ] Adicionar lazy loading de módulos JS
- [ ] Otimizar imagens (WebP, dimensões definidas)

### 🟢 Fase 4 — Qualidade e UX
- [ ] Implementar tratamento de erro global (toast notifications)
- [ ] Adicionar skeleton screens consistentes
- [ ] Melhorar acessibilidade (aria-*, roles, contraste)
- [ ] Implementar PWA (manifest.json, service worker, cache)

### 🔵 Fase 5 — Modernização (Opcional)
- [ ] Avaliar migração para framework (React/Vue/Vite)
- [ ] Migrar gradualmente para TypeScript
- [ ] Adicionar testes E2E (Playwright)
- [ ] Implementar CI/CD com GitHub Actions

---

## 📁 Estrutura de Arquivos Atual

```
/
├── index.html              ← Painel principal (admin + pastor)
├── login.html              ← Autenticação
├── firebase-config.js      ← Config Firebase
├── js/
│   └── auth.js             ← ✅ NOVO: Módulo centralizado de autenticação
├── gestao_usuarios.html    ← Gestão de usuários
├── gerenciar_layout.html   ← Layout do painel
├── editpagpastores.html    ← Config pastores
├── s_pastores.html         ← Cadastro pastores
├── s_igrejas.html          ← Cadastro igrejas
├── coordenadorias.html     ← Coordenadorias
├── saldodeviradareg655.html← Lançador saldo
├── gerenciar_saldos.html   ← Editar saldos
├── recibosreg655.html      ← Emissor recibos
├── editarrecibos.html      ← Editar recibos
├── dashreg655.html         ← Dashboard recibos
├── dashsaldo.html          ← Dashboard saldos
├── agendareg655.html       ← Agenda regional
├── agendarapidareg655.html ← Agenda rápida
├── pendenciasreg655.html   ← Pendências
├── relatorio_pendencias.html
├── eventosreg655.html      ← Gestão eventos
├── presencareg655.html     ← Lançar presença
├── controleeventosreg655.html
├── visualizar_como.html    ← Simulação de visão
├── logo.png / mini.png / assinatura.png
├── firebase.json / .firebaserc / CNAME
└── public/
    ├── index.html
    └── 404.html
```

---

## 🎯 Estrutura Alvo (após melhorias)

```
/
├── index.html              ← Shell principal (reduzido)
├── login.html
├── styles/
│   ├── main.css            ← Estilos base compartilhados
│   ├── admin.css           ← Estilos painel admin
│   ├── pastor.css          ← Estilos painel pastor
│   └── components.css      ← Cards, tags, badges, etc.
├── js/
│   ├── auth.js             ← ✅ Autenticação e proteção de rotas
│   ├── firebase-config.js  ← Config Firebase
│   ├── firebase-helpers.js ← Funções utilitárias Firestore
│   ├── utils.js            ← Formatação, escape, etc.
│   ├── admin-panel.js      ← Lógica do painel admin
│   ├── pastor-panel.js     ← Lógica do painel pastor
│   └── pdf-generator.js    ← Geração de recibos PDF
├── components/
│   ├── header.html         ← Header reutilizável
│   ├── footer.html         ← Footer reutilizável
│   └── sidebar.html        ← Sidebar reutilizável
├── assets/
│   ├── logo.png
│   ├── mini.png
│   └── assinatura.png
└── ... (páginas HTML reduzidas usando componentes)
```

---

## 💡 Notas para Próximas Conversas

1. **Sempre começar verificando este arquivo** para saber onde paramos
2. **Cada fase deve resultar em código funcional** — o site não pode quebrar
3. **Testar manualmente** após cada mudança antes de avançar
4. **Fase 1 concluída** — autenticação centralizada via Firestore implementada
5. **Fase 2 é a próxima** — modularização de CSS e padronização de auth nas ~28 páginas restantes
6. O arquivo `historico_projeto.txt` já existe e contém histórico anterior do projeto
7. O repositório Git está configurado: `origin: https://github.com/eduardoalx2/AdmReg.git`
8. Servidor local para testes: `npx serve -l 3000 .`

---

## 📝 Log de Sessões

### Sessão 1 — 29/04/2026
- **Tokens usados:** ~92K/128K (72%)
- **Feito:** Análise completa do projeto, identificação de 13+ problemas, criação do plano de melhorias
- **Próximo:** Implementar Fase 1 (Segurança)

### Sessão 2 — 29/04/2026
- **Tokens usados:** ~130K/128K (com overflow)
- **Feito:** Fase 1 concluída — `js/auth.js` criado, `login.html` e `index.html` atualizados
- **Commit:** `389015b` — "Fase 1: Autenticação centralizada via Firestore (js/auth.js)"
- **Teste:** Servidor local `npx serve -l 3000 .` funcionando, páginas carregando corretamente
- **Próximo:** Fase 2 — Modularização do código (CSS + auth nas demais páginas)