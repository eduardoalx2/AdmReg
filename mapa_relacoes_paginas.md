# Mapa Geral de Navegação e Relações entre Páginas HTML

> **Projeto:** AdmReg (Região 655)
> **Diretório Base:** `G:\Meu Drive\0Sinc\IA\AdmReg-main`
> **Total Mapeado:** 77 arquivos HTML (58 na raiz + 19 no módulo de Eventos)

## 1. Resumo Executivo da Estrutura

O ecossistema do AdmReg é composto por **77 páginas HTML interligadas** por links diretos (`<a href="...">`), redirecionamentos dinâmicos via JavaScript (`window.location`) e navegação em menus/botões. 

### Métricas Globais
| Indicador | Total | Descrição |
| :--- | :---: | :--- |
| **Total de Páginas HTML** | **77** | Todos os arquivos presentes no repositório e subpastas |
| **Páginas Raiz** | 58 | Telas centrais, financeiro, cadastros, relatórios e agenda |
| **Páginas de Eventos** | 19 | Gestão geral de eventos e congressos específicos (Mulheres, Diaconato, Jovens) |
| **Hub Central de Entrada** | `index.html` | Porta de entrada primária (recebe links de 37 páginas e aponta para 28 páginas) |
| **Hub Central de Configuração** | `gerenciar_layout.html` | Painel de controle de atalhos e cartões (aponta para 50+ ferramentas) |
| **Hub Financeiro** | `recibosreg655.html` / `dashreg655.html` | Tríade de emissão, listagem e edição de recibos e caixa |
| **Páginas Órfãs (0 inbound)** | **1** | `relatoriodeviagem.html` (não possui link apontando para ela a partir de outros HTMLs) |
| **Páginas Finais (0 outbound)** | **4** | `agenda_publicaieq.html`, `pauta_0905.html`, `relatoriodeviagem.html`, `s_contasreg655.html` |

---

## 2. Destaque Especial: Tríade de Recibos & Gestão Financeira

Conforme citado no seu exemplo, o módulo de recibos possui uma relação bidirecional densa e bem estruturada entre a **emissão**, a **dashboard/caixa** e a **edição de recibos**:

```mermaid
flowchart LR
    INDEX["index.html<br/><i>Menu Principal</i>"]
    REC["recibosreg655.html<br/><b>Emissor de Recibos</b>"]
    DASH["dashreg655.html<br/><b>Caixa & Gestão</b>"]
    EDIT["editarrecibos.html<br/><b>Gerenciar Recibos</b>"]
    DETALH["recibos_detalhados.html<br/><b>Recibos Detalhados</b>"]
    PRED["financeiro_preditivo.html<br/><b>Financeiro Preditivo</b>"]

    INDEX --> REC
    INDEX --> DASH
    INDEX --> EDIT

    REC <-->|Navegação Direta| DASH
    REC <-->|Navegação Direta| EDIT
    DASH <-->|Navegação Direta| EDIT

    DASH --> DETALH
    EDIT --> DETALH
    DETALH --> REC
    DETALH --> DASH

    PRED --> REC
    PRED --> DASH
```

### Relação Detalhada das Páginas de Recibos:
- **`recibosreg655.html` (Emissor de Recibos):**
  - **Links de Saída (Aponta para):** `dashreg655.html`, `editarrecibos.html`, `index.html`
  - **Links de Entrada (Quem aponta para ela):** `dashreg655.html`, `editarrecibos.html`, `financeiro_preditivo.html`, `gerenciar_layout.html`, `index.html`, `recibos_detalhados.html`
- **`dashreg655.html` (Caixa Região 655):**
  - **Links de Saída:** `editarrecibos.html`, `index.html`, `recibos_detalhados.html`, `recibosreg655.html`
  - **Links de Entrada:** `editarrecibos.html`, `financeiro_preditivo.html`, `gerenciar_layout.html`, `index.html`, `recibos_detalhados.html`, `recibosreg655.html`
- **`editarrecibos.html` (Gerenciar Recibos):**
  - **Links de Saída:** `dashreg655.html`, `index.html`, `recibos_detalhados.html`, `recibosreg655.html`
  - **Links de Entrada:** `dashreg655.html`, `gerenciar_layout.html`, `index.html`, `recibos_detalhados.html`, `recibosreg655.html`

---

## 3. Visão Macroscópica da Arquitetura (Módulos do Sistema)

```mermaid
flowchart TD
    MAIN(["index.html (Menu Principal)"])

    subgraph CL_AUTH["Autenticação & Portais"]
        LOGIN["login.html"]
        PORTAL["portal.html / mini_portal.html"]
        LAYOUT["gerenciar_layout.html"]
    end

    subgraph CL_FIN["Financeiro & Prestação"]
        RECIBOS["recibosreg655.html / dashreg655.html"]
        SALDOS["saldodeviradareg655.html / dashsaldo.html"]
        PENDENCIAS["pendenciasreg655.html"]
    end

    subgraph CL_EVT["Eventos & Congressos"]
        EVT_INDEX["eventos/index.html"]
        EVT_PRESENCA["controleeventosreg655.html"]
        EVT_MULHERES["eventos/congressodemulheres/..."]
        EVT_DIACONATO["eventos/congressodiaconato/..."]
        EVT_JOVENS["eventos/jovens/..."]
    end

    subgraph CL_CAD["Cadastros & Igrejas"]
        IGREJAS["s_igrejas.html"]
        PASTORES["s_pastores.html"]
        USERS["gestao_usuarios.html"]
    end

    subgraph CL_AGE["Agendas"]
        AGENDA["agendareg655.html / agenda_completa.html"]
    end

    MAIN --> CL_AUTH
    MAIN --> CL_FIN
    MAIN --> CL_EVT
    MAIN --> CL_CAD
    MAIN --> CL_AGE
```

---

## 4. Mapeamento Completo por Módulos Funcionais

### 4.1 Módulo: Painéis Principais & Autenticação

```mermaid
flowchart TD
    index_html["index.html<br/><small>Portal — Região 655</small>"]
    login_html["login.html<br/><small>Login - Região 655</small>"]
    portal_html["portal.html<br/><small>Portal — Região 655</small>"]
    mini_portal_html["mini_portal.html<br/><small>Mini Portal — Região 655</small>"]
    visualizar_como_html["visualizar_como.html<br/><small>Visualizar Como — Região 655</small>"]
    layout_login_html["layout_login.html<br/><small>Layout do Login — Região 655</small>"]
    gerenciar_layout_html["gerenciar_layout.html<br/><small>Gerenciar Layout — Região 655</small>"]
    index_html --> gerenciar_layout_html
    index_html --> login_html
    index_html --> visualizar_como_html
    login_html --> index_html
    portal_html --> login_html
    mini_portal_html --> login_html
    visualizar_como_html --> index_html
    layout_login_html --> index_html
    gerenciar_layout_html --> gerenciar_layout_html
    gerenciar_layout_html --> index_html
    gerenciar_layout_html --> layout_login_html
    gerenciar_layout_html --> login_html
    gerenciar_layout_html --> mini_portal_html
    gerenciar_layout_html --> portal_html
    gerenciar_layout_html --> visualizar_como_html
```

