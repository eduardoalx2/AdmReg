/**
 * js/logger.js — Módulo centralizado de auditoria e registro de atividades
 * 
 * Portal Região 655 — IEQ Londrina/PR
 * Registra com segurança todas as ações do sistema no Firestore (coleção 'logs_atividades').
 * É assíncrono e tolerante a falhas (não bloqueia nem quebra a execução principal).
 * 
 * Uso:
 *   import { registrarLog } from './js/logger.js';
 *   await registrarLog({
 *       modulo: 'recibos',
 *       acao: 'CRIAR', // 'CRIAR' | 'EDITAR' | 'EXCLUIR' | 'STATUS'
 *       resumo: 'Gerou o recibo nº 1042 para IEQ Central (R$ 1.500,00)',
 *       detalhes: { ...dadosDoRecibo },
 *       docId: 'idDoDocNoFirestore'
 *   });
 */

import { db } from '../firebase-config.js';
import { 
    collection, 
    addDoc, 
    serverTimestamp, 
    query, 
    orderBy, 
    limit, 
    startAfter, 
    getDocs, 
    where 
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getCurrentEmail, getCurrentName, getCurrentIgreja } from './auth.js';

/**
 * Higieniza o objeto de detalhes para garantir que é serializável pelo Firestore
 * (remove valores undefined, funções, referências circulares).
 * @param {any} data
 * @returns {any}
 */
export function sanitizeDetails(data) {
    if (data === null || data === undefined) return null;
    try {
        return JSON.parse(JSON.stringify(data, (key, value) => {
            if (value === undefined) return null;
            return value;
        }));
    } catch (e) {
        return { erroSerializacao: String(e), dadosOriginais: String(data) };
    }
}

/**
 * Registra uma atividade no log de auditoria do sistema.
 * 
 * @param {Object} params
 * @param {string} params.modulo - Ex: 'recibos', 'saldos', 'avisos', 'eventos', 'igrejas', 'pastores', 'agenda', 'viagens', 'checklist', 'debitos_manuais', etc.
 * @param {'CRIAR'|'EDITAR'|'EXCLUIR'|'STATUS'|'SISTEMA'} params.acao - Tipo de ação realizada.
 * @param {string} params.resumo - Texto descritivo legível da ação.
 * @param {Object} [params.detalhes] - Objeto completo com dados ou snapshot da alteração/exclusão.
 * @param {string} [params.docId] - ID do documento afetado no Firestore (se houver).
 * @param {Object} [params.usuario] - Sobrescreve dados do usuário (opcional).
 * @returns {Promise<string|null>} Retorna o ID do log gravado ou null em caso de erro silencioso.
 */
export async function registrarLog({ modulo, acao, resumo, detalhes = null, docId = null, usuario = null }) {
    try {
        const email = usuario?.email || getCurrentEmail() || 'sistema@regiao655';
        const nome = usuario?.nome || getCurrentName() || 'Sistema';
        const igreja = usuario?.igreja || getCurrentIgreja() || '';

        const payload = {
            modulo: String(modulo || 'geral').toLowerCase().trim(),
            acao: String(acao || 'CRIAR').toUpperCase().trim(),
            resumo: String(resumo || '').trim(),
            detalhes: sanitizeDetails(detalhes),
            docIdAfetado: docId ? String(docId) : null,
            usuarioEmail: email,
            usuarioNome: nome,
            usuarioIgreja: igreja,
            timestamp: serverTimestamp(),
            criadoEmIso: new Date().toISOString(),
            origemUrl: (typeof window !== 'undefined' && window.location?.pathname) 
                ? (window.location.pathname.split('/').pop() || 'raiz') 
                : 'servico'
        };

        const docRef = await addDoc(collection(db, "logs_atividades"), payload);
        return docRef.id;
    } catch (err) {
        console.warn('[logger] Falha ao gravar log de auditoria (operação principal preservada):', err);
        return null;
    }
}

/**
 * Consulta logs de auditoria com paginação e ordenação decrescente por data.
 * 
 * @param {Object} filtros
 * @param {string} [filtros.modulo] - Filtrar por módulo específico (ou '' para todos)
 * @param {string} [filtros.acao] - Filtrar por ação ('CRIAR', 'EDITAR', 'EXCLUIR', etc.)
 * @param {number} [filtros.limite=30] - Quantidade máxima de registros por página
 * @param {any} [filtros.ultimoDoc=null] - DocumentSnapshot para carregar a próxima página
 * @returns {Promise<{logs: Array<Object>, ultimoDoc: any, vazio: boolean}>}
 */
export async function buscarLogs({ modulo = '', acao = '', limite = 30, ultimoDoc = null } = {}) {
    try {
        const constraints = [];

        if (modulo) {
            constraints.push(where("modulo", "==", String(modulo).toLowerCase().trim()));
        }

        if (acao) {
            constraints.push(where("acao", "==", String(acao).toUpperCase().trim()));
        }

        // Ordenação sempre da mais recente para a mais antiga
        constraints.push(orderBy("timestamp", "desc"));

        if (ultimoDoc) {
            constraints.push(startAfter(ultimoDoc));
        }

        constraints.push(limit(limite));

        const q = query(collection(db, "logs_atividades"), ...constraints);
        const snapshot = await getDocs(q);

        const logs = [];
        snapshot.forEach(docSnap => {
            logs.push({
                id: docSnap.id,
                _doc: docSnap,
                ...docSnap.data()
            });
        });

        const novoUltimoDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

        return {
            logs,
            ultimoDoc: novoUltimoDoc,
            vazio: snapshot.empty,
            totalRetornado: snapshot.docs.length
        };
    } catch (err) {
        console.error('[logger] Erro ao buscar logs de auditoria:', err);
        throw err;
    }
}
