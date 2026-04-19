(function () {
  const sidebarHTML = `
  <div class="sidebar-overlay" id="sidebar-overlay"></div>
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-logo">
      <div class="logo-icon">N</div>
      <div class="logo-text"><strong>NexaCargo</strong><span>My Account</span></div>
    </div>
    <nav class="sidebar-nav">
      <a href="dashboard.html" class="nav-link" data-page="dashboard"><span class="nav-icon">▦</span> Dashboard</a>
      <a href="shipments.html" class="nav-link" data-page="shipments"><span class="nav-icon">📦</span> My Shipments</a>
      <a href="place.html" class="nav-link" data-page="place"><span class="nav-icon">➕</span> Place Shipment</a>
      <a href="track.html" class="nav-link" data-page="track"><span class="nav-icon">📍</span> Track Package</a>
      <a href="chat.html" class="nav-link" data-page="chat">
        <span class="nav-icon">💬</span> Support Chat
        <span class="nav-badge-dot" id="chat-notif-dot" style="display:none;"></span>
      </a>
      <a href="notifications.html" class="nav-link" data-page="notifications">
        <span class="nav-icon">🔔</span> Notifications
        <span class="nav-badge-dot" id="notif-sidebar-dot" style="display:none;"></span>
      </a>
      <a href="profile.html" class="nav-link" data-page="profile"><span class="nav-icon">👤</span> My Profile</a>
    </nav>
    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar" id="user-avatar">U</div>
        <div>
          <div class="user-name"  id="user-name">User</div>
          <div class="user-email" id="user-email">—</div>
        </div>
      </div>
      <button class="btn btn-danger btn-full btn-sm" id="logout-btn">Sign Out</button>
    </div>
  </aside>`;

  const topbarHTML = `
  <header class="topbar">
    <div class="topbar-left">
      <button class="menu-btn" id="menu-btn">☰</button>
      <span class="topbar-title" id="topbar-title">NexaCargo</span>
    </div>
    <div class="topbar-right" style="position:relative;">
      <div class="topbar-notif" id="notif-btn" title="Notifications">
        🔔
        <div class="notif-dot" id="notif-dot"></div>
      </div>
      <div class="notif-dropdown" id="notif-dropdown">
        <div class="notif-header">
          <span>Notifications</span>
          <span class="notif-mark-all" onclick="markAllNotifsRead()">Mark all read</span>
        </div>
        <div class="notif-list" id="notif-list"><div class="notif-empty">Loading...</div></div>
      </div>
    </div>
  </header>`;

  const bottomNavHTML = `
  <nav class="bottom-nav">
    <div class="bnav-item" data-page="dashboard" onclick="location.href='dashboard.html'">
      <div class="bnav-icon">▦</div><div class="bnav-label">Home</div>
    </div>
    <div class="bnav-item" data-page="shipments" onclick="location.href='shipments.html'">
      <div class="bnav-icon">📦</div><div class="bnav-label">Shipments</div>
    </div>
    <div class="bnav-item" data-page="place" onclick="location.href='place.html'">
      <div class="bnav-icon" style="background:var(--accent);color:#000;width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-top:-14px;box-shadow:0 4px 16px rgba(245,158,11,0.4);font-size:22px;">➕</div>
      <div class="bnav-label" style="margin-top:2px;">Ship</div>
    </div>
    <div class="bnav-item" data-page="chat" onclick="location.href='chat.html'">
      <div class="bnav-icon">💬</div><div class="bnav-label">Chat</div>
      <div class="bnav-badge" id="bnav-notif-dot"></div>
    </div>
    <div class="bnav-item" data-page="profile" onclick="location.href='profile.html'">
      <div class="bnav-icon">👤</div><div class="bnav-label">Profile</div>
    </div>
  </nav>`;

  document.addEventListener('DOMContentLoaded', () => {
    const shell = document.getElementById('app-shell');
    if (!shell) return;
    shell.insertAdjacentHTML('afterbegin', sidebarHTML);
    const main = shell.querySelector('.main-area');
    if (main) main.insertAdjacentHTML('afterbegin', topbarHTML);
    document.body.insertAdjacentHTML('beforeend', bottomNavHTML);
    initNotifDropdown();
  });
})();