| Arquivo | Título da Página | Links de Saída (Aponta para) | Links de Entrada (Quem aponta para ela) |
| :--- | :--- | :--- | :--- |
| `gerenciar_layout.html` | **Gerenciar Layout — Região 655** | `agenda_completa.html`<br/>`agenda_publicaieq.html`<br/>`agendaieqcentral.html`<br/>`agendarapidaieqcentral.html`<br/>`agendarapidareg655.html`<br/>`agendareg655.html`<br/>`agendaregiao655.html`<br/>`backup.html`<br/>`checklist.html`<br/>`controle_avisos.html`<br/>`controleeventosreg655.html`<br/>`coordenadorias.html`<br/>`dashreg655.html`<br/>`dashsaldo.html`<br/>`debitos_manuais.html`<br/>`devolucao_9018.html`<br/>`editar_mini_portal.html`<br/>`editarrecibos.html`<br/>`editpagmembros.html`<br/>`editpagpastores.html`<br/>`eventos/index.html`<br/>`eventosreg655.html`<br/>`financeiro_preditivo.html`<br/>`gerenciar_layout.html`<br/>`gerenciar_saldos.html`<br/>`gestao_agenda.html`<br/>`gestao_seminarios.html`<br/>`gestao_usuarios.html`<br/>`index.html`<br/>`layout_login.html`<br/>`login.html`<br/>`mini_portal.html`<br/>`pauta_0905.html`<br/>`pendenciasreg655.html`<br/>`portal.html`<br/>`presencareg655.html`<br/>`recibos_detalhados.html`<br/>`recibosreg655.html`<br/>`relatorio_avisos.html`<br/>`relatorio_pendencias.html`<br/>`s_contasreg655.html`<br/>`s_coordenadores_cidadania.html`<br/>`s_igrejas.html`<br/>`s_pastores.html`<br/>`saldodeviradareg655.html`<br/>`sorteio.html`<br/>`visualizar_como.html` | `gerenciar_layout.html`<br/>`index.html` |
| `index.html` | **Portal — Região 655** | `agendarapidareg655.html`<br/>`agendareg655.html`<br/>`backup.html`<br/>`controle_avisos.html`<br/>`controleeventosreg655.html`<br/>`coordenadorias.html`<br/>`dashreg655.html`<br/>`dashsaldo.html`<br/>`editarrecibos.html`<br/>`editpagpastores.html`<br/>`eventos/index.html`<br/>`eventosreg655.html`<br/>`financeiro_preditivo.html`<br/>`gerenciar_layout.html`<br/>`gerenciar_saldos.html`<br/>`gestao_usuarios.html`<br/>`levantamento_copel_sanepar.html`<br/>`login.html`<br/>`logs_auditoria.html`<br/>`pendenciasreg655.html`<br/>`presencaeventoaberto.html`<br/>`presencareg655.html`<br/>`recibos_detalhados.html`<br/>`recibosreg655.html`<br/>`relatorio_avisos.html`<br/>`relatorio_copel_sanepar.html`<br/>`relatorio_evento_aberto.html`<br/>`relatorio_pendencias.html`<br/>`s_igrejas.html`<br/>`s_pastores.html`<br/>`saldodeviradareg655.html`<br/>`visualizar_como.html` | `agenda_completa.html`<br/>`agendarapidaieqcentral.html`<br/>`agendarapidareg655.html`<br/>`agendaregiao655.html`<br/>`backup.html`<br/>`checklist.html`<br/>`controle_avisos.html`<br/>`controleeventosreg655.html`<br/>`coordenadorias.html`<br/>`dashreg655.html`<br/>`dashsaldo.html`<br/>`debitos_manuais.html`<br/>`devolucao_9018.html`<br/>`editar_mini_portal.html`<br/>`editarrecibos.html`<br/>`editpagmembros.html`<br/>`editpagpastores.html`<br/>`eventos/index.html`<br/>`eventosreg655.html`<br/>`financeiro_preditivo.html`<br/>`francamaster.html`<br/>`francapastores.html`<br/>`gerenciar_layout.html`<br/>`gerenciar_saldos.html`<br/>`gestao_agenda.html`<br/>`gestao_seminarios.html`<br/>`gestao_usuarios.html`<br/>`layout_login.html`<br/>`levantamento_copel_sanepar.html`<br/>`login.html`<br/>`logs_auditoria.html`<br/>`pendenciascontabeismaster.html`<br/>`pendenciascontabeispastores.html`<br/>`pendenciasreg655.html`<br/>`presencaeventoaberto.html`<br/>`presencareg655.html`<br/>`recibos_detalhados.html`<br/>`recibosreg655.html`<br/>`relatorio_avisos.html`<br/>`relatorio_copel_sanepar.html`<br/>`relatorio_evento_aberto.html`<br/>`relatorio_pendencias.html`<br/>`resumo_seminarios.html`<br/>`s_coordenadores_cidadania.html`<br/>`s_igrejas.html`<br/>`s_pastores.html`<br/>`saldodeviradareg655.html`<br/>`sorteio.html`<br/>`visualizador_offline.html`<br/>`visualizar_como.html` |
| `layout_login.html` | **Layout do Login — Região 655** | `agendaregiao655.html`<br/>`index.html`<br/>`presencareg655.html` | `gerenciar_layout.html` |
| `login.html` | **Login - Região 655** | `agendaregiao655.html`<br/>`index.html`<br/>`presencareg655.html` | `editar_mini_portal.html`<br/>`eventos/criar_evento.html`<br/>`gerenciar_layout.html`<br/>`gestao_agenda.html`<br/>`index.html`<br/>`mini_portal.html`<br/>`portal.html` |
| `mini_portal.html` | **Mini Portal — Região 655** | `agenda_completa.html`<br/>`gestao_agenda.html`<br/>`login.html`<br/>`pauta_0905.html`<br/>`presencareg655.html`<br/>`s_contasreg655.html`<br/>`sorteio.html` | `editar_mini_portal.html`<br/>`gerenciar_layout.html` |
| `portal.html` | **Portal — Região 655** | `login.html` | `editpagmembros.html`<br/>`gerenciar_layout.html` |
| `visualizar_como.html` | **Visualizar Como — Região 655** | `index.html` | `gerenciar_layout.html`<br/>`index.html` |

---

### 4.2 Módulo: Financeiro & Recibos

