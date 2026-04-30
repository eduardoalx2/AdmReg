/**
 * js/auth.js — Módulo centralizado de autenticação e autorização
 * 
 * Este módulo substitui a verificação insegura de localStorage.
 * As permissões são SEMPRE buscadas do Firestore, nunca confiando
 * apenas no que está no navegador.
 * 
 * Uso em qualquer página:
 *   import { requireAuth, getUserData, hasPermission, hasAnyPermission } from './js/auth.js';
 *   const user = await requireAuth(); // redireciona para login se não autenticado
 */

import { auth, db } from '../firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Cache local do usuário (apenas para a sessão atual, não persiste entre recargas)
let _cachedUser = null;
let _cachedPerms = null;
let _cachedIgreja = null;
let _cachedNome = null;

/**
 * Aguarda o estado de autenticação do Firebase e retorna o usuário autenticado.
 * Se não estiver autenticado, redireciona para login.html.
 * @returns {Promise<import("firebase/auth").User>} O usuário autenticado do Firebase.
 */
export function waitForAuth() {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            if (user) {
                resolve(user);
            } else {
                reject(new Error('Não autenticado'));
            }
        }, (error) => {
            unsubscribe();
            reject(error);
        });
    });
}

/**
 * Busca os dados do usuário no Firestore (coleção 'usuarios').
 * SEMPRE consulta o servidor — nunca confia apenas no localStorage.
 * @param {string} email - Email do usuário autenticado.
 * @returns {Promise<Object|null>} Dados do usuário ou null se não encontrado.
 */
async function fetchUserDataFromFirestore(email) {
    try {
        const q = query(collection(db, "usuarios"), where("email", "==", email));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        return snapshot.docs[0].data();
    } catch (error) {
        console.error('[auth] Erro ao buscar dados do usuário no Firestore:', error);
        return null;
    }
}

/**
 * Função principal: exige autenticação e retorna dados completos do usuário.
 * 
 * Fluxo:
 * 1. Verifica se o usuário está autenticado via Firebase Auth
 * 2. Busca dados do usuário no Firestore (permissões, igreja, status)
 * 3. Verifica se o usuário está ativo
 * 4. Atualiza o cache local e o localStorage (para compatibilidade)
 * 5. Retorna os dados ou redireciona para login
 * 
 * @param {Object} options
 * @param {boolean} options.requireActive - Se true (padrão), rejeita usuários inativos.
 * @returns {Promise<{email: string, nome: string, permissoes: string[], igrejaNome: string, status: string, rawData: Object}>}
 */
export async function requireAuth({ requireActive = true } = {}) {
    // 1. Verificar autenticação Firebase
    let firebaseUser;
    try {
        firebaseUser = await waitForAuth();
    } catch (e) {
        console.warn('[auth] Usuário não autenticado, redirecionando para login...');
        window.location.replace('login.html');
        throw new Error('Redirecionando para login');
    }

    const email = firebaseUser.email.toLowerCase();

    // 2. Buscar dados do Firestore (sempre do servidor)
    const userData = await fetchUserDataFromFirestore(email);
    if (!userData) {
        console.error('[auth] Usuário autenticado mas não encontrado na coleção "usuarios".');
        await auth.signOut();
        localStorage.clear();
        window.location.replace('login.html');
        throw new Error('Usuário sem permissão');
    }

    // 3. Verificar status ativo
    if (requireActive && userData.status !== 'Ativo') {
        console.warn('[auth] Conta inativa.');
        await auth.signOut();
        localStorage.clear();
        window.location.replace('login.html');
        throw new Error('Conta inativa');
    }

    // 4. Modo simulação: admin visualizando como outro usuário.
    // Verifica que o usuário real é admin antes de honrar a simulação.
    const viewAs = localStorage.getItem('__view_as__');
    const viewAsBackup = localStorage.getItem('__view_as_backup__');
    if (viewAs && viewAsBackup && (userData.permissoes || []).includes('admin')) {
        const simPerms  = JSON.parse(localStorage.getItem('userPerms')  || '[]');
        const simIgreja = localStorage.getItem('userIgreja') || '';
        const simNome   = localStorage.getItem('userName')   || '';

        _cachedUser  = firebaseUser;
        _cachedPerms = simPerms;
        _cachedIgreja = simIgreja;
        _cachedNome  = simNome;

        return {
            email,
            nome: simNome,
            permissoes: simPerms,
            igrejaNome: simIgreja,
            status: 'Ativo',
            rawData: userData,
            isSimulation: true
        };
    }

    // 5. Atualizar cache e localStorage (para compatibilidade com código legado)
    const permissoes = userData.permissoes || [];
    const igrejaNome = userData.igrejaNome || '';

    _cachedUser = firebaseUser;
    _cachedPerms = permissoes;
    _cachedIgreja = igrejaNome;
    _cachedNome = userData.nome || '';

    // Atualiza localStorage para que o código legado ainda funcione durante a transição
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userName', userData.nome || '');
    localStorage.setItem('userPerms', JSON.stringify(permissoes));
    localStorage.setItem('userIgreja', igrejaNome);

    return {
        email,
        nome: userData.nome || '',
        permissoes,
        igrejaNome,
        status: userData.status || '',
        rawData: userData
    };
}

/**
 * Verifica se o usuário tem uma permissão específica.
 * Usa o cache da sessão atual (que veio do Firestore).
 * @param {string} permissao - Ex: 'admin', 'pastor_titular', 'secretario'
 * @returns {boolean}
 */
export function hasPermission(permissao) {
    if (!_cachedPerms) {
        // Fallback: tentar ler do localStorage (durante transição)
        try {
            _cachedPerms = JSON.parse(localStorage.getItem('userPerms') || '[]');
        } catch {
            _cachedPerms = [];
        }
    }
    return _cachedPerms.includes(permissao);
}

/**
 * Verifica se o usuário tem pelo menos uma das permissões listadas.
 * @param {string[]} permissoes - Array de permissões para verificar.
 * @returns {boolean}
 */
export function hasAnyPermission(permissoes) {
    return permissoes.some(p => hasPermission(p));
}

/**
 * Verifica se o usuário é admin.
 * @returns {boolean}
 */
export function isAdmin() {
    return hasPermission('admin');
}

/**
 * Retorna o email do usuário atual (do cache).
 * @returns {string}
 */
export function getCurrentEmail() {
    return _cachedUser?.email || localStorage.getItem('userEmail') || '';
}

/**
 * Retorna o nome do usuário atual (do cache).
 * @returns {string}
 */
export function getCurrentName() {
    return _cachedNome || localStorage.getItem('userName') || '';
}

/**
 * Retorna a igreja do usuário atual (do cache).
 * @returns {string}
 */
export function getCurrentIgreja() {
    return _cachedIgreja || localStorage.getItem('userIgreja') || '';
}

/**
 * Retorna os dados completos do cache (sem nova consulta ao Firestore).
 * @returns {Object|null}
 */
export function getCachedUserData() {
    return {
        email: getCurrentEmail(),
        nome: getCurrentName(),
        permissoes: _cachedPerms || JSON.parse(localStorage.getItem('userPerms') || '[]'),
        igrejaNome: getCurrentIgreja()
    };
}

/**
 * Limpa o cache e faz logout.
 */
export async function logout() {
    _cachedUser = null;
    _cachedPerms = null;
    _cachedIgreja = null;
    _cachedNome = null;
    await auth.signOut();
    localStorage.clear();
    window.location.replace('login.html');
}