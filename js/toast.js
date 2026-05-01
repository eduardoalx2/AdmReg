/**
 * js/toast.js — Sistema de notificações toast
 *
 * Portal Região 655 — Fase 4: Qualidade e UX
 *
 * Uso:
 *   import { showToast, toastSuccess, toastError, toastWarning, toastInfo, setupGlobalErrorHandling } from './js/toast.js';
 *   toastSuccess('Operação concluída!');
 *   await algumProcesso().catch(e => toastError('Erro: ' + e.message));
 *   setupGlobalErrorHandling(); // ativa captura global de erros
 */

let _container = null;
let _toastCount = 0;
const MAX_VISIBLE = 5;

function getContainer() {
    if (!_container || !document.body.contains(_container)) {
        _container = document.createElement('div');
        _container.id = 'toast-container';
        _container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:99999;display:flex;flex-direction:column-reverse;gap:8px;pointer-events:none;';
        document.body.appendChild(_container);
    }
    return _container;
}

/**
 * Exibe um toast notification.
 * @param {string} message — Mensagem a exibir
 * @param {'success'|'error'|'warning'|'info'} type — Tipo do toast
 * @param {number} [duration=4000] — Duração em ms (0 = não fecha automaticamente)
 */
export function showToast(message, type = 'info', duration = 4000) {
    const container = getContainer();
    const existing = container.querySelectorAll('.toast-item');
    if (existing.length >= MAX_VISIBLE) {
        existing[existing.length - 1].remove();
    }

    const colors = {
        success: { bg: '#059669', icon: '&#10003;' },
        error:   { bg: '#dc2626', icon: '&#10007;' },
        warning: { bg: '#d97706', icon: '&#9888;' },
        info:    { bg: '#3b82f6', icon: '&#8505;' }
    };
    const c = colors[type] || colors.info;

    const el = document.createElement('div');
    el.className = 'toast-item';
    el.style.cssText = `
        display:flex;align-items:center;gap:10px;background:${c.bg};color:#fff;
        font-size:12px;font-weight:600;padding:12px 16px;border-radius:12px;
        box-shadow:0 8px 32px rgba(0,0,0,0.45);
        pointer-events:auto;cursor:pointer;
        min-width:280px;max-width:420px;
        animation:toast-in .3s ease;
    `;
    el.innerHTML = `<span style="font-size:14px;flex-shrink:0;">${c.icon}</span><span style="flex:1;line-height:1.4;">${message}</span>`;
    el.addEventListener('click', () => dismiss(el));

    container.appendChild(el);

    let timer = null;
    if (duration > 0) {
        timer = setTimeout(() => dismiss(el), duration);
    }

    function dismiss(item) {
        if (timer) clearTimeout(timer);
        item.style.opacity = '0';
        item.style.transform = 'translateX(20px)';
        item.style.transition = 'all 0.2s ease';
        setTimeout(() => {
            if (item.parentNode) item.remove();
        }, 200);
    }
}

export function toastSuccess(msg, duration) { showToast(msg, 'success', duration); }
export function toastError(msg, duration) { showToast(msg, 'error', duration ?? 6000); }
export function toastWarning(msg, duration) { showToast(msg, 'warning', duration ?? 5000); }
export function toastInfo(msg, duration) { showToast(msg, 'info', duration); }

/**
 * Ativa captura global de erros não tratados e promessas rejeitadas.
 * Exibe toast para o usuário e mantém log no console.
 */
export function setupGlobalErrorHandling() {
    window.addEventListener('error', (e) => {
        if (e.target && (e.target.tagName === 'IMG' || e.target.tagName === 'SCRIPT' || e.target.tagName === 'LINK')) {
            console.warn('[global-error] Recurso falhou ao carregar:', e.target.src || e.target.href);
            return; // não mostra toast para falhas de recursos
        }
        const msg = e.message || 'Erro inesperado';
        console.error('[global-error]', msg, e.filename, e.lineno);
        toastError('Erro: ' + (msg.length > 80 ? msg.substring(0, 80) + '...' : msg));
    });

    window.addEventListener('unhandledrejection', (e) => {
        const msg = e.reason?.message || 'Erro em operação assíncrona';
        console.error('[unhandled-rejection]', e.reason);
        toastError(msg.length > 80 ? msg.substring(0, 80) + '...' : msg);
    });
}

// Injeta CSS da animação de entrada se não existir
if (typeof document !== 'undefined' && !document.getElementById('toast-anim-style')) {
    const style = document.createElement('style');
    style.id = 'toast-anim-style';
    style.textContent = '@keyframes toast-in{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}';
    document.head.appendChild(style);
}