```mermaid
flowchart TD
    recibosreg655_html["recibosreg655.html<br/><small>Emissor de Recibos - Região 655</small>"]
    editarrecibos_html["editarrecibos.html<br/><small>Gerenciar Recibos - Região 655</small>"]
    recibos_detalhados_html["recibos_detalhados.html<br/><small>Detalhamento de Recibos - Região 655</small>"]
    dashreg655_html["dashreg655.html<br/><small>Caixa Região 655 - Gestão de Igrejas</small>"]
    saldodeviradareg655_html["saldodeviradareg655.html<br/><small>Virada de Mês - Admin - R655</small>"]
    gerenciar_saldos_html["gerenciar_saldos.html<br/><small>Gerenciar Saldos - Região 655</small>"]
    dashsaldo_html["dashsaldo.html<br/><small>Dashboard Financeiro - Igrejas</small>"]
    debitos_manuais_html["debitos_manuais.html<br/><small>Débitos Manuais — Região 655</small>"]
    pendenciasreg655_html["pendenciasreg655.html<br/><small>Pendências Rápidas - Região 655</small>"]
    relatorio_pendencias_html["relatorio_pendencias.html<br/><small>Relatório de Pendências - Região 655</small>"]
    pendenciascontabeismaster_html["pendenciascontabeismaster.html<br/><small>Gerenciar Pendências Contábeis — Região 655</small>"]
    pendenciascontabeispastores_html["pendenciascontabeispastores.html<br/><small>Minhas Pendências Contábeis — Região 655</small>"]
    financeiro_preditivo_html["financeiro_preditivo.html<br/><small>Financeiro Preditivo — Região 655</small>"]
    devolucao_9018_html["devolucao_9018.html<br/><small>Devolução 9018 — Região 655</small>"]
    francamaster_html["francamaster.html<br/><small>Painel Master França — Região 655</small>"]
    francapastores_html["francapastores.html<br/><small>Oferta para a França — Região 655</small>"]
    s_contasreg655_html["s_contasreg655.html<br/><small>Contas Correntes - Região 655</small>"]
    recibosreg655_html --> dashreg655_html
    recibosreg655_html --> editarrecibos_html
    editarrecibos_html --> dashreg655_html
    editarrecibos_html --> recibos_detalhados_html
    editarrecibos_html --> recibosreg655_html
    recibos_detalhados_html --> dashreg655_html
    recibos_detalhados_html --> editarrecibos_html
    recibos_detalhados_html --> recibos_detalhados_html
    recibos_detalhados_html --> recibosreg655_html
    dashreg655_html --> editarrecibos_html
    dashreg655_html --> recibos_detalhados_html
    dashreg655_html --> recibosreg655_html
    debitos_manuais_html --> pendenciasreg655_html
    pendenciasreg655_html --> debitos_manuais_html
    pendenciascontabeismaster_html --> pendenciascontabeispastores_html
    pendenciascontabeispastores_html --> pendenciascontabeismaster_html
    financeiro_preditivo_html --> dashreg655_html
    financeiro_preditivo_html --> recibosreg655_html
    francamaster_html --> francapastores_html
    francapastores_html --> francamaster_html
```

| Arquivo | Título da Página | Links de Saída (Aponta para) | Links de Entrada (Quem aponta para ela) |
| :--- | :--- | :--- | :--- |
| `dashreg655.html` | **Caixa Região 655 - Gestão de Igrejas** | `editarrecibos.html`<br/>`index.html`<br/>`recibos_detalhados.html`<br/>`recibosreg655.html` | `editarrecibos.html`<br/>`financeiro_preditivo.html`<br/>`gerenciar_layout.html`<br/>`index.html`<br/>`recibos_detalhados.html`<br/>`recibosreg655.html` |
| `dashsaldo.html` | **Dashboard Financeiro - Igrejas** | `index.html` | `gerenciar_layout.html`<br/>`index.html` |
| `debitos_manuais.html` | **Débitos Manuais — Região 655** | `index.html`<br/>`pendenciasreg655.html` | `gerenciar_layout.html`<br/>`pendenciasreg655.html` |
| `devolucao_9018.html` | **Devolução 9018 — Região 655** | `index.html` | `gerenciar_layout.html` |
| `editarrecibos.html` | **Gerenciar Recibos - Região 655** | `dashreg655.html`<br/>`index.html`<br/>`recibos_detalhados.html`<br/>`recibosreg655.html` | `dashreg655.html`<br/>`gerenciar_layout.html`<br/>`index.html`<br/>`recibos_detalhados.html`<br/>`recibosreg655.html` |
| `financeiro_preditivo.html` | **Financeiro Preditivo — Região 655** | `dashreg655.html`<br/>`index.html`<br/>`recibosreg655.html` | `gerenciar_layout.html`<br/>`index.html` |
| `francamaster.html` | **Painel Master França — Região 655** | `francapastores.html`<br/>`index.html` | `francapastores.html` |
| `francapastores.html` | **Oferta para a França — Região 655** | `francamaster.html`<br/>`index.html` | `francamaster.html` |
| `gerenciar_saldos.html` | **Gerenciar Saldos - Região 655** | `index.html` | `gerenciar_layout.html`<br/>`index.html` |
| `pendenciascontabeismaster.html` | **Gerenciar Pendências Contábeis — Região 655** | `index.html`<br/>`pendenciascontabeispastores.html` | `pendenciascontabeispastores.html` |
| `pendenciascontabeispastores.html` | **Minhas Pendências Contábeis — Região 655** | `index.html`<br/>`pendenciascontabeismaster.html` | `pendenciascontabeismaster.html` |
| `pendenciasreg655.html` | **Pendências Rápidas - Região 655** | `debitos_manuais.html`<br/>`index.html` | `debitos_manuais.html`<br/>`gerenciar_layout.html`<br/>`index.html` |
| `recibos_detalhados.html` | **Detalhamento de Recibos - Região 655** | `dashreg655.html`<br/>`editarrecibos.html`<br/>`index.html`<br/>`recibos_detalhados.html`<br/>`recibosreg655.html` | `dashreg655.html`<br/>`editarrecibos.html`<br/>`gerenciar_layout.html`<br/>`index.html`<br/>`recibos_detalhados.html` |
| `recibosreg655.html` | **Emissor de Recibos - Região 655** | `dashreg655.html`<br/>`editarrecibos.html`<br/>`index.html` | `dashreg655.html`<br/>`editarrecibos.html`<br/>`financeiro_preditivo.html`<br/>`gerenciar_layout.html`<br/>`index.html`<br/>`recibos_detalhados.html` |
| `relatorio_pendencias.html` | **Relatório de Pendências - Região 655** | `index.html` | `gerenciar_layout.html`<br/>`index.html` |
| `s_contasreg655.html` | **Contas Correntes - Região 655** | *Nenhum (página terminal)* | `editar_mini_portal.html`<br/>`gerenciar_layout.html`<br/>`mini_portal.html` |
| `saldodeviradareg655.html` | **Virada de Mês - Admin - R655** | `index.html` | `gerenciar_layout.html`<br/>`index.html` |

---

### 4.3 Módulo: Eventos & Presenças (Geral)

