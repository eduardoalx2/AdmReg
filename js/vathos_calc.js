/**
 * js/vathos_calc.js — Motor de Regras, Configuração e Cálculos do Portal VATHOS 2027
 *
 * Diretrizes:
 * - Mantém valores, datas, lotes, modalidades e regras 100% configuráveis via Firestore (vathos_2027_config/geral).
 * - Preserva todos os 23 pontos "A definir" explicitamente sinalizados, sem assumir valores não aprovados.
 * - Implementa o cálculo exato de Parcelamento Livre por Percentual (inclusive desconto infantil de 30% para 5 a 8 anos).
 * - Categorias diferenciadas (Líder, Equipe de trabalho, Pastor Titular) usam preço padrão até aprovação explícita pela administração.
 */

export const VATHOS_DEFAULT_CONFIG = {
    evento: {
        nome: 'VATHOS 2027',
        tipo: 'Retiro regional de jovens e adolescentes',
        tema: 'Por inteiro',
        slogan: 'Não apenas uma parte de nós, tudo para Ele',
        versiculoChave: 'Marcos 12:30',
        textoVersiculo: '“Ame ao Senhor, o seu Deus, com todo o seu coração, com toda a sua alma, com todo o seu entendimento e com todas as suas forças”.',
        dataInicio: '2027-03-26',
        dataFim: '2027-03-28',
        periodoTexto: '26 a 28 de março de 2027',
        local: 'Acampamento Esperança',
        mapsUrl: 'https://maps.google.com/?q=-23.405327,-51.113140',
        coordenadas: { lat: -23.405327, lng: -51.113140 },
        enderecoCompleto: '', // A definir (Item 1)
        horarioChegada: '', // A definir (Item 2)
        horarioEncerramento: '', // A definir (Item 2)
        contatoOrganizacao: '', // A definir (Item 3)
        transporteTexto: 'Cada igreja é responsável por organizar o deslocamento dos seus participantes. O portal não realiza planejamento de ônibus, vagas de transporte, locais de embarque nem controle de ida e volta.'
    },

    modalidades: {
        retiroCompleto: {
            ativo: true,
            prazoEncerramentoInscricoes: '', // A definir (Item 19)
            servicosIncluidos: '', // A definir (Item 9)
            vagasLimite: null, // A definir (Item 8)
            lotes: [
                { id: 'lote_1', nome: 'Lote 1', periodoLabel: 'Até 31/01/2027', dataInicio: '2026-01-01', dataFim: '2027-01-31', valorIntegral: 350.00 },
                { id: 'lote_2', nome: 'Lote 2', periodoLabel: 'De 01/02/2027 a 28/02/2027', dataInicio: '2027-02-01', dataFim: '2027-02-28', valorIntegral: 375.00 },
                { id: 'lote_3', nome: 'Lote 3', periodoLabel: 'Em março, até o encerramento das inscrições', dataInicio: '2027-03-01', dataFim: '2027-03-28', valorIntegral: 400.00 }
            ]
        },
        condicoesCriancas: {
            ate4AnosGratuito: true,
            de5a8AnosPercentualPago: 70, // 30% de desconto
            aPartir9AnosIntegral: true,
            dataReferenciaIdade: '2027-03-26', // Proposta pendente de confirmação (Item 7)
            dataReferenciaConfirmada: false
        },
        dayUse: {
            ativo: true,
            valorSemAlimentacao: 100.00,
            valorComAlimentacao: 220.00,
            descricaoAlimentacao: 'Café da manhã, almoço e café da tarde',
            vagasLimite: null, // A definir (Item 8)
            diasDisponiveis: [], // A definir (Item 10)
            horariosEntradaSaida: '', // A definir (Item 10)
            permiteMaisDeUmDia: null, // A definir (Item 10): true | false | null
            aplicarDescontoInfantil: null, // A definir (Item 11): true | false | null
            refeicoesAvulsasInfo: '' // A definir (Item 12)
        }
    },

    pagamentos: {
        pix: {
            ativo: true,
            chavePix: '', // A definir (Item 13) — Não usar automaticamente dados de outros eventos
            favorecidoPix: '', // A definir (Item 13)
            instrucoesPix: 'Após realizar o Pix, envie o comprovante na sua Área do Participante para conferência pelo escritório regional.'
        },
        cartao: {
            presencialAtivo: true,
            localTexto: 'Pagamento presencial no escritório regional, nas dependências da IEQ Central.',
            repassarTaxasParticipante: true,
            condicoesOperadoraTaxas: '', // A definir (Item 14)
            maxParcelas: null, // A definir (Item 14)
            tabelaTaxas: [] // A definir (Item 14)
        },
        dinheiro: {
            presencialAtivo: true,
            localTexto: 'Pagamento presencial no escritório regional, nas dependências da IEQ Central.'
        },
        escritorioRegional: {
            nome: 'Escritório Regional — IEQ Central',
            enderecoReferencia: 'Travessa Belo Horizonte, 90 — Centro — Londrina/PR',
            enderecoConfirmado: false, // A definir (Item 4)
            horarioAtendimento: '' // A definir (Item 4)
        },
        lideresPastores: {
            ativo: true,
            regraDataLote: 'a_definir' // 'a_definir' | 'data_pagamento_lider' | 'data_repasse_escritorio' (Item 16)
        },
        promocaoParcelasFixas: {
            ativa: true,
            valorTotal: 350.00,
            dataLimitePromo1: '2026-11-30', // Condição Promocional 1 (5x R$ 70,00) sai do ar após 30/11/2026
            dataLimitePromo2: '2026-12-15', // Condição Promocional 2 (4x R$ 87,50, de dez a mar)
            planos: [
                {
                    id: 'promocional_nov_5x',
                    inicioLabel: 'Novembro de 2026 (Adesão até 30/11/2026)',
                    dataLimiteAdesao: '2026-11-30',
                    parcelas: 5,
                    valorParcela: 70.00,
                    descricao: 'Condição Promocional 1 (Até 30/11/2026) — 5x de R$ 70,00 (Nov a Mar · Total R$ 350,00)'
                },
                {
                    id: 'promocional_dez_4x',
                    inicioLabel: 'Dezembro de 2026 a Março de 2027 (Adesão até 15/12/2026)',
                    dataLimiteAdesao: '2026-12-15',
                    parcelas: 4,
                    valorParcela: 87.50,
                    descricao: 'Condição Promocional 2 (Até 15/12/2026) — 4x de R$ 87,50 (Dez a Mar · Total R$ 350,00)'
                }
            ],
            datasVencimento: '', // A definir (Item 15)
            requisitoGarantiaAdesao: '', // A definir (Item 15)
            consequenciasAtraso: '', // A definir (Item 15)
            aplicarDescontoInfantil: null, // A definir (Item 15)
            condicoesManterPromocao: '' // A definir (Item 15)
        },
        regrasComerciais: {
            requisitosConfirmarVaga: '', // A definir (Item 17)
            prazoPrimeiroPagamentoQuitacao: '', // A definir (Item 18)
            regrasDesistenciaDevolucaoTransferencia: '' // A definir (Item 20)
        }
    },

    inscricaoConfig: {
        emailObrigatorio: false, // Obrigatoriedade a definir
        solicitarCamiseta: false, // Somente se houver camiseta e condições definidas
        tamanhosCamiseta: ['Infantil 10', 'Infantil 12', 'P', 'M', 'G', 'GG', 'XG'],
        idadeMinimaParticipacao: null, // A definir (Item 6)
        criteriosConvidadosOutrasIgrejas: '', // A definir (Item 6)
        listaIgrejasOficialConfirmada: false, // A definir (Item 5)
        categoriasParticipacao: [
            { id: 'participante', label: 'Participante', ativo: true, exigeAprovacao: false },
            { id: 'lider', label: 'Líder', ativo: true, exigeAprovacao: true },
            { id: 'equipe', label: 'Equipe de trabalho', ativo: true, exigeAprovacao: true },
            { id: 'pastor_titular', label: 'Pastor Titular', ativo: true, exigeAprovacao: true }
        ],
        // Preços ou percentuais diferenciados (ocultos na tela pública; só aplicados quando statusCategoria === 'aprovada')
        precosCategoriasAprovadas: {
            lider: { tipo: 'padrao', valorFixo: null, percentualDesconto: 0 },
            equipe: { tipo: 'padrao', valorFixo: null, percentualDesconto: 0 },
            pastor_titular: { tipo: 'padrao', valorFixo: null, percentualDesconto: 0 }
        },
        condicoesLiderEquipe: '', // A definir
        metodoAcessoParticipante: 'cpf', // Item 22
        textoMedicamentosFichaSaude: 'Se você utiliza medicamentos, leve a quantidade necessária para todos os dias, na embalagem original e identificada. Informe previamente à organização se precisar de auxílio com os horários ou armazenamento.'
    },

    termos: {
        versao: '1.1-pendente',
        textosAprovados: false, // A definir (Item 21)
        metodoConfirmacaoAutorizacao: '', // A definir (Item 21)
        regrasConvivencia: 'Declaro estar ciente e de acordo com todas as regras de convivência, horários e conduta do retiro VATHOS 2027, incluindo a PROIBIÇÃO EXPRESSA de entrar ou nadar no lago do acampamento sob qualquer circunstância, sob pena de desligamento imediato (expulsão) do evento sem direito a reembolso.',
        autorizacaoMenor: 'Na qualidade de pai, mãe ou responsável legal, autorizo a participação do menor identificado no evento VATHOS 2027 (26 a 28 de março de 2027, no Acampamento Esperança), ciente das regras de convivência, da proibição expressa de entrada no lago sob pena de desligamento imediato e de que cada igreja organiza seu transporte.',
        usoDadosPessoaisSaude: 'Autorizo a utilização dos dados pessoais e informações da ficha básica de saúde exclusivamente para a organização, segurança, alimentação e cuidados durante o evento VATHOS 2027.',
        usoImagemOpcional: 'Autorizo, de forma gratuita e opcional, o uso de minha imagem (ou do menor sob minha responsabilidade) em fotos e vídeos de divulgação institucional do evento VATHOS 2027 e da IEQ Região 655.',
        condicoesFinanceirasCancelamento: 'Declaro estar ciente das condições financeiras da modalidade escolhida, regras de lotes e políticas de cancelamento/transferência do evento VATHOS 2027.'
    },

    orientacoes: {
        oQueLevar: [
            '1. ESSENCIAL (1º ITEM): Bíblia Sagrada, caderno de anotações e caneta para todas as ministrações.',
            '2. ROUPA DE CAMA E BANHO: Lençol, fronha, travesseiro, cobertor/edredom e toalhas de banho e rosto.',
            '3. VESTUÁRIO E HIGIENE: Roupas confortáveis para cultos e gincanas, agasalho, roupa de banho (exclusivo para áreas permitidas — proibido entrar no lago), itens de higiene pessoal, protetor solar e repelente.',
            '4. LANCHES PERMITIDOS (APENAS INDUSTRIALIZADOS): Salgadinhos, biscoitos, chocolates e refrigerantes/sucos lacrados de fábrica.',
            '5. EXPRESSAMENTE PROIBIDO LEVAR: Bolos feitos em casa, pão de forma, lanches caseiros ou quaisquer alimentos artesanais/caseiros.'
        ].join('\n'),
        programacao: '', // A definir
        regrasConvivencia: [
            '• PROIBIÇÃO EXPRESSA DE ENTRADA NO LAGO: É terminantemente proibido entrar, nadar ou acessar a água do lago sob qualquer hipótese. O descumprimento acarretará o desligamento imediato (expulsão) do retiro.',
            '• Participação assídua nos cultos, ministrações e atividades oficiais do retiro.',
            '• Respeito rigoroso aos horários de silêncio e à separação entre alojamentos masculinos e femininos.',
            '• É vedado sair das dependências do acampamento sem autorização da coordenação geral.',
            '• Alimentação levada pelos acampantes deve ser exclusivamente industrializada e lacrada (proibido bolos caseiros, pão de forma e produtos artesanais).'
        ].join('\n'),
        duvidasFrequentes: []
    }
};

