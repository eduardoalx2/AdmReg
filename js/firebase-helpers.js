/**
 * js/firebase-helpers.js — Funções reutilizáveis de Firestore
 */
import { db } from '../firebase-config.js';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

export async function fetchCollection(colName) {
    const snap = await getDocs(collection(db, colName));
    const list = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() }));
    return list;
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