```mermaid
flowchart TD
    eventosreg655_html["eventosreg655.html<br/><small>Gestão de Eventos - Região 655</small>"]
    controleeventosreg655_html["controleeventosreg655.html<br/><small>Controle de Eventos e Presenças - Região 655</small>"]
    presencareg655_html["presencareg655.html<br/><small>Presença de Pastores - Região 655</small>"]
    presencaeventoaberto_html["presencaeventoaberto.html<br/><small>Registro de Presença - Evento Aberto - Região 655</small>"]
    relatorio_evento_aberto_html["relatorio_evento_aberto.html<br/><small>Relatório de Eventos Abertos - Região 655</small>"]
    eventos_index_html["eventos/index.html<br/><small>Central de Congressos — Região 655</small>"]
    eventos_gestao_html["eventos/gestao.html<br/><small>Gestão do Evento — Região 655</small>"]
    eventos_criar_evento_html["eventos/criar_evento.html<br/><small>Criar / Editar Evento — Região 655</small>"]
    eventos_inscricao_html["eventos/inscricao.html<br/><small>Inscrição para Evento — Região 655</small>"]
    eventos_financeiro_html["eventos/financeiro.html<br/><small>Painel Financeiro Consolidado — Região 655</small>"]
    presencareg655_html --> presencaeventoaberto_html
    eventos_index_html --> eventos_criar_evento_html
    eventos_index_html --> eventos_financeiro_html
    eventos_index_html --> eventos_gestao_html
    eventos_index_html --> eventos_inscricao_html
    eventos_gestao_html --> eventos_criar_evento_html
    eventos_gestao_html --> eventos_index_html
    eventos_criar_evento_html --> eventos_index_html
    eventos_inscricao_html --> eventos_index_html
    eventos_financeiro_html --> eventos_index_html
```

| Arquivo | Título da Página | Links de Saída (Aponta para) | Links de Entrada (Quem aponta para ela) |
| :--- | :--- | :--- | :--- |
| `controleeventosreg655.html` | **Controle de Eventos e Presenças - Região 655** | `index.html` | `gerenciar_layout.html`<br/>`index.html` |
| `eventos/criar_evento.html` | **Criar / Editar Evento — Região 655** | `eventos/index.html`<br/>`login.html` | `eventos/gestao.html`<br/>`eventos/index.html` |
| `eventos/financeiro.html` | **Painel Financeiro Consolidado — Região 655** | `eventos/index.html` | `eventos/index.html` |
| `eventos/gestao.html` | **Gestão do Evento — Região 655** | `eventos/criar_evento.html`<br/>`eventos/index.html` | `eventos/index.html` |
| `eventos/index.html` | **Central de Congressos — Região 655** | `eventos/congressodemulheres/index.html`<br/>`eventos/congressodiaconato/index.html`<br/>`eventos/criar_evento.html`<br/>`eventos/financeiro.html`<br/>`eventos/gestao.html`<br/>`eventos/inscricao.html`<br/>`eventos/jovens/index.html`<br/>`index.html` | `eventos/criar_evento.html`<br/>`eventos/financeiro.html`<br/>`eventos/gestao.html`<br/>`eventos/inscricao.html`<br/>`gerenciar_layout.html`<br/>`index.html` |
| `eventos/inscricao.html` | **Inscrição para Evento — Região 655** | `eventos/index.html` | `eventos/index.html` |
| `eventosreg655.html` | **Gestão de Eventos - Região 655** | `index.html` | `gerenciar_layout.html`<br/>`index.html` |
| `presencaeventoaberto.html` | **Registro de Presença - Evento Aberto - Região 655** | `index.html` | `index.html`<br/>`presencareg655.html` |
| `presencareg655.html` | **Presença de Pastores - Região 655** | `index.html`<br/>`presencaeventoaberto.html` | `editar_mini_portal.html`<br/>`gerenciar_layout.html`<br/>`index.html`<br/>`layout_login.html`<br/>`login.html`<br/>`mini_portal.html` |
| `relatorio_evento_aberto.html` | **Relatório de Eventos Abertos - Região 655** | `index.html` | `index.html` |

---

### 4.4 Módulo: Eventos Específicos (Congressos)

```mermaid
flowchart TD
    eventos_congressodemulheres_igrejas_html["eventos/congressodemulheres/igrejas.html<br/><small>Igrejas — Congresso de Mulheres</small>"]
    eventos_congressodemulheres_index_html["eventos/congressodemulheres/index.html<br/><small>Congresso de Mulheres — IEQ Região 655</small>"]
    eventos_congressodemulheres_inscricoes_html["eventos/congressodemulheres/inscricoes.html<br/><small>Inscrições — Congresso de Mulheres</small>"]
    eventos_congressodemulheres_manual_html["eventos/congressodemulheres/manual.html<br/><small>Manual — Congresso de Mulheres</small>"]
    eventos_congressodemulheres_pagamentos_html["eventos/congressodemulheres/pagamentos.html<br/><small>Pagamentos — Congresso de Mulheres</small>"]
    eventos_congressodemulheres_relatorios_html["eventos/congressodemulheres/relatorios.html<br/><small>Relatórios — Congresso de Mulheres</small>"]
    eventos_congressodiaconato_igrejas_html["eventos/congressodiaconato/igrejas.html<br/><small>Igrejas — Congresso do Diaconato</small>"]
    eventos_congressodiaconato_index_html["eventos/congressodiaconato/index.html<br/><small>Congresso do Diaconato — IEQ Região 655</small>"]
    eventos_congressodiaconato_inscricoes_html["eventos/congressodiaconato/inscricoes.html<br/><small>Inscrições — Congresso do Diaconato</small>"]
    eventos_congressodiaconato_manual_html["eventos/congressodiaconato/manual.html<br/><small>Manual — Congresso do Diaconato</small>"]
    eventos_congressodiaconato_pagamentos_html["eventos/congressodiaconato/pagamentos.html<br/><small>Pagamentos — Congresso do Diaconato</small>"]
    eventos_congressodiaconato_relatorios_html["eventos/congressodiaconato/relatorios.html<br/><small>Relatórios — Congresso do Diaconato</small>"]
    eventos_jovens_index_html["eventos/jovens/index.html<br/><small>Painel — Congresso de Jovens</small>"]
    eventos_jovens_inscricoes_html["eventos/jovens/inscricoes.html<br/><small>Inscrições — Congresso de Jovens</small>"]
    eventos_congressodemulheres_igrejas_html --> eventos_congressodemulheres_index_html
    eventos_congressodemulheres_index_html --> eventos_congressodemulheres_igrejas_html
    eventos_congressodemulheres_index_html --> eventos_congressodemulheres_inscricoes_html
    eventos_congressodemulheres_index_html --> eventos_congressodemulheres_manual_html
    eventos_congressodemulheres_index_html --> eventos_congressodemulheres_pagamentos_html
    eventos_congressodemulheres_index_html --> eventos_congressodemulheres_relatorios_html
    eventos_congressodemulheres_inscricoes_html --> eventos_congressodemulheres_igrejas_html
    eventos_congressodemulheres_inscricoes_html --> eventos_congressodemulheres_index_html
    eventos_congressodemulheres_manual_html --> eventos_congressodemulheres_index_html
    eventos_congressodemulheres_pagamentos_html --> eventos_congressodemulheres_igrejas_html
    eventos_congressodemulheres_pagamentos_html --> eventos_congressodemulheres_index_html
    eventos_congressodemulheres_relatorios_html --> eventos_congressodemulheres_index_html
    eventos_congressodiaconato_igrejas_html --> eventos_congressodiaconato_index_html
    eventos_congressodiaconato_index_html --> eventos_congressodiaconato_igrejas_html
    eventos_congressodiaconato_index_html --> eventos_congressodiaconato_inscricoes_html
    eventos_congressodiaconato_index_html --> eventos_congressodiaconato_manual_html
    eventos_congressodiaconato_index_html --> eventos_congressodiaconato_pagamentos_html
    eventos_congressodiaconato_index_html --> eventos_congressodiaconato_relatorios_html
    eventos_congressodiaconato_inscricoes_html --> eventos_congressodiaconato_igrejas_html
    eventos_congressodiaconato_inscricoes_html --> eventos_congressodiaconato_index_html
    eventos_congressodiaconato_manual_html --> eventos_congressodiaconato_index_html
    eventos_congressodiaconato_pagamentos_html --> eventos_congressodiaconato_igrejas_html
    eventos_congressodiaconato_pagamentos_html --> eventos_congressodiaconato_index_html
    eventos_congressodiaconato_relatorios_html --> eventos_congressodiaconato_index_html
    eventos_jovens_index_html --> eventos_jovens_inscricoes_html
    eventos_jovens_inscricoes_html --> eventos_jovens_index_html
```

