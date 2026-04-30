/**
 * js/utils.js — Funções utilitárias compartilhadas
 * 
 * Portal Região 655 — Formatação, escape, conversão de períodos, etc.
 * 
 * Uso:
 *   import { esc, fmt, periodoRefToChave, ... } from './js/utils.js';
 */

/**
 * Escapa HTML para prevenir XSS em conteúdo de texto.
 * @param {any} s
 * @returns {string}
 */
export function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Escapa HTML para uso em atributos (aspas).
 * @param {any} s
 * @returns {string}
 */
export function escA(s) {
    return String(s || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/**
 * Formata número como moeda brasileira (R$).
 * @param {number|string} v
 * @returns {string}
 */
export function fmt(v) {
    const n = parseFloat(v) || 0;
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Converte string de moeda (R$ 1.234,56) para número.
 * @param {string} str
 * @returns {number}
 */
export function parseMoeda(str) {
    if (typeof str === 'number') return str;
    if (!str) return 0;
    return parseFloat(str.replace(/[^\d,-]/g, '').replace('.', '').replace(',', '.')) || 0;
}


/**
 * Converte referência "MM/YYYY" para chave "YYYY-MM".
 * @param {string} refStr - Ex: "04/2026"
 * @returns {string|null} Ex: "2026-04"
 */
export function periodoRefToChave(refStr) {
    if (!refStr || !refStr.includes('/')) return null;
    const [mm, yyyy] = refStr.split('/');
    return (mm && yyyy) ? `${yyyy}-${mm}` : null;
}

/**
 * Converte chave "YYYY-MM" para referência "MM/YYYY".
 * @param {string} chaveStr - Ex: "2026-04"
 * @returns {string|null} Ex: "04/2026"
 */
export function chaveToPeriodoRef(chaveStr) {
    if (!chaveStr || !chaveStr.includes('-')) return null;
    const [yyyy, mm] = chaveStr.split('-');
    return (mm && yyyy) ? `${mm}/${yyyy}` : null;
}

/**
 * Converte chave "YYYY-MM" para label por extenso "Mês/YYYY".
 * @param {string} chaveStr - Ex: "2026-04"
 * @returns {string} Ex: "Abril/2026"
 */
export function chaveToLabelExtenso(chaveStr) {
    if (!chaveStr || !chaveStr.includes('-')) return chaveStr;
    const [yyyy, mm] = chaveStr.split('-');
    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const nomeMes = meses[parseInt(mm, 10) - 1];
    return nomeMes ? `${nomeMes}/${yyyy}` : chaveStr;
}

/**
 * Calcula o 5º dia útil de um determinado mês/ano.
 * @param {number} ano
 * @param {number} mes - Mês baseado em 0 (Janeiro=0)
 * @returns {Date}
 */
export function calcQuintoDiaUtil(ano, mes) {
    let c = 0, d = 1;
    while (c < 5) {
        const w = new Date(ano, mes, d).getDay();
        if (w !== 0 && w !== 6) c++;
        if (c < 5) d++;
    }
    return new Date(ano, mes, d);
}

/**
 * Gera um ID único simples (não criptograficamente seguro).
 * @returns {string}
 */
export function uid() {
    return '_' + Math.random().toString(36).substr(2, 9);
}