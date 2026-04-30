# 📋 Plano de Melhorias — Portal Região 655

> **Última atualização:** 29/04/2026
> **Status:** Em andamento — Fase 1 pendente

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
- Após login, dados do usuário são salvos no `localStorage`:
  - `userEmail`, `userName`, `userPerms` (array JSON), `userIgreja`
- Cada página verifica `localStorage` para proteção de rota
- Hierarquia de permissões: `admin > secretario > superintendente > pastor_titular > coordenador > obreiro > membro`
- **PROBLEMA CRÍTICO:** `userPerms` no localStorage pode ser manipulado no DevTools

---

## 📊 Análise Realizada (29/04/2026)

### Arquivos analisados:
- `index.html` (1217 linhas — painel principal, admin + pastor)
- `firebase-config.js` (21 linhas — configuração Firebase)
- `login.html` (109 linhas — tela de autenticação)

### Problemas identificados:
1. Permissões no localStorage (inseguro)
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

### 🔴 Fase 1 — Segurança Crítica (PRÓXIMA)
- [ ] Implementar verificação de permissões via Firestore (não localStorage)
- [ ] Revisar/configurar Firestore Security Rules no console Firebase
- [ ] Fixar versões de dependências CDN (lucide, phosphor-icons, html2pdf)
- [ ] Adicionar proteção contra manipulação de permissões

### 🟠 Fase 2 — Modularização do Código
- [ ] Extrair CSS compartilhado em `styles/main.css`
- [ ] Extrair CSS do pastor em `styles/pastor.css`
- [ ] Extrair CSS do admin em `styles/admin.css`
- [ ] Criar módulo `js/auth.js` centralizado
- [ ] Criar módulo `js/firebase-helpers.js` com funções utilitárias
- [ ] Centralizar header/footer/sidebar como componentes reutilizáveis

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
│   ├── auth.js             ← Autenticação e proteção de rotas
│   ├── firebase-config.js  ← Config Firebase
│   ├── firebase-helpers.js ← Funções utilitárias Firestore
│   ├── admin-panel.js      ← Lógica do painel admin
│   ├── pastor-panel.js     ← Lógica do painel pastor
│   ├── pdf-generator.js    ← Geração de recibos PDF
│   └── utils.js            ← Formatação, escape, etc.
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
4. **Fase 1 (Segurança) é a mais urgente** — qualquer pessoa pode se tornar admin editando o localStorage
5. O arquivo `historico_projeto.txt` já existe e contém histórico anterior do projeto
6. O repositório Git está configurado: `origin: https://github.com/eduardoalx2/AdmReg.git`

---

## 📝 Log de Sessões

### Sessão 1 — 29/04/2026
- **Tokens usados:** ~92K/128K (72%)
- **Feito:** Análise completa do projeto, identificação de 13+ problemas, criação do plano de melhorias
- **Próximo:** Implementar Fase 1 (Segurança)