| Arquivo | Título da Página | Links de Saída (Aponta para) | Links de Entrada (Quem aponta para ela) |
| :--- | :--- | :--- | :--- |
| `eventos/congressodemulheres/igrejas.html` | **Igrejas — Congresso de Mulheres** | `eventos/congressodemulheres/index.html` | `eventos/congressodemulheres/index.html`<br/>`eventos/congressodemulheres/inscricoes.html`<br/>`eventos/congressodemulheres/pagamentos.html` |
| `eventos/congressodemulheres/index.html` | **Congresso de Mulheres — IEQ Região 655** | `eventos/congressodemulheres/igrejas.html`<br/>`eventos/congressodemulheres/inscricoes.html`<br/>`eventos/congressodemulheres/manual.html`<br/>`eventos/congressodemulheres/pagamentos.html`<br/>`eventos/congressodemulheres/relatorios.html` | `eventos/congressodemulheres/igrejas.html`<br/>`eventos/congressodemulheres/inscricoes.html`<br/>`eventos/congressodemulheres/manual.html`<br/>`eventos/congressodemulheres/pagamentos.html`<br/>`eventos/congressodemulheres/relatorios.html`<br/>`eventos/index.html` |
| `eventos/congressodemulheres/inscricoes.html` | **Inscrições — Congresso de Mulheres** | `eventos/congressodemulheres/igrejas.html`<br/>`eventos/congressodemulheres/index.html` | `eventos/congressodemulheres/index.html` |
| `eventos/congressodemulheres/manual.html` | **Manual — Congresso de Mulheres** | `eventos/congressodemulheres/index.html` | `eventos/congressodemulheres/index.html` |
| `eventos/congressodemulheres/pagamentos.html` | **Pagamentos — Congresso de Mulheres** | `eventos/congressodemulheres/igrejas.html`<br/>`eventos/congressodemulheres/index.html` | `eventos/congressodemulheres/index.html` |
| `eventos/congressodemulheres/relatorios.html` | **Relatórios — Congresso de Mulheres** | `eventos/congressodemulheres/index.html` | `eventos/congressodemulheres/index.html` |
| `eventos/congressodiaconato/igrejas.html` | **Igrejas — Congresso do Diaconato** | `eventos/congressodiaconato/index.html` | `eventos/congressodiaconato/index.html`<br/>`eventos/congressodiaconato/inscricoes.html`<br/>`eventos/congressodiaconato/pagamentos.html` |
| `eventos/congressodiaconato/index.html` | **Congresso do Diaconato — IEQ Região 655** | `eventos/congressodiaconato/igrejas.html`<br/>`eventos/congressodiaconato/inscricoes.html`<br/>`eventos/congressodiaconato/manual.html`<br/>`eventos/congressodiaconato/pagamentos.html`<br/>`eventos/congressodiaconato/relatorios.html` | `eventos/congressodiaconato/igrejas.html`<br/>`eventos/congressodiaconato/inscricoes.html`<br/>`eventos/congressodiaconato/manual.html`<br/>`eventos/congressodiaconato/pagamentos.html`<br/>`eventos/congressodiaconato/relatorios.html`<br/>`eventos/index.html` |
| `eventos/congressodiaconato/inscricoes.html` | **Inscrições — Congresso do Diaconato** | `eventos/congressodiaconato/igrejas.html`<br/>`eventos/congressodiaconato/index.html` | `eventos/congressodiaconato/index.html` |
| `eventos/congressodiaconato/manual.html` | **Manual — Congresso do Diaconato** | `eventos/congressodiaconato/index.html` | `eventos/congressodiaconato/index.html` |
| `eventos/congressodiaconato/pagamentos.html` | **Pagamentos — Congresso do Diaconato** | `eventos/congressodiaconato/igrejas.html`<br/>`eventos/congressodiaconato/index.html` | `eventos/congressodiaconato/index.html` |
| `eventos/congressodiaconato/relatorios.html` | **Relatórios — Congresso do Diaconato** | `eventos/congressodiaconato/index.html` | `eventos/congressodiaconato/index.html` |
| `eventos/jovens/index.html` | **Painel — Congresso de Jovens** | `eventos/jovens/inscricoes.html` | `eventos/index.html`<br/>`eventos/jovens/inscricoes.html` |
| `eventos/jovens/inscricoes.html` | **Inscrições — Congresso de Jovens** | `eventos/jovens/index.html` | `eventos/jovens/index.html` |

---

### 4.5 Módulo: Agenda

