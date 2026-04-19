const API_BASE = 'https://bigg.onrender.com/api';

// =============================================
// AUTH
// =============================================
const Auth = {
  getToken:  () => localStorage.getItem('nxc_user_token'),
  getUser:   () => { try { return JSON.parse(localStorage.getItem('nxc_user')); } catch { return null; } },
  isLoggedIn:() => !!localStorage.getItem('nxc_user_token'),
  save: (token, user) => {
    localStorage.setItem('nxc_user_token', token);
    localStorage.setItem('nxc_user', JSON.stringify(user));
  },
  logout: () => {
    localStorage.removeItem('nxc_user_token');
    localStorage.removeItem('nxc_user');
    localStorage.removeItem('nxc_chat_session');
    window.location.href = 'login.html';
  },
  requireAuth: () => {
    if (!Auth.isLoggedIn()) { window.location.href = 'login.html'; return false; }
    return true;
  },
  redirectIfLoggedIn: () => {
    if (Auth.isLoggedIn()) { window.location.href = 'dashboard.html'; return true; }
    return false;
  }
};

// =============================================
// API
// =============================================
const api = {
  async request(method, path, body = null) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    const token = Auth.getToken();
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;
    if (body)  opts.body = JSON.stringify(body);
    const res  = await fetch(API_BASE + path, opts);
    if (res.status === 401 || res.status === 403) { Auth.logout(); return; }
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  },
  get:    p     => api.request('GET',    p),
  post:   (p,b) => api.request('POST',   p, b),
  put:    (p,b) => api.request('PUT',    p, b),
  delete: p     => api.request('DELETE', p),
};

// =============================================
// LOADING SCREEN
// =============================================
function initLoadingScreen(messages = [], duration = 2200) {
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
        setTimeout(() => { msgEl.textContent = messages[i]; msgEl.style.opacity = 1; }, 200);
      } else clearInterval(iv);
    }, duration / (messages.length + 1));
  }
  setTimeout(() => {
    screen.classList.add('hidden');
    setTimeout(() => screen.remove(), 500);
  }, duration);
}

// =============================================
// LAYOUT INIT
// =============================================
function initLayout(pageKey) {
  const user = Auth.getUser();
  if (!user) return;

  const av   = document.getElementById('user-avatar');
  const un   = document.getElementById('user-name');
  const ue   = document.getElementById('user-email');
  const tw   = document.getElementById('topbar-title');

  if (av) av.textContent = user.name?.charAt(0).toUpperCase() || 'U';
  if (un) un.textContent = user.name;
  if (ue) ue.textContent = user.email;
  if (tw) tw.textContent = pageTitles[pageKey] || 'NexaCargo';

  document.getElementById('logout-btn')?.addEventListener('click', Auth.logout);

  // Mobile sidebar
  const menuBtn = document.getElementById('menu-btn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (menuBtn && sidebar && overlay) {
    menuBtn.onclick = () => { sidebar.classList.toggle('open'); overlay.classList.toggle('open'); };
    overlay.onclick = () => { sidebar.classList.remove('open'); overlay.classList.remove('open'); };
  }

  // Active nav
  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    if (link.dataset.page === pageKey) link.classList.add('active');
  });

  // Active bottom nav
  document.querySelectorAll('.bnav-item[data-page]').forEach(item => {
    if (item.dataset.page === pageKey) item.classList.add('active');
  });

  // Add bottom padding on mobile
  document.body.classList.add('has-bottom-nav');

  // Load notifications badge
  loadNotifBadge();
}

const pageTitles = {
  dashboard: 'Dashboard',
  shipments: 'My Shipments',
  place: 'Place Shipment',
  track: 'Track Shipment',
  chat: 'Support Chat',
  profile: 'My Profile',
  notifications: 'Notifications'
};

