// ============================================================
//  config.js — Configuração central do sistema
//  CONGRESSO DE MULHERES — IEQ Região 655
// ============================================================

// ⚠️ COLE AQUI a URL do Web App gerada no deploy do Apps Script (ver LEIA-ME.md)
export const API_URL = 'https://script.google.com/macros/s/AKfycbyitQ6E-O0bbnPBeAPFXUvmJ3_t0i2e_OQxeUROS6q8bwGm6CVjn0WgXl8zD8_usfV4gw/exec';

// Valor da inscrição por pessoa (R$)
export const VALOR_INSCRICAO = 210;

// ── Chamadas à API (CORS com fetch sem credenciais para evitar conflitos de login) ──
export async function apiGet(action, tentativas = 3) {
  const url = `${API_URL}?action=${action}`;

  for (let i = 0; i < tentativas; i++) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit' // Evita enviar cookies do Google, contornando o erro de login múltiplo
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.error) {
        throw new Error(data.error);
      }
      return data;
    } catch (err) {
      if (i === tentativas - 1) {
        console.error('Erro na requisição da API:', err);
        throw new Error('Erro ao conectar com a API do Google Sheets');
      }
      // Espera antes de tentar novamente (backoff)
      await new Promise(r => setTimeout(r, 800 * (i + 1)));
    }
  }
}

export async function apiPost(action, payload) {
  const body = JSON.stringify({ action, ...payload });
  const url  = `${API_URL}?method=POST&body=${encodeURIComponent(body)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit' // Evita enviar cookies do Google
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data && data.error) {
      throw new Error(data.error);
    }
    return data;
  } catch (err) {
    console.error('Erro no envio da API:', err);
    throw new Error('Erro ao conectar com a API do Google Sheets ao enviar dados');
  }
}

// ── Formatação ───────────────────────────────────────────────
export function formatBRL(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDate(str) {
  if (!str) return '—';
  return str;
}

// ── Toast de feedback ────────────────────────────────────────
export function showToast(msg, type = 'success') {
  const colors = { success: '#22c55e', error: '#ef4444', info: '#e11d48' };
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:9999;
    background:${colors[type] || colors.info}; color:#fff;
    padding:12px 20px; border-radius:10px; font-size:14px;
    box-shadow:0 4px 20px rgba(0,0,0,.2); font-family:inherit;
  `;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ── Modal ────────────────────────────────────────────────────
export function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
  document.getElementById(id).classList.add('flex');
}

export function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
  document.getElementById(id).classList.remove('flex');
}