```mermaid
flowchart TD
    agenda_completa_html["agenda_completa.html<br/><small>Agenda Completa</small>"]
    agenda_publicaieq_html["agenda_publicaieq.html<br/><small>Agenda Pública IEQ</small>"]
    agendaieqcentral_html["agendaieqcentral.html<br/><small>Agenda IEQ Central 2026</small>"]
    agendarapidaieqcentral_html["agendarapidaieqcentral.html<br/><small>Agenda Rápida IEQ Central 2026</small>"]
    agendarapidareg655_html["agendarapidareg655.html<br/><small>Agenda Rápida IEQ 2026</small>"]
    agendareg655_html["agendareg655.html<br/><small>Agenda Região 655 | CED | CND</small>"]
    agendaregiao655_html["agendaregiao655.html<br/><small>Agenda Região 655</small>"]
    gestao_agenda_html["gestao_agenda.html<br/><small>Gestão da Agenda Regional - Região 655</small>"]
    agendaieqcentral_html --> agendarapidaieqcentral_html
    agendarapidaieqcentral_html --> agendaieqcentral_html
    agendarapidareg655_html --> agendareg655_html
    agendareg655_html --> agendarapidareg655_html
```

| Arquivo | Título da Página | Links de Saída (Aponta para) | Links de Entrada (Quem aponta para ela) |
| :--- | :--- | :--- | :--- |
| `agenda_completa.html` | **Agenda Completa** | `index.html` | `editar_mini_portal.html`<br/>`gerenciar_layout.html`<br/>`mini_portal.html` |
| `agenda_publicaieq.html` | **Agenda Pública IEQ** | *Nenhum (página terminal)* | `gerenciar_layout.html` |
| `agendaieqcentral.html` | **Agenda IEQ Central 2026** | `agendarapidaieqcentral.html` | `agendarapidaieqcentral.html`<br/>`gerenciar_layout.html` |
| `agendarapidaieqcentral.html` | **Agenda Rápida IEQ Central 2026** | `agendaieqcentral.html`<br/>`index.html` | `agendaieqcentral.html`<br/>`gerenciar_layout.html` |
| `agendarapidareg655.html` | **Agenda Rápida IEQ 2026** | `agendareg655.html`<br/>`index.html` | `agendareg655.html`<br/>`gerenciar_layout.html`<br/>`index.html` |
| `agendareg655.html` | **Agenda Região 655 | CED | CND** | `agendarapidareg655.html` | `agendarapidareg655.html`<br/>`gerenciar_layout.html`<br/>`index.html` |
| `agendaregiao655.html` | **Agenda Região 655** | `index.html` | `gerenciar_layout.html`<br/>`layout_login.html`<br/>`login.html` |
| `gestao_agenda.html` | **Gestão da Agenda Regional - Região 655** | `index.html`<br/>`login.html` | `editar_mini_portal.html`<br/>`gerenciar_layout.html`<br/>`mini_portal.html` |

---

### 4.6 Módulo: Cadastros & Gestão

```mermaid
flowchart TD
    s_igrejas_html["s_igrejas.html<br/><small>Igrejas - Região 655</small>"]
    s_pastores_html["s_pastores.html<br/><small>Pastores - Região 655</small>"]
    coordenadorias_html["coordenadorias.html<br/><small>Coordenadorias - Região 655</small>"]
    gestao_usuarios_html["gestao_usuarios.html<br/><small>Gestão de Usuários e Acessos - Região 655</small>"]
    gestao_seminarios_html["gestao_seminarios.html<br/><small>Gestão de Seminários - Região 655</small>"]
    resumo_seminarios_html["resumo_seminarios.html<br/><small>Resumo dos Seminários - Região 655</small>"]
    s_coordenadores_cidadania_html["s_coordenadores_cidadania.html<br/><small>Coordenadores de Cidadania - Região 655</small>"]
    editpagpastores_html["editpagpastores.html<br/><small>Editar Painel dos Pastores - Região 655</small>"]
    editpagmembros_html["editpagmembros.html<br/><small>Gestão do Portal Público Membros - Região 655</small>"]
    editar_mini_portal_html["editar_mini_portal.html<br/><small>Editar Mini Portal — Região 655</small>"]
    gestao_seminarios_html --> resumo_seminarios_html
    gestao_seminarios_html --> s_coordenadores_cidadania_html
    resumo_seminarios_html --> gestao_seminarios_html
    s_coordenadores_cidadania_html --> gestao_seminarios_html
```

| Arquivo | Título da Página | Links de Saída (Aponta para) | Links de Entrada (Quem aponta para ela) |
| :--- | :--- | :--- | :--- |
| `coordenadorias.html` | **Coordenadorias - Região 655** | `index.html` | `gerenciar_layout.html`<br/>`index.html` |
| `editar_mini_portal.html` | **Editar Mini Portal — Região 655** | `agenda_completa.html`<br/>`gestao_agenda.html`<br/>`index.html`<br/>`login.html`<br/>`mini_portal.html`<br/>`pauta_0905.html`<br/>`presencareg655.html`<br/>`s_contasreg655.html`<br/>`sorteio.html` | `gerenciar_layout.html` |
| `editpagmembros.html` | **Gestão do Portal Público (Membros) - Região 655** | `index.html`<br/>`portal.html` | `gerenciar_layout.html` |
| `editpagpastores.html` | **Editar Painel dos Pastores - Região 655** | `controle_avisos.html`<br/>`index.html` | `controle_avisos.html`<br/>`gerenciar_layout.html`<br/>`index.html` |
| `gestao_seminarios.html` | **Gestão de Seminários - Região 655** | `index.html`<br/>`resumo_seminarios.html`<br/>`s_coordenadores_cidadania.html` | `gerenciar_layout.html`<br/>`resumo_seminarios.html`<br/>`s_coordenadores_cidadania.html` |
| `gestao_usuarios.html` | **Gestão de Usuários e Acessos - Região 655** | `backup.html`<br/>`index.html` | `gerenciar_layout.html`<br/>`index.html` |
| `resumo_seminarios.html` | **Resumo dos Seminários - Região 655** | `gestao_seminarios.html`<br/>`index.html` | `gestao_seminarios.html` |
| `s_coordenadores_cidadania.html` | **Coordenadores de Cidadania - Região 655** | `gestao_seminarios.html`<br/>`index.html` | `gerenciar_layout.html`<br/>`gestao_seminarios.html` |
| `s_igrejas.html` | **Igrejas - Região 655** | `index.html` | `gerenciar_layout.html`<br/>`index.html` |
| `s_pastores.html` | **Pastores - Região 655** | `index.html` | `gerenciar_layout.html`<br/>`index.html` |

---

### 4.7 Módulo: Comunicação & Levantamentos

```mermaid
flowchart TD
    controle_avisos_html["controle_avisos.html<br/><small>Controle de Avisos — Região 655</small>"]
    relatorio_avisos_html["relatorio_avisos.html<br/><small>Relatório de Avisos — Região 655</small>"]
    levantamento_copel_sanepar_html["levantamento_copel_sanepar.html<br/><small>Levantamento COPEL e SANEPAR - Região 655</small>"]
    relatorio_copel_sanepar_html["relatorio_copel_sanepar.html<br/><small>Relatório COPEL e SANEPAR - Região 655</small>"]
    controle_avisos_html --> controle_avisos_html
    controle_avisos_html --> relatorio_avisos_html
    relatorio_avisos_html --> controle_avisos_html
    relatorio_copel_sanepar_html --> levantamento_copel_sanepar_html
```

