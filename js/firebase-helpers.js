/**
 * js/firebase-helpers.js — Funções reutilizáveis de Firestore
 * Fase 3: Adicionado suporte a queries filtradas e paginação
 */
import { db } from '../firebase-config.js';
import {
    collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc,
    serverTimestamp, query, where, orderBy, limit, startAfter
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

/**
 * Busca todos os documentos de uma coleção (sem filtro).
 * ⚠️ Use fetchCollectionWhere() quando possível para reduzir leituras.
 */
export async function fetchCollection(colName) {
    const snap = await getDocs(collection(db, colName));
    const list = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() }));
    return list;
}

/**
 * Busca documentos com filtros where().
 * @param {string} colName - Nome da coleção
 * @param {Array} conditions - Array de [campo, operador, valor] ex: [['status','==','Ativo']]
 * @param {string} orderField - Campo para ordenação (opcional)
 * @param {string} orderDir - 'asc' ou 'desc' (opcional, padrão 'asc')
 * @param {number} maxResults - Limite de resultados (opcional)
 */
export async function fetchCollectionWhere(colName, conditions = [], orderField = null, orderDir = 'asc', maxResults = null) {
    let q = collection(db, colName);
    const constraints = [];
    for (const [field, op, value] of conditions) {
        constraints.push(where(field, op, value));
    }
    if (orderField) {
        constraints.push(orderBy(orderField, orderDir));
    }
    if (maxResults) {
        constraints.push(limit(maxResults));
    }
    if (constraints.length) {
        q = query(q, ...constraints);
    }
    const snap = await getDocs(q);
    const list = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() }));
    return list;
}

/**
 * Busca paginada de documentos.
 * @param {string} colName - Nome da coleção
 * @param {number} pageSize - Quantidade por página
 * @param {object} lastDoc - Último documento da página anterior (para próxima página)
 * @param {string} orderField - Campo para ordenação
 * @param {string} orderDir - 'asc' ou 'desc'
 * @param {Array} conditions - Filtros where() opcionais
 * @returns {{ items: Array, lastDoc: object|null, hasMore: boolean }}
 */
export async function fetchPaginated(colName, pageSize = 20, lastDoc = null, orderField = 'createdAt', orderDir = 'desc', conditions = []) {
    const constraints = [];
    for (const [field, op, value] of conditions) {
        constraints.push(where(field, op, value));
    }
    constraints.push(orderBy(orderField, orderDir));
    constraints.push(limit(pageSize + 1)); // busca 1 extra para saber se tem mais
    if (lastDoc) {
        constraints.push(startAfter(lastDoc));
    }
    const q = query(collection(db, colName), ...constraints);
    const snap = await getDocs(q);
    const docs = snap.docs;
    const hasMore = docs.length > pageSize;
    const items = docs.slice(0, pageSize).map(d => ({ id: d.id, ...d.data() }));
    return { items, lastDoc: docs.length > 0 ? docs[Math.min(docs.length - 1, pageSize - 1)] : null, hasMore };
}

export async function fetchDoc(colName, id) {
    const snap = await getDoc(doc(db, colName, id));
    if (snap.exists()) return { id: snap.id, ...snap.data() };
    return null;
}

export async function updateDocument(colName, id, payload) {
    await updateDoc(doc(db, colName, id), { ...payload, updatedAt: serverTimestamp() });
}

export async function addDocument(colName, payload) {
    return await addDoc(collection(db, colName), { ...payload, createdAt: serverTimestamp() });
}

export async function deleteDocument(colName, id) {
    await deleteDoc(doc(db, colName, id));
}
