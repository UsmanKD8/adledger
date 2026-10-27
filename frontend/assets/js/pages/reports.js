Layout.init('reports');

(async () => {
  const rows = await API.report('campaign-performance');
  document.getElementById('content').innerHTML = `
    <div class="page-head">
      <div><h1>Campaign-to-Revenue Attribution</h1>
      <p class="muted">Spend → Leads → Customers → Revenue for every campaign</p></div>
      <div class="page-actions"><button class="btn" id="exportBtn">Export CSV</button></div>
    </div>
    <div class="card table-wrap">
      <table class="table">
        <thead><tr>
          <th>Campaign</th><th>Client</th><th>Platform</th>
          <th class="num">Spend</th><th class="num">Leads</th><th class="num">Customers</th>
          <th class="num">Revenue</th><th class="num">Cost / Lead</th><th class="num">Cost / Customer</th>
          <th class="num">Conv. Rate</th><th class="num">ROAS</th>
        </tr></thead>
        <tbody>${rows.map(r => `
          <tr>
            <td>${UI.esc(r.campaign_name)}</td><td>${UI.esc(r.company_name)}</td><td>${UI.esc(r.platform)}</td>
            <td class="num">${UI.money(r.total_spend)}</td><td class="num">${r.total_leads}</td>
            <td class="num">${r.total_customers}</td><td class="num">${UI.money(r.total_revenue)}</td>
            <td class="num">${UI.money(r.cost_per_lead)}</td><td class="num">${UI.money(r.cost_per_customer)}</td>
            <td class="num">${UI.num(r.conversion_rate, 1)}%</td><td class="num">${UI.num(r.roas, 2)}x</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;

  document.getElementById('exportBtn').addEventListener('click', () => {
    const keys = Object.keys(rows[0] || {});
    const csv = [keys.join(','), ...rows.map(r => keys.map(k => `"${String(r[k]).replace(/"/g, '""')}"`).join(','))].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'campaign_performance.csv';
    a.click();
  });
})();
