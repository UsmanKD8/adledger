Layout.init('dashboard');

(async () => {
  const d = await API.report('dashboard');
  const kpis = [
    ['Total Ad Spend', UI.money(d.total_spend)],
    ['Total Revenue', UI.money(d.total_revenue)],
    ['Leads', UI.num(d.total_leads)],
    ['Customers', UI.num(d.total_customers)],
    ['Active Clients', UI.num(d.active_clients)],
    ['Active Campaigns', UI.num(d.active_campaigns)],
    ['Outstanding Invoices', UI.money(d.outstanding)],
    ['Pending Deliverables', UI.num(d.pending_deliverables)],
  ];
  const maxLeads = Math.max(1, ...d.leads_by_status.map(s => s.count));

  document.getElementById('content').innerHTML = `
    <div class="page-head"><div><h1>Dashboard</h1><p class="muted">Agency performance at a glance</p></div></div>
    <div class="kpi-grid">
      ${kpis.map(([label, value]) => `<div class="card kpi"><div class="label">${label}</div><div class="value">${value}</div></div>`).join('')}
    </div>
    <div class="grid-2">
      <div class="card table-wrap">
        <h2 style="padding:18px 18px 0">Top Campaigns by Revenue</h2>
        <table class="table">
          <thead><tr><th>Campaign</th><th>Client</th><th class="num">Spend</th><th class="num">Revenue</th><th class="num">ROAS</th></tr></thead>
          <tbody>${d.top_campaigns.map(c => `
            <tr><td>${UI.esc(c.campaign_name)}</td><td>${UI.esc(c.company_name)}</td>
            <td class="num">${UI.money(c.total_spend)}</td><td class="num">${UI.money(c.total_revenue)}</td>
            <td class="num">${UI.num(c.roas, 2)}x</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div class="card">
        <h2>Leads by Status</h2>
        ${d.leads_by_status.map(s => `
          <div class="bar-row"><span>${s.status}</span>
          <div class="bar"><span style="width:${(s.count / maxLeads) * 100}%"></span></div>
          <strong>${s.count}</strong></div>`).join('')}
      </div>
    </div>`;
})();
