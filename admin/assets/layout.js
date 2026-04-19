(function() {
  const navHTML = `
  <div class="sidebar-overlay" id="sidebar-overlay"></div>
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-logo">
      <div class="logo-icon">N</div>
      <div class="logo-text">
        <strong>NexaCargo</strong>
        <span>Admin Panel</span>
      </div>
    </div>
    <nav class="sidebar-nav">
      <a href="dashboard.html" class="nav-link"><span class="nav-icon">▦</span> Dashboard</a>
      <a href="shipments.html" class="nav-link"><span class="nav-icon">📦</span> Shipments</a>
      <a href="create-shipment.html" class="nav-link"><span class="nav-icon">➕</span> New Shipment</a>
      <a href="requests.html" class="nav-link"><span class="nav-icon">📋</span> Requests <span class="nav-badge" id="req-count" style="display:none">0</span></a>
      <a href="users.html" class="nav-link"><span class="nav-icon">👥</span> Users</a>
      <a href="chat.html" class="nav-link"><span class="nav-icon">💬</span> Chat Center <span class="nav-badge" id="chat-count" style="display:none">0</span></a>
      <a href="settings.html" class="nav-link"><span class="nav-icon">⚙️</span> Settings</a>
    </nav>
    <div class="sidebar-footer">
      <div class="admin-info">
        <div class="admin-avatar" id="admin-avatar">A</div>
        <div>
          <div class="admin-name" id="admin-name">Admin</div>
          <div class="admin-role" id="admin-role">super admin</div>
        </div>
      </div>
      <button class="btn btn-danger btn-full btn-sm" id="logout-btn">Sign Out</button>
    </div>
  </aside>`;

  const topbarHTML = `
  <header class="topbar">
    <div class="topbar-left">
      <button class="menu-btn" id="menu-btn">☰</button>
      <span class="topbar-welcome" id="topbar-welcome">Welcome back</span>
    </div>
    <div class="status-dot">
      <span class="dot-green"></span> System Online
      <span style="margin-left:12px;font-size:11px;color:var(--faint);">bigg.onrender.com</span>
    </div>
  </header>`;

  document.addEventListener('DOMContentLoaded', () => {
    const appShell = document.getElementById('app-shell');
    if (!appShell) return;

    appShell.insertAdjacentHTML('afterbegin', navHTML);
    const mainArea = appShell.querySelector('.main-area');
    if (mainArea) mainArea.insertAdjacentHTML('afterbegin', topbarHTML);

    initLayout();

    async function loadBadges() {
      try {
        const data = await api.get('/admin/dashboard');
        const rc = data.stats?.new_requests || 0;
        const cc = data.stats?.unread_chats || 0;
        const reqBadgeEl  = document.getElementById('req-count');
        const chatBadgeEl = document.getElementById('chat-count');
        if (reqBadgeEl  && rc > 0) { reqBadgeEl.textContent  = rc; reqBadgeEl.style.display  = 'inline-flex'; }
        if (chatBadgeEl && cc > 0) { chatBadgeEl.textContent = cc; chatBadgeEl.style.display = 'inline-flex'; }
      } catch(e) {}
    }
    loadBadges();
  });
})();