| Arquivo | Título da Página | Links de Saída (Aponta para) | Links de Entrada (Quem aponta para ela) |
| :--- | :--- | :--- | :--- |
| `controle_avisos.html` | **Controle de Avisos — Região 655** | `controle_avisos.html`<br/>`editpagpastores.html`<br/>`index.html`<br/>`relatorio_avisos.html` | `controle_avisos.html`<br/>`editpagpastores.html`<br/>`gerenciar_layout.html`<br/>`index.html`<br/>`relatorio_avisos.html` |
| `levantamento_copel_sanepar.html` | **Levantamento COPEL e SANEPAR - Região 655** | `index.html` | `index.html`<br/>`relatorio_copel_sanepar.html` |
| `relatorio_avisos.html` | **Relatório de Avisos — Região 655** | `controle_avisos.html`<br/>`index.html` | `controle_avisos.html`<br/>`gerenciar_layout.html`<br/>`index.html` |
| `relatorio_copel_sanepar.html` | **Relatório COPEL e SANEPAR - Região 655** | `index.html`<br/>`levantamento_copel_sanepar.html` | `index.html` |

---

### 4.8 Módulo: Operacional, Segurança & Utilitários

```mermaid
flowchart TD
    checklist_html["checklist.html<br/><small>Checklist — Região 655</small>"]
    relatoriodeviagem_html["relatoriodeviagem.html<br/><small>Sistema de Relatório de Viagem - IEQ</small>"]
    backup_html["backup.html<br/><small>Backup e Restauração de Dados — Região 655</small>"]
    visualizador_offline_html["visualizador_offline.html<br/><small>Visualizador Offline de Dados — Região 655</small>"]
    logs_auditoria_html["logs_auditoria.html<br/><small>Log de Auditoria e Atividades - Região 655</small>"]
    sorteio_html["sorteio.html<br/><small>Sorteio de Igrejas — Região 655</small>"]
    pauta_0905_html["pauta_0905.html<br/><small>Pauta Reunião Ministerial - 09/05/2026</small>"]
    backup_html --> visualizador_offline_html
```

| Arquivo | Título da Página | Links de Saída (Aponta para) | Links de Entrada (Quem aponta para ela) |
| :--- | :--- | :--- | :--- |
| `backup.html` | **Backup e Restauração de Dados — Região 655** | `index.html`<br/>`visualizador_offline.html` | `gerenciar_layout.html`<br/>`gestao_usuarios.html`<br/>`index.html` |
| `checklist.html` | **Checklist — Região 655** | `index.html` | `gerenciar_layout.html` |
| `logs_auditoria.html` | **Log de Auditoria e Atividades - Região 655** | `index.html` | `index.html` |
| `pauta_0905.html` | **Pauta Reunião Ministerial - 09/05/2026** | *Nenhum (página terminal)* | `editar_mini_portal.html`<br/>`gerenciar_layout.html`<br/>`mini_portal.html` |
| `relatoriodeviagem.html` | **Sistema de Relatório de Viagem - IEQ** | *Nenhum (página terminal)* | ⚠️ **Nenhum (órfã)** |
| `sorteio.html` | **Sorteio de Igrejas — Região 655** | `index.html` | `editar_mini_portal.html`<br/>`gerenciar_layout.html`<br/>`mini_portal.html` |
| `visualizador_offline.html` | **Visualizador Offline de Dados — Região 655** | `index.html` | `backup.html` |

---

## 5. Tabela Completa Alfabética (Índice de Todas as 77 Páginas)

