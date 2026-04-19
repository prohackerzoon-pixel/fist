// =============================================
// CONFIG
// =============================================
const API_BASE = 'https://bigg.onrender.com/api';

// =============================================
// AUTH HELPERS
// =============================================
const Auth = {
  getToken: () => localStorage.getItem('nexacargo_token'),
  getAdmin: () => {
    try { return JSON.parse(localStorage.getItem('nexacargo_admin')); }
    catch { return null; }
  },
  isLoggedIn: () => !!localStorage.getItem('nexacargo_token'),
  logout: () => {
    localStorage.removeItem('nexacargo_token');
    localStorage.removeItem('nexacargo_admin');
    window.location.href = 'login.html';
  },
  requireAuth: () => {
    if (!Auth.isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }
};

// =============================================
// API HELPER
// =============================================
const api = {
  async request(method, path, body = null) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    const token = Auth.getToken();
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(API_BASE + path, opts);

    if (res.status === 401 || res.status === 403) {
      Auth.logout(); return;
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  },
  get:    (path)         => api.request('GET',    path),
  post:   (path, body)   => api.request('POST',   path, body),
  put:    (path, body)   => api.request('PUT',    path, body),
  delete: (path)         => api.request('DELETE', path),
};

// =============================================
// LOADING SCREEN
// =============================================
function initLoadingScreen(messages = [], duration = 2000) {
  const screen = document.getElementById('loading-screen');
  if (!screen) return;

  const msgEl = document.getElementById('loading-msg');
  let i = 0;

  if (messages.length && msgEl) {
    msgEl.textContent = messages[0];
    const iv = setInterval(() => {
      i++;
      if (i < messages.length) {
        msgEl.style.opacity = 0;
        setTimeout(() => {
          msgEl.textContent = messages[i];
          msgEl.style.opacity = 1;
        }, 200);
      } else clearInterval(iv);
    }, duration / (messages.length + 1));
  }

  setTimeout(() => {
    screen.classList.add('hidden');
    setTimeout(() => screen.remove(), 500);
  }, duration);
}

// =============================================
// LAYOUT HELPERS
// =============================================
function initLayout() {
  // Inject sidebar & topbar into pages that need it
  const admin = Auth.getAdmin();
  if (!admin) return;

  // Set admin info in sidebar footer
  const av = document.getElementById('admin-avatar');
  const an = document.getElementById('admin-name');
  const ar = document.getElementById('admin-role');
  const tw = document.getElementById('topbar-welcome');

  if (av) av.textContent = admin.name?.charAt(0).toUpperCase() || 'A';
  if (an) an.textContent = admin.name;
  if (ar) ar.textContent = admin.role?.replace('_', ' ');
  if (tw) tw.innerHTML = `Welcome back, <strong>${admin.name}</strong>`;

  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.onclick = Auth.logout;

  // Mobile sidebar toggle
  const menuBtn = document.getElementById('menu-btn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (menuBtn && sidebar && overlay) {
    menuBtn.onclick = () => { sidebar.classList.toggle('open'); overlay.classList.toggle('open'); };
    overlay.onclick = () => { sidebar.classList.remove('open'); overlay.classList.remove('open'); };
  }

  // Mark active nav link
  const page = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === page || (href === 'dashboard.html' && (page === '' || page === 'index.html'))) {
      link.classList.add('active');
    }
  });
}

// =============================================
// UTILITIES
// =============================================
function statusBadge(status = '') {
  const s = (status || '').toLowerCase();
  if (s.includes('deliver')) return `<span class="badge badge-delivered">${status}</span>`;
  if (s.includes('transit')) return `<span class="badge badge-transit">${status}</span>`;
  if (s.includes('pending')) return `<span class="badge badge-pending">${status}</span>`;
  if (s.includes('delay'))   return `<span class="badge badge-cancelled">${status}</span>`;
  if (s.includes('hold'))    return `<span class="badge badge-processing">${status}</span>`;
  if (s.includes('picked'))  return `<span class="badge badge-transit">${status}</span>`;
  if (s.includes('customs')) return `<span class="badge badge-processing">${status}</span>`;
  if (s.includes('out for')) return `<span class="badge badge-blue">${status}</span>`;
  return `<span class="badge badge-new">${status}</span>`;
}

function reqBadge(status = '') {
  const map = { new:'badge-new', processing:'badge-processing', converted:'badge-converted', rejected:'badge-rejected' };
  return `<span class="badge ${map[status] || 'badge-new'}">${status}</span>`;
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
}
function fmtDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}
function fmtTime(d) {
  if (!d) return '';
  return new Date(d).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
}

function showAlert(id, msg, type = 'success') {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `alert alert-${type} show`;
  el.innerHTML = (type === 'success' ? '✅ ' : type === 'error' ? '❌ ' : 'ℹ️ ') + msg;
  setTimeout(() => el.classList.remove('show'), 4000);
}

function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = 'Copied!';
    btn.style.background = 'var(--success)';
    btn.style.color = '#000';
    setTimeout(() => { btn.textContent = orig; btn.style.background = ''; btn.style.color = ''; }, 1800);
  });
}

function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

function confirm2(msg) {
  return window.confirm(msg);
}