// =============================================
// NOTIFICATION BADGE
// =============================================
async function loadNotifBadge() {
  try {
    const data = await api.get('/user/notifications');
    const unread = (data.notifications || []).filter(n => !n.is_read).length;
    const dot = document.getElementById('notif-dot');
    const bnavDot = document.getElementById('bnav-notif-dot');
    if (unread > 0) {
      if (dot) dot.classList.add('show');
      if (bnavDot) bnavDot.classList.add('show');
    }
  } catch(e) {}
}

// =============================================
// NOTIFICATIONS DROPDOWN
// =============================================
function initNotifDropdown() {
  const btn      = document.getElementById('notif-btn');
  const dropdown = document.getElementById('notif-dropdown');
  if (!btn || !dropdown) return;

  btn.onclick = async (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
    if (dropdown.classList.contains('open')) await loadNotifDropdown();
  };
  document.addEventListener('click', () => dropdown.classList.remove('open'));
  dropdown.addEventListener('click', e => e.stopPropagation());
}

async function loadNotifDropdown() {
  const list = document.getElementById('notif-list');
  if (!list) return;
  try {
    const data = await api.get('/user/notifications');
    const notifs = data.notifications || [];
    if (!notifs.length) {
      list.innerHTML = '<div class="notif-empty">No notifications yet.</div>';
      return;
    }
    list.innerHTML = notifs.map(n => `
      <div class="notif-item ${n.is_read ? '' : 'unread'}" onclick="markNotifRead('${n.id}',this)">
        <div class="notif-item-title">${n.title}</div>
        <div class="notif-item-msg">${n.message}</div>
        <div class="notif-item-time">${fmtDateTime(n.created_at)}</div>
      </div>`).join('');
  } catch(e) {}
}

async function markNotifRead(id, el) {
  try {
    await api.put('/user/notifications/' + id + '/read');
    el.classList.remove('unread');
  } catch(e) {}
}

async function markAllNotifsRead() {
  try {
    await api.put('/user/notifications/read-all');
    document.querySelectorAll('.notif-item.unread').forEach(el => el.classList.remove('unread'));
    document.getElementById('notif-dot')?.classList.remove('show');
    document.getElementById('bnav-notif-dot')?.classList.remove('show');
  } catch(e) {}
}

// =============================================
// UTILITIES
// =============================================
function statusBadge(status = '') {
  const s = (status || '').toLowerCase();
  if (s.includes('deliver')) return `<span class="badge badge-delivered">${status}</span>`;
  if (s.includes('transit') || s.includes('picked') || s.includes('out for') || s.includes('hub')) return `<span class="badge badge-transit">${status}</span>`;
  if (s.includes('pending') || s.includes('registered')) return `<span class="badge badge-pending">${status}</span>`;
  if (s.includes('delay') || s.includes('hold')) return `<span class="badge badge-cancelled">${status}</span>`;
  return `<span class="badge badge-processing">${status}</span>`;
}

function trackStatusClass(status = '') {
  const s = status.toLowerCase();
  if (s.includes('deliver')) return 'delivered';
  if (s.includes('transit') || s.includes('picked') || s.includes('out for') || s.includes('hub') || s.includes('customs')) return 'transit';
  if (s.includes('pending') || s.includes('registered')) return 'pending';
  return 'other';
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
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  setTimeout(() => el.classList.remove('show'), 5000);
}

function getParam(k) { return new URLSearchParams(window.location.search).get(k); }

function renderTimeline(timeline) {
  if (!timeline.length) return '<p style="color:var(--faint);font-size:12.5px;padding:8px 0;">No tracking updates yet.</p>';
  return timeline.map((t, i) => `
    <div class="timeline-item">
      <div class="tl-dot-wrap">
        <div class="tl-dot ${i === timeline.length-1 ? 'current' : 'done'}"></div>
        ${i < timeline.length-1 ? '<div class="tl-line"></div>' : ''}
      </div>
      <div class="tl-content">
        <div class="tl-status">${t.status}</div>
        <div class="tl-location">📍 ${t.location}</div>
        ${t.note ? `<div class="tl-note">${t.note}</div>` : ''}
        <div class="tl-time">${fmtDateTime(t.updated_at)}</div>
      </div>
    </div>`).join('');
}
