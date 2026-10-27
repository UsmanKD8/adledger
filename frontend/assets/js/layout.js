// Builds the sidebar + topbar shell shared by every page inside /pages.
const NAV = [
  { section: 'Overview' },
  { key: 'dashboard', label: 'Dashboard', icon: '▦' },
  { key: 'reports', label: 'Attribution Reports', icon: '◔' },
  { section: 'Marketing' },
  { key: 'clients', label: 'Clients', icon: '◉' },
  { key: 'campaigns', label: 'Campaigns', icon: '➤' },
  { key: 'ad-spend', label: 'Ad Spend', icon: '₨' },
  { key: 'deliverables', label: 'Deliverables', icon: '☑' },
  { section: 'Sales' },
  { key: 'leads', label: 'Leads', icon: '☺' },
  { key: 'followups', label: 'Follow-ups', icon: '☎' },
  { key: 'sales', label: 'Sales', icon: '$' },
  { section: 'Billing' },
  { key: 'invoices', label: 'Invoices', icon: '▤' },
  { key: 'payments', label: 'Payments', icon: '✓' },
  { section: 'Admin' },
  { key: 'users', label: 'Agency Users', icon: '⚙' },
];

const Session = {
  get() { try { return JSON.parse(sessionStorage.getItem('adledger_user')); } catch { return null; } },
  set(user) { try { sessionStorage.setItem('adledger_user', JSON.stringify(user)); } catch {} },
  clear() { try { sessionStorage.removeItem('adledger_user'); } catch {} },
};

const Layout = {
  init(activeKey) {
    const user = Session.get();
    if (!user) { window.location.href = '../index.html'; return; }

    document.body.innerHTML = `
      <div class="app">
        <aside class="sidebar">
          <div class="brand"><span class="logo">A</span>${CONFIG.APP_NAME}</div>
          <nav>${NAV.map(n => n.section
            ? `<div class="nav-section">${n.section}</div>`
            : `<a href="${n.key}.html" class="nav-link ${n.key === activeKey ? 'active' : ''}"><i>${n.icon}</i>${n.label}</a>`).join('')}
          </nav>
        </aside>
        <div class="main">
          <header class="topbar">
            <button class="icon-btn menu-btn" aria-label="Menu">☰</button>
            <span class="muted">${CONFIG.USE_MOCK ? 'Demo mode · sample data' : ''}</span>
            <div class="user">
              <span>${UI.esc(user.full_name)} <small class="muted">(${UI.esc(user.role)})</small></span>
              <button class="btn btn-sm" id="logoutBtn">Logout</button>
            </div>
          </header>
          <main id="content" class="content"></main>
        </div>
      </div>`;

    document.querySelector('.menu-btn').addEventListener('click', () => document.body.classList.toggle('nav-open'));
    document.getElementById('logoutBtn').addEventListener('click', async () => {
      await API.logout();
      Session.clear();
      window.location.href = '../index.html';
    });
  },
};