| # | Arquivo HTML | Título | Saídas (Out) | Entradas (In) |
| :---: | :--- | :--- | :---: | :---: |
| 1 | `agenda_completa.html` | Agenda Completa | 1 | 3 |
| 2 | `agenda_publicaieq.html` | Agenda Pública IEQ | 0 | 1 |
| 3 | `agendaieqcentral.html` | Agenda IEQ Central 2026 | 1 | 2 |
| 4 | `agendarapidaieqcentral.html` | Agenda Rápida IEQ Central 2026 | 2 | 2 |
| 5 | `agendarapidareg655.html` | Agenda Rápida IEQ 2026 | 2 | 3 |
| 6 | `agendareg655.html` | Agenda Região 655 | CED | CND | 1 | 3 |
| 7 | `agendaregiao655.html` | Agenda Região 655 | 1 | 3 |
| 8 | `backup.html` | Backup e Restauração de Dados — Região 655 | 2 | 3 |
| 9 | `checklist.html` | Checklist — Região 655 | 1 | 1 |
| 10 | `controle_avisos.html` | Controle de Avisos — Região 655 | 4 | 5 |
| 11 | `controleeventosreg655.html` | Controle de Eventos e Presenças - Região 655 | 1 | 2 |
| 12 | `coordenadorias.html` | Coordenadorias - Região 655 | 1 | 2 |
| 13 | `dashreg655.html` | Caixa Região 655 - Gestão de Igrejas | 4 | 6 |
| 14 | `dashsaldo.html` | Dashboard Financeiro - Igrejas | 1 | 2 |
| 15 | `debitos_manuais.html` | Débitos Manuais — Região 655 | 2 | 2 |
| 16 | `devolucao_9018.html` | Devolução 9018 — Região 655 | 1 | 1 |
| 17 | `editar_mini_portal.html` | Editar Mini Portal — Região 655 | 9 | 1 |
| 18 | `editarrecibos.html` | Gerenciar Recibos - Região 655 | 4 | 5 |
| 19 | `editpagmembros.html` | Gestão do Portal Público (Membros) - Região 655 | 2 | 1 |
| 20 | `editpagpastores.html` | Editar Painel dos Pastores - Região 655 | 2 | 3 |
| 21 | `eventos/congressodemulheres/igrejas.html` | Igrejas — Congresso de Mulheres | 1 | 3 |
| 22 | `eventos/congressodemulheres/index.html` | Congresso de Mulheres — IEQ Região 655 | 5 | 6 |
| 23 | `eventos/congressodemulheres/inscricoes.html` | Inscrições — Congresso de Mulheres | 2 | 1 |
| 24 | `eventos/congressodemulheres/manual.html` | Manual — Congresso de Mulheres | 1 | 1 |
| 25 | `eventos/congressodemulheres/pagamentos.html` | Pagamentos — Congresso de Mulheres | 2 | 1 |
| 26 | `eventos/congressodemulheres/relatorios.html` | Relatórios — Congresso de Mulheres | 1 | 1 |
| 27 | `eventos/congressodiaconato/igrejas.html` | Igrejas — Congresso do Diaconato | 1 | 3 |
| 28 | `eventos/congressodiaconato/index.html` | Congresso do Diaconato — IEQ Região 655 | 5 | 6 |
| 29 | `eventos/congressodiaconato/inscricoes.html` | Inscrições — Congresso do Diaconato | 2 | 1 |
| 30 | `eventos/congressodiaconato/manual.html` | Manual — Congresso do Diaconato | 1 | 1 |
| 31 | `eventos/congressodiaconato/pagamentos.html` | Pagamentos — Congresso do Diaconato | 2 | 1 |
| 32 | `eventos/congressodiaconato/relatorios.html` | Relatórios — Congresso do Diaconato | 1 | 1 |
| 33 | `eventos/criar_evento.html` | Criar / Editar Evento — Região 655 | 2 | 2 |
| 34 | `eventos/financeiro.html` | Painel Financeiro Consolidado — Região 655 | 1 | 1 |
| 35 | `eventos/gestao.html` | Gestão do Evento — Região 655 | 2 | 1 |
| 36 | `eventos/index.html` | Central de Congressos — Região 655 | 8 | 6 |
| 37 | `eventos/inscricao.html` | Inscrição para Evento — Região 655 | 1 | 1 |
| 38 | `eventos/jovens/index.html` | Painel — Congresso de Jovens | 1 | 2 |
| 39 | `eventos/jovens/inscricoes.html` | Inscrições — Congresso de Jovens | 1 | 1 |
| 40 | `eventosreg655.html` | Gestão de Eventos - Região 655 | 1 | 2 |
| 41 | `financeiro_preditivo.html` | Financeiro Preditivo — Região 655 | 3 | 2 |
| 42 | `francamaster.html` | Painel Master França — Região 655 | 2 | 1 |
| 43 | `francapastores.html` | Oferta para a França — Região 655 | 2 | 1 |
| 44 | `gerenciar_layout.html` | Gerenciar Layout — Região 655 | 47 | 2 |
| 45 | `gerenciar_saldos.html` | Gerenciar Saldos - Região 655 | 1 | 2 |
| 46 | `gestao_agenda.html` | Gestão da Agenda Regional - Região 655 | 2 | 3 |
| 47 | `gestao_seminarios.html` | Gestão de Seminários - Região 655 | 3 | 3 |
| 48 | `gestao_usuarios.html` | Gestão de Usuários e Acessos - Região 655 | 2 | 2 |
| 49 | `index.html` | Portal — Região 655 | 32 | 50 |
| 50 | `layout_login.html` | Layout do Login — Região 655 | 3 | 1 |
| 51 | `levantamento_copel_sanepar.html` | Levantamento COPEL e SANEPAR - Região 655 | 1 | 2 |
| 52 | `login.html` | Login - Região 655 | 3 | 7 |
| 53 | `logs_auditoria.html` | Log de Auditoria e Atividades - Região 655 | 1 | 1 |
| 54 | `mini_portal.html` | Mini Portal — Região 655 | 7 | 2 |
| 55 | `pauta_0905.html` | Pauta Reunião Ministerial - 09/05/2026 | 0 | 3 |
| 56 | `pendenciascontabeismaster.html` | Gerenciar Pendências Contábeis — Região 655 | 2 | 1 |
| 57 | `pendenciascontabeispastores.html` | Minhas Pendências Contábeis — Região 655 | 2 | 1 |
| 58 | `pendenciasreg655.html` | Pendências Rápidas - Região 655 | 2 | 3 |
| 59 | `portal.html` | Portal — Região 655 | 1 | 2 |
| 60 | `presencaeventoaberto.html` | Registro de Presença - Evento Aberto - Região 655 | 1 | 2 |
| 61 | `presencareg655.html` | Presença de Pastores - Região 655 | 2 | 6 |
| 62 | `recibos_detalhados.html` | Detalhamento de Recibos - Região 655 | 5 | 5 |
| 63 | `recibosreg655.html` | Emissor de Recibos - Região 655 | 3 | 6 |
| 64 | `relatorio_avisos.html` | Relatório de Avisos — Região 655 | 2 | 3 |
| 65 | `relatorio_copel_sanepar.html` | Relatório COPEL e SANEPAR - Região 655 | 2 | 1 |
| 66 | `relatorio_evento_aberto.html` | Relatório de Eventos Abertos - Região 655 | 1 | 1 |
| 67 | `relatorio_pendencias.html` | Relatório de Pendências - Região 655 | 1 | 2 |
| 68 | `relatoriodeviagem.html` | Sistema de Relatório de Viagem - IEQ | 0 | 0 |
| 69 | `resumo_seminarios.html` | Resumo dos Seminários - Região 655 | 2 | 1 |
| 70 | `s_contasreg655.html` | Contas Correntes - Região 655 | 0 | 3 |
| 71 | `s_coordenadores_cidadania.html` | Coordenadores de Cidadania - Região 655 | 2 | 2 |
| 72 | `s_igrejas.html` | Igrejas - Região 655 | 1 | 2 |
| 73 | `s_pastores.html` | Pastores - Região 655 | 1 | 2 |
| 74 | `saldodeviradareg655.html` | Virada de Mês - Admin - R655 | 1 | 2 |
| 75 | `sorteio.html` | Sorteio de Igrejas — Região 655 | 1 | 3 |
| 76 | `visualizador_offline.html` | Visualizador Offline de Dados — Região 655 | 1 | 1 |
| 77 | `visualizar_como.html` | Visualizar Como — Região 655 | 1 | 2 |
| 78 | `campanha_projeto_vida_2027.html` | Pedido de Kits & Chaves — Projeto de Vida 2027 | 3 | 2 |
| 79 | `campanha_projeto_vida_admin.html` | Gestão e Consolidação de Pedidos — Projeto de Vida 2027 | 2 | 2 |

---

## 6. Diagnóstico de Navegação & Recomendações de Melhoria

Ao analisar as conexões de todas as páginas, foram identificados alguns pontos pontuais de atenção na experiência do usuário (UX):

### 1. Páginas Órfãs (Sem Links de Entrada)
- **`relatoriodeviagem.html`**: Não possui nenhum link interno apontando para ela a partir de outra página HTML do sistema. Se ela ainda é necessária, recomenda-se adicionar um atalho no `index.html` ou no menu de relatórios.

### 2. Páginas Terminais (Sem Links de Saída para o Sistema)
Estas páginas não possuem link de retorno ou navegação interna explícita no HTML (o usuário precisa usar o botão 'Voltar' do navegador):
- **`agenda_publicaieq.html`**: Página de visualização pública (comportamento aceitável se for somente leitura externa).
- **`pauta_0905.html`**: Documento/pauta estático sem botão de retorno.
- **`relatoriodeviagem.html`**: Página estática/formulário sem retorno.
- **`s_contasreg655.html`**: Prestação de contas sem link de retorno explícito para `index.html`.

### 3. Coerência dos Menus de Navegação
- O padrão do sistema utiliza a barra de cabeçalho com links para `index.html`, ou botões de "Voltar ao Início". Praticamente 95% do sistema está fortemente conectado de forma bidirecional ao hub principal `index.html`.