/**
 * Catálogo dos 23 itens de decisão pendente da especificação (Seção 17)
 */
export const DECISOES_PENDENTES_CATALOGO = [
    { numero: 1, titulo: 'Endereço completo por escrito do acampamento', caminho: 'evento.enderecoCompleto' },
    { numero: 2, titulo: 'Horários de chegada e encerramento', caminho: 'evento.horarioChegada' },
    { numero: 3, titulo: 'Contato oficial da organização', caminho: 'evento.contatoOrganizacao' },
    { numero: 4, titulo: 'Confirmação do endereço e atendimento do escritório regional', caminho: 'pagamentos.escritorioRegional.enderecoConfirmado' },
    { numero: 5, titulo: 'Lista oficial das igrejas', caminho: 'inscricaoConfig.listaIgrejasOficialConfirmada' },
    { numero: 6, titulo: 'Idade mínima e critérios para convidados', caminho: 'inscricaoConfig.criteriosConvidadosOutrasIgrejas' },
    { numero: 7, titulo: 'Data de referência para calcular a idade (proposto: 26/03/2027)', caminho: 'modalidades.condicoesCriancas.dataReferenciaConfirmada' },
    { numero: 8, titulo: 'Vagas do retiro completo e do Day Use', caminho: 'modalidades.retiroCompleto.vagasLimite' },
    { numero: 9, titulo: 'Serviços incluídos no retiro completo', caminho: 'modalidades.retiroCompleto.servicosIncluidos' },
    { numero: 10, titulo: 'Dias, horários e regras do Day Use', caminho: 'modalidades.dayUse.horariosEntradaSaida' },
    { numero: 11, titulo: 'Aplicação dos descontos infantis ao Day Use', caminho: 'modalidades.dayUse.aplicarDescontoInfantil' },
    { numero: 12, titulo: 'Venda e valores de refeições avulsas, caso existam', caminho: 'modalidades.dayUse.refeicoesAvulsasInfo' },
    { numero: 13, titulo: 'Chave Pix e favorecido', caminho: 'pagamentos.pix.chavePix' },
    { numero: 14, titulo: 'Taxas e parcelamento no cartão', caminho: 'pagamentos.cartao.condicoesOperadoraTaxas' },
    { numero: 15, titulo: 'Vencimentos e regras da promoção de parcelas fixas', caminho: 'pagamentos.promocaoParcelasFixas.datasVencimento' },
    { numero: 16, titulo: 'Data considerada nos pagamentos recebidos por líderes e pastores', caminho: 'pagamentos.lideresPastores.regraDataLote' },
    { numero: 17, titulo: 'Requisitos para reservar e confirmar uma vaga', caminho: 'pagamentos.regrasComerciais.requisitosConfirmarVaga' },
    { numero: 18, titulo: 'Prazo do primeiro pagamento e da quitação', caminho: 'pagamentos.regrasComerciais.prazoPrimeiroPagamentoQuitacao' },
    { numero: 19, titulo: 'Encerramento das inscrições', caminho: 'modalidades.retiroCompleto.prazoEncerramentoInscricoes' },
    { numero: 20, titulo: 'Regras de desistência, devolução e transferência', caminho: 'pagamentos.regrasComerciais.regrasDesistenciaDevolucaoTransferencia' },
    { numero: 21, titulo: 'Textos das autorizações, termos e método de confirmação', caminho: 'termos.textosAprovados' },
    { numero: 22, titulo: 'Método de acesso à área do participante', caminho: 'inscricaoConfig.metodoAcessoParticipante' },
    { numero: 23, titulo: 'Responsáveis e permissões das equipes / categorias', caminho: 'inscricaoConfig.condicoesLiderEquipe' }
];

