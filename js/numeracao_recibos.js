/**
 * js/numeracao_recibos.js — Numeração sequencial de recibos
 *
 * Portal Região 655 — IEQ Londrina/PR
 *
 * Padrão do número (inalterado): CODIGO_IGREJA.AAMM.SEQ  (ex.: 123.2611.03)
 *
 * Regras:
 *  - O próximo SEQ é o MAIOR número já utilizado pela igreja no mês (+1),
 *    considerando os recibos existentes E os números cancelados.
 *  - Ao excluir um recibo, seu número é gravado em 'recibos_numeros_cancelados'
 *    e nunca mais é reutilizado.
 */

import {
    collection, getDocs, doc, getDoc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getCurrentEmail, getCurrentName } from './auth.js';

export const COLECAO_CANCELADOS = 'recibos_numeros_cancelados';

/** Extrai { codigo, aamm, seq } de um código "CODIGO.AAMM.SEQ". */
export function parseCodigoRecibo(codigoRecibo) {
    if (!codigoRecibo || typeof codigoRecibo !== 'string') return null;
    const p = codigoRecibo.trim().split('.');
    if (p.length !== 3) return null;
    const seq = parseInt(p[2], 10);
    if (isNaN(seq)) return null;
    return { codigo: p[0], aamm: p[1], seq };
}

/** Mês (AA, MM) do recibo pela data de emissão (ou referência, como fallback). */
function mesDoRecibo(r) {
    let aa = '', mm = '';
    if (r.dataEmissao && r.dataEmissao.includes('/')) {
        const parts = r.dataEmissao.split('/');
        if (parts.length === 3) { mm = parts[1].padStart(2, '0'); aa = parts[2].slice(-2); }
    }
    if ((!aa || !mm) && r.referenceDate && r.referenceDate.includes('/')) {
        const parts = r.referenceDate.split('/');
        if (parts.length === 2) { mm = parts[0].padStart(2, '0'); aa = parts[1].slice(-2); }
    }
    return { aa, mm };
}

/**
 * Calcula o próximo número de recibo da igreja no mês.
 * @param {Firestore} db
 * @param {string|number} codigoIgreja
 * @param {string} aa - ano com 2 dígitos (ex.: '26')
 * @param {string} mm - mês com 2 dígitos (ex.: '11')
 * @returns {Promise<string>} código completo, ex.: '123.2611.04'
 */
export async function calcularProximoCodigoRecibo(db, codigoIgreja, aa, mm) {
    const cod = String(codigoIgreja);
    const aamm = `${aa}${mm}`;
    let qtdNoMes = 0;  // contagem (compatível com recibos antigos sem codigoRecibo)
    let maiorSeq = 0;  // maior número já utilizado

    try {
        const [snapRecibos, snapCancelados] = await Promise.all([
            getDocs(collection(db, 'recibos')),
            getDocs(collection(db, COLECAO_CANCELADOS))
        ]);

        snapRecibos.forEach(d => {
            const r = d.data();
            const itemCode = r.igrejaCodigo || (r.igrejaFormatada ? r.igrejaFormatada.split(' - ')[0].trim() : '');
            if (String(itemCode) !== cod) return;

            const m = mesDoRecibo(r);
            if (m.aa === aa && m.mm === mm) qtdNoMes++;

            const p = parseCodigoRecibo(r.codigoRecibo);
            if (p && p.codigo === cod && p.aamm === aamm) maiorSeq = Math.max(maiorSeq, p.seq);
        });

        snapCancelados.forEach(d => {
            const p = parseCodigoRecibo(d.data().codigoRecibo);
            if (p && p.codigo === cod && p.aamm === aamm) maiorSeq = Math.max(maiorSeq, p.seq);
        });
    } catch (e) {
        console.warn('Erro ao calcular sequencial do recibo:', e);
    }

    const proximo = Math.max(qtdNoMes, maiorSeq) + 1;
    return `${cod}.${aamm}.${String(proximo).padStart(2, '0')}`;
}

/**
 * Registra o número de um recibo como CANCELADO (não poderá ser reutilizado).
 * Deve ser chamado ANTES de excluir o recibo.
 * @param {Firestore} db
 * @param {Object} recibo - dados do recibo (precisa ter codigoRecibo)
 * @param {string} reciboDocId - id do documento do recibo
 * @returns {Promise<boolean>} true se registrou (ou já estava registrado)
 */
export async function cancelarNumeroRecibo(db, recibo, reciboDocId) {
    const codigo = recibo?.codigoRecibo;
    const p = parseCodigoRecibo(codigo);
    if (!p) return false;

    const ref = doc(db, COLECAO_CANCELADOS, codigo.replace(/\//g, '_'));
    const existente = await getDoc(ref);
    if (existente.exists()) return true;

    await setDoc(ref, {
        codigoRecibo: codigo,
        igrejaCodigo: p.codigo,
        aamm: p.aamm,
        seq: p.seq,
        igrejaNome: recibo.igrejaNome || recibo.igrejaFormatada || '',
        referenceDate: recibo.referenceDate || '',
        dataEmissao: recibo.dataEmissao || '',
        total: Number(recibo.total || 0),
        reciboDocId: reciboDocId || '',
        canceladoPor: getCurrentEmail() || '',
        canceladoPorNome: getCurrentName() || '',
        canceladoEm: serverTimestamp()
    });
    return true;
}