/**
 * Faz merge profundo entre o config padrão e o config salvo no Firestore
 */
export function mergeVathosConfig(saved = {}) {
    function deepMerge(target, source) {
        const out = { ...target };
        if (!source || typeof source !== 'object') return out;
        for (const key of Object.keys(source)) {
            if (
                source[key] &&
                typeof source[key] === 'object' &&
                !Array.isArray(source[key]) &&
                target[key] &&
                typeof target[key] === 'object' &&
                !Array.isArray(target[key])
            ) {
                out[key] = deepMerge(target[key], source[key]);
            } else if (source[key] !== undefined) {
                out[key] = source[key];
            }
        }
        return out;
    }
    return deepMerge(VATHOS_DEFAULT_CONFIG, saved);
}

// ============================================================================
// UTILITÁRIOS DE CPF E FORMATAÇÃO
// ============================================================================

export function limparCPF(valor) {
    return String(valor || '').replace(/\D/g, '').slice(0, 11);
}

export function formatarCPF(valor) {
    const d = limparCPF(valor);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
}

export function validarCPF(valor) {
    const cpf = limparCPF(valor);
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i), 10) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9), 10)) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i), 10) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10), 10)) return false;

    return true;
}

export function formatarTelefone(valor) {
    const d = String(valor || '').replace(/\D/g, '').slice(0, 11);
    if (d.length === 0) return '';
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}

export function formatarCEP(valor) {
    const d = String(valor || '').replace(/\D/g, '').slice(0, 8);
    if (d.length <= 5) return d;
    return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarPercentual(valor) {
    const num = Number(valor || 0);
    const arred = Math.round(num * 100) / 100;
    return arred.toLocaleString('pt-BR', { minimumFractionDigits: Number.isInteger(arred) ? 0 : 2, maximumFractionDigits: 2 }) + '%';
}

export function formatarDataBR(isoDate) {
    if (!isoDate || typeof isoDate !== 'string') return '—';
    const partes = isoDate.split('T')[0].split('-');
    if (partes.length !== 3) return isoDate;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// ============================================================================
// CÁLCULO DE IDADE E FAIXA ETÁRIA
// ============================================================================

export function calcularIdadeNaData(dataNascimentoISO, dataReferenciaISO = '2027-03-26') {
    if (!dataNascimentoISO) return null;
    const [anoN, mesN, diaN] = dataNascimentoISO.split('-').map(Number);
    const [anoR, mesR, diaR] = (dataReferenciaISO || '2027-03-26').split('-').map(Number);
    if (!anoN || !mesN || !diaN) return null;

    let idade = anoR - anoN;
    if (mesR < mesN || (mesR === mesN && diaR < diaN)) {
        idade--;
    }
    return idade >= 0 ? idade : 0;
}

export function classificarFaixaEtaria(idade, config = VATHOS_DEFAULT_CONFIG) {
    if (idade === null || idade === undefined || isNaN(idade)) {
        return {
            codigo: 'indefinida',
            label: 'Informe a data de nascimento',
            fatorPrecoRetiro: 1,
            isGratuitoRetiro: false,
            isMenorDeIdade: false
        };
    }
    const isMenorDeIdade = idade < 18;
    if (idade <= 4) {
        return {
            codigo: 'ate_4',
            label: 'Até 4 anos (Gratuito no Retiro Completo)',
            fatorPrecoRetiro: 0,
            isGratuitoRetiro: true,
            isMenorDeIdade: true
        };
    }
    if (idade >= 5 && idade <= 8) {
        const percPago = config?.modalidades?.condicoesCriancas?.de5a8AnosPercentualPago ?? 70;
        return {
            codigo: 'de_5_a_8',
            label: `De 5 a 8 anos (Desconto de ${100 - percPago}% — paga ${percPago}%)`,
            fatorPrecoRetiro: percPago / 100,
            isGratuitoRetiro: false,
            isMenorDeIdade: true
        };
    }
    return {
        codigo: 'a_partir_9',
        label: isMenorDeIdade ? 'De 9 a 17 anos (Valor integral · Menor de idade)' : 'A partir de 18 anos (Valor integral · Maior de idade)',
        fatorPrecoRetiro: 1,
        isGratuitoRetiro: false,
        isMenorDeIdade
    };
}

// ============================================================================
// MOTOR DE LOTES E PREÇOS APLICÁVEIS (COM SUPORTE A CATEGORIA AUTORIZADA)
// ============================================================================

export function obterLoteRetiroPorData(dataISO, config = VATHOS_DEFAULT_CONFIG) {
    const lotes = config?.modalidades?.retiroCompleto?.lotes || VATHOS_DEFAULT_CONFIG.modalidades.retiroCompleto.lotes;
    const d = (dataISO || new Date().toISOString().split('T')[0]).split('T')[0];

    for (const lote of lotes) {
        if (lote.dataFim && d <= lote.dataFim) {
            return lote;
        }
    }
    return lotes[lotes.length - 1];
}

/**
 * Calcula o preço integral aplicável para a inscrição em um determinado lote/data.
 * IMPORTANTE: Preços diferenciados de categoria (Líder, Equipe, Pastor Titular) SÓ são aplicados
 * quando `statusCategoria === 'aprovada'` pelo administrador (ou se houver `valorPersonalizadoAprovado`).
 * Até a aprovação administrativa, todos utilizam o valor padrão.
 */
export function calcularPrecoAplicavel({
    modalidade = 'retiro_completo',
    condicaoPagamento = 'parcelamento_livre',
    idade = 18,
    diasDayUseQtd = 1,
    dataReferenciaPrecoISO = null,
    loteIdForcado = null,
    categoriaParticipacao = 'participante',
    statusCategoria = 'padrao',
    valorPersonalizadoAprovado = null,
    config = VATHOS_DEFAULT_CONFIG
}) {
    const faixa = classificarFaixaEtaria(idade, config);

    // Verifica se possui categoria especial JÁ AUTORIZADA pelo Admin
    let regraCategoriaAutorizada = null;
    if (statusCategoria === 'aprovada' && categoriaParticipacao && categoriaParticipacao !== 'participante') {
        if (valorPersonalizadoAprovado !== null && valorPersonalizadoAprovado !== undefined && valorPersonalizadoAprovado !== '') {
            const vPers = Number(valorPersonalizadoAprovado);
            if (!isNaN(vPers) && vPers >= 0) {
                regraCategoriaAutorizada = { tipo: 'valor_fixo', valorFixo: vPers };
            }
        }
        if (!regraCategoriaAutorizada) {
            const cfgCat = config?.inscricaoConfig?.precosCategoriasAprovadas?.[categoriaParticipacao];
            if (cfgCat && cfgCat.tipo === 'valor_fixo' && cfgCat.valorFixo !== null && cfgCat.valorFixo !== '') {
                regraCategoriaAutorizada = { tipo: 'valor_fixo', valorFixo: Number(cfgCat.valorFixo) };
            } else if (cfgCat && cfgCat.tipo === 'desconto_percentual' && Number(cfgCat.percentualDesconto) > 0) {
                regraCategoriaAutorizada = { tipo: 'desconto_percentual', percentualDesconto: Number(cfgCat.percentualDesconto) };
            }
        }
    }

    const aplicarAjusteCategoria = (precoBase) => {
        if (!regraCategoriaAutorizada) return precoBase;
        if (regraCategoriaAutorizada.tipo === 'valor_fixo') {
            return Math.round(Number(regraCategoriaAutorizada.valorFixo) * 100) / 100;
        }
        if (regraCategoriaAutorizada.tipo === 'desconto_percentual') {
            const fatorCat = Math.max(0, (100 - regraCategoriaAutorizada.percentualDesconto) / 100);
            return Math.round(precoBase * fatorCat * 100) / 100;
        }
        return precoBase;
    };

    const sufixoCat = regraCategoriaAutorizada ? ` · Cat. Autorizada (${categoriaParticipacao.toUpperCase()})` : '';

    // 1. Day Use
    if (modalidade === 'day_use_sem_alimentacao' || modalidade === 'day_use_com_alimentacao') {
        const baseUnitario = modalidade === 'day_use_com_alimentacao'
            ? Number(config?.modalidades?.dayUse?.valorComAlimentacao ?? 220)
            : Number(config?.modalidades?.dayUse?.valorSemAlimentacao ?? 100);
        const qtdDias = Math.max(1, Number(diasDayUseQtd || 1));

        const aplicaInfantilDayUse = config?.modalidades?.dayUse?.aplicarDescontoInfantil === true;
        const fator = aplicaInfantilDayUse ? faixa.fatorPrecoRetiro : 1;
        const precoPadrao = Math.round(baseUnitario * qtdDias * fator * 100) / 100;
        const preco = aplicarAjusteCategoria(precoPadrao);

        return {
            loteId: 'day_use_fixo',
            loteNome: (modalidade === 'day_use_com_alimentacao' ? 'Day Use (Com Alimentação)' : 'Day Use (Sem Alimentação)') + sufixoCat,
            valorIntegralLote: baseUnitario * qtdDias,
            fatorFaixaEtaria: fator,
            precoAplicavel: preco,
            isGratuito: preco === 0,
            observacaoPendente: config?.modalidades?.dayUse?.aplicarDescontoInfantil === null && idade <= 8
                ? 'Aplicação de desconto/gratuidade infantil no Day Use ainda está "A definir" pela organização.'
                : null
        };
    }

    // 2. Condição Promocional de Parcelas Fixas (R$ 350,00)
    if (condicaoPagamento === 'promocional_nov_5x' || condicaoPagamento === 'promocional_dez_4x') {
        const valorBasePromo = Number(config?.pagamentos?.promocaoParcelasFixas?.valorTotal ?? 350);
        const aplicaInfantilPromo = config?.pagamentos?.promocaoParcelasFixas?.aplicarDescontoInfantil === true;
        const fator = faixa.codigo === 'ate_4' ? 0 : (aplicaInfantilPromo ? faixa.fatorPrecoRetiro : (faixa.codigo === 'de_5_a_8' ? faixa.fatorPrecoRetiro : 1));
        const precoPadrao = Math.round(valorBasePromo * fator * 100) / 100;
        const preco = aplicarAjusteCategoria(precoPadrao);

        return {
            loteId: 'promocional_fixo',
            loteNome: (condicaoPagamento === 'promocional_nov_5x' ? 'Condição Promocional 1 (5x)' : 'Condição Promocional 2 (4x)') + sufixoCat,
            valorIntegralLote: valorBasePromo,
            fatorFaixaEtaria: fator,
            precoAplicavel: preco,
            isGratuito: preco === 0,
            observacaoPendente: config?.pagamentos?.promocaoParcelasFixas?.aplicarDescontoInfantil === null && faixa.codigo === 'de_5_a_8'
                ? 'Aplicação do desconto infantil na condição promocional está "A definir".'
                : null
        };
    }

    // 3. Retiro Completo (Lotes 1, 2 e 3)
    const lotes = config?.modalidades?.retiroCompleto?.lotes || VATHOS_DEFAULT_CONFIG.modalidades.retiroCompleto.lotes;
    let lote = null;
    if (loteIdForcado) {
        lote = lotes.find(l => l.id === loteIdForcado);
    }
    if (!lote) {
        lote = obterLoteRetiroPorData(dataReferenciaPrecoISO, config);
    }

    const valorIntegralLote = Number(lote?.valorIntegral ?? 350);
    const precoPadrao = Math.round(valorIntegralLote * faixa.fatorPrecoRetiro * 100) / 100;
    const precoAplicavel = aplicarAjusteCategoria(precoPadrao);

    return {
        loteId: lote.id,
        loteNome: lote.nome + sufixoCat,
        valorIntegralLote,
        fatorFaixaEtaria: faixa.fatorPrecoRetiro,
        precoAplicavel,
        isGratuito: precoAplicavel === 0,
        observacaoPendente: null
    };
}

// ============================================================================
// MOTOR DE PARCELAMENTO LIVRE POR PERCENTUAL (SEÇÃO 4)
// ============================================================================

export function calcularPercentualDePagamento({
    valorDestinadoInscricao,
    precoAplicavelNoLote
}) {
    const val = Number(valorDestinadoInscricao || 0);
    const preco = Number(precoAplicavelNoLote || 0);

    if (preco <= 0) {
        return {
            percentualQuitado: 100,
            percentualQuitadoExato: 100,
            precoBaseUtilizado: 0
        };
    }

    const percentualExato = (val / preco) * 100;
    const percentualArredondado = Math.round(percentualExato * 1000000) / 1000000;

    return {
        percentualQuitado: Math.round(percentualExato * 100) / 100,
        percentualQuitadoExato: percentualArredondado,
        precoBaseUtilizado: preco
    };
}

export function consolidarFinanceiroInscricao({
    inscricao,
    pagamentos = [],
    config = VATHOS_DEFAULT_CONFIG,
    dataAtualISO = null
}) {
    const hoje = (dataAtualISO || new Date().toISOString().split('T')[0]).split('T')[0];
    const idade = inscricao?.idadeCalculada ?? calcularIdadeNaData(inscricao?.dataNascimento, config?.modalidades?.condicoesCriancas?.dataReferenciaIdade);

    const infoLoteAtual = calcularPrecoAplicavel({
        modalidade: inscricao?.modalidade || 'retiro_completo',
        condicaoPagamento: inscricao?.condicaoPagamento || 'parcelamento_livre',
        idade,
        diasDayUseQtd: Array.isArray(inscricao?.diasDayUse) ? inscricao.diasDayUse.length : 1,
        dataReferenciaPrecoISO: hoje,
        categoriaParticipacao: inscricao?.categoriaParticipacao || 'participante',
        statusCategoria: inscricao?.statusCategoria || 'padrao',
        valorPersonalizadoAprovado: inscricao?.valorPersonalizadoAprovado ?? null,
        config
    });

    if (infoLoteAtual.isGratuito) {
        return {
            isento: true,
            loteAtual: infoLoteAtual,
            percentualConfirmado: 100,
            percentualAguardandoConferencia: 0,
            percentualRecebidoLider: 0,
            percentualRestante: 0,
            saldoAtualReais: 0,
            saldoConsiderandoPendentesReais: 0,
            totalPagoConfirmadoReais: 0,
            totalAguardandoConferenciaReais: 0,
            totalRecebidoLiderReais: 0,
            totalTaxasCartaoReais: 0,
            temPagamentoExcedente: false,
            percentualExcedente: 0,
            statusFinanceiroSugerido: 'isento',
            statusComprovanteSugerido: 'nao_se_aplica',
            statusAcertoLiderSugerido: 'nao_se_aplica',
            historicoProcessado: []
        };
    }

    let somaPercentualConfirmadoExato = 0;
    let somaPercentualAguardandoExato = 0;
    let somaPercentualLiderExato = 0;

    let totalPagoConfirmadoReais = 0;
    let totalAguardandoConferenciaReais = 0;
    let totalRecebidoLiderReais = 0;
    let totalTaxasCartaoReais = 0;

    let qtdAguardandoConferencia = 0;
    let qtdAprovados = 0;
    let qtdRecusados = 0;
    let qtdRecebidoLider = 0;
    let qtdConferidoLider = 0;

    const pagsOrdenados = [...pagamentos].sort((a, b) => {
        const da = a.dataEfetivaPagamento || a.criadoEmISO || '';
        const db = b.dataEfetivaPagamento || b.criadoEmISO || '';
        return da.localeCompare(db);
    });

    const historicoProcessado = pagsOrdenados.map(pag => {
        const valorInscricao = Number(pag.valorDestinadoInscricao ?? pag.valor ?? 0);
        const valorTaxa = Number(pag.valorTaxaCartao || 0);

        let precoBaseNaEpoca = Number(pag.precoBaseLoteNaData || 0);
        let loteNomeNaEpoca = pag.loteNomeNaData || '';

        // Se a categoria do participante foi aprovada com valor diferenciado, recalcula o percentual sobre o preço aplicável da época
        if (inscricao?.statusCategoria === 'aprovada' && inscricao?.categoriaParticipacao !== 'participante') {
            const infoEpocaCat = calcularPrecoAplicavel({
                modalidade: inscricao?.modalidade || 'retiro_completo',
                condicaoPagamento: inscricao?.condicaoPagamento || 'parcelamento_livre',
                idade,
                diasDayUseQtd: Array.isArray(inscricao?.diasDayUse) ? inscricao.diasDayUse.length : 1,
                dataReferenciaPrecoISO: pag.dataEfetivaPagamento || hoje,
                loteIdForcado: pag.loteIdNaData || null,
                categoriaParticipacao: inscricao?.categoriaParticipacao,
                statusCategoria: inscricao?.statusCategoria,
                valorPersonalizadoAprovado: inscricao?.valorPersonalizadoAprovado ?? null,
                config
            });
            precoBaseNaEpoca = infoEpocaCat.precoAplicavel;
            loteNomeNaEpoca = infoEpocaCat.loteNome;
        } else if (!precoBaseNaEpoca || precoBaseNaEpoca <= 0) {
            const infoEpoca = calcularPrecoAplicavel({
                modalidade: inscricao?.modalidade || 'retiro_completo',
                condicaoPagamento: inscricao?.condicaoPagamento || 'parcelamento_livre',
                idade,
                diasDayUseQtd: Array.isArray(inscricao?.diasDayUse) ? inscricao.diasDayUse.length : 1,
                dataReferenciaPrecoISO: pag.dataEfetivaPagamento || hoje,
                loteIdForcado: pag.loteIdNaData || null,
                config
            });
            precoBaseNaEpoca = infoEpoca.precoAplicavel;
            loteNomeNaEpoca = infoEpoca.loteNome;
        }

        const calc = calcularPercentualDePagamento({
            valorDestinadoInscricao: valorInscricao,
            precoAplicavelNoLote: precoBaseNaEpoca
        });

        const pctExato = (inscricao?.statusCategoria === 'aprovada' && inscricao?.categoriaParticipacao !== 'participante')
            ? calc.percentualQuitadoExato
            : (pag.percentualQuitadoExato !== undefined ? Number(pag.percentualQuitadoExato) : calc.percentualQuitadoExato);

        const status = pag.statusConferencia || 'aguardando_conferencia';

        if (status === 'aprovado_escritorio') {
            somaPercentualConfirmadoExato += pctExato;
            totalPagoConfirmadoReais += valorInscricao;
            totalTaxasCartaoReais += valorTaxa;
            qtdAprovados++;
            if (pag.origemAcertoLider) qtdConferidoLider++;
        } else if (status === 'aguardando_conferencia') {
            somaPercentualAguardandoExato += pctExato;
            totalAguardandoConferenciaReais += valorInscricao;
            qtdAguardandoConferencia++;
        } else if (status === 'recebido_lider') {
            somaPercentualLiderExato += pctExato;
            totalRecebidoLiderReais += valorInscricao;
            qtdRecebidoLider++;
        } else if (status === 'recusado') {
            qtdRecusados++;
        }

        return {
            ...pag,
            valorDestinadoInscricao: valorInscricao,
            valorTaxaCartao: valorTaxa,
            precoBaseLoteNaData: precoBaseNaEpoca,
            loteNomeNaData: loteNomeNaEpoca,
            percentualQuitado: Math.round(pctExato * 100) / 100,
            percentualQuitadoExato: pctExato
        };
    });

    const norm = (v) => {
        const r = Math.round(v * 10000) / 10000;
        if (Math.abs(100 - r) < 0.005) return 100;
        if (Math.abs(r) < 0.005) return 0;
        return r;
    };

    const pctConfirmado = norm(somaPercentualConfirmadoExato);
    const pctAguardando = norm(somaPercentualAguardandoExato);
    const pctLider = norm(somaPercentualLiderExato);

    const temPagamentoExcedente = pctConfirmado > 100.01;
    const percentualExcedente = temPagamentoExcedente ? Math.round((pctConfirmado - 100) * 100) / 100 : 0;

    const percentualRestante = Math.max(0, norm(100 - pctConfirmado));
    const percentualRestanteConsiderandoPendentes = Math.max(0, norm(100 - (pctConfirmado + pctAguardando + pctLider)));

    const saldoAtualReais = Math.round((percentualRestante / 100) * infoLoteAtual.precoAplicavel * 100) / 100;
    const saldoConsiderandoPendentesReais = Math.round((percentualRestanteConsiderandoPendentes / 100) * infoLoteAtual.precoAplicavel * 100) / 100;

    let statusFinanceiroSugerido = 'sem_pagamento';
    if (pctConfirmado >= 100) statusFinanceiroSugerido = 'quitado';
    else if (pctConfirmado > 0) statusFinanceiroSugerido = 'parcial';

    let statusComprovanteSugerido = 'nenhum';
    if (qtdAguardandoConferencia > 0) statusComprovanteSugerido = 'aguardando_conferencia';
    else if (qtdRecusados > 0 && qtdAprovados === 0) statusComprovanteSugerido = 'recusado';
    else if (qtdAprovados > 0) statusComprovanteSugerido = 'aprovado';

    let statusAcertoLiderSugerido = 'nenhum';
    if (qtdRecebidoLider > 0) statusAcertoLiderSugerido = 'aguardando_repasse';
    else if (qtdConferidoLider > 0) statusAcertoLiderSugerido = 'conferido';

    return {
        isento: false,
        loteAtual: infoLoteAtual,
        percentualConfirmado: Math.min(100, Math.round(pctConfirmado * 100) / 100),
        percentualConfirmadoBruto: Math.round(pctConfirmado * 100) / 100,
        percentualAguardandoConferencia: Math.round(pctAguardando * 100) / 100,
        percentualRecebidoLider: Math.round(pctLider * 100) / 100,
        percentualRestante: Math.round(percentualRestante * 100) / 100,
        saldoAtualReais,
        saldoConsiderandoPendentesReais,
        totalPagoConfirmadoReais: Math.round(totalPagoConfirmadoReais * 100) / 100,
        totalAguardandoConferenciaReais: Math.round(totalAguardandoConferenciaReais * 100) / 100,
        totalRecebidoLiderReais: Math.round(totalRecebidoLiderReais * 100) / 100,
        totalTaxasCartaoReais: Math.round(totalTaxasCartaoReais * 100) / 100,
        temPagamentoExcedente,
        percentualExcedente,
        statusFinanceiroSugerido,
        statusComprovanteSugerido,
        statusAcertoLiderSugerido,
        historicoProcessado
    };
}
