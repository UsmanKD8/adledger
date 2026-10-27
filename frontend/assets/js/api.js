// Single place where the frontend talks to the backend.
// Every resource name matches a Flask route:  GET/POST /api/<resource>,
// PUT/DELETE /api/<resource>/<id>,  GET /api/reports/<name>.
const ID_KEYS = {
  users: 'user_id', clients: 'client_id', campaigns: 'campaign_id', ad_spend: 'spend_id',
  leads: 'lead_id', followups: 'followup_id', sales: 'sale_id', invoices: 'invoice_id',
  payments: 'payment_id', deliverables: 'deliverable_id',
};

const API = {
  async request(path, method = 'GET', body) {
    const res = await fetch(CONFIG.API_BASE + path, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && !path.startsWith('/auth/')) {
      Session.clear();
      window.location.href = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
    }
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  },

  list(resource) {
    if (CONFIG.USE_MOCK) return Promise.resolve([...MOCK[resource]]);
    return this.request(`/${resource}`);
  },

  create(resource, record) {
    if (CONFIG.USE_MOCK) return Promise.resolve(Mock.create(resource, record));
    return this.request(`/${resource}`, 'POST', record);
  },

  update(resource, id, record) {
    if (CONFIG.USE_MOCK) return Promise.resolve(Mock.update(resource, id, record));
    return this.request(`/${resource}/${id}`, 'PUT', record);
  },

  remove(resource, id) {
    if (CONFIG.USE_MOCK) return Promise.resolve(Mock.remove(resource, id));
    return this.request(`/${resource}/${id}`, 'DELETE');
  },

  // name: 'campaign-performance' | 'dashboard'
  report(name) {
    if (CONFIG.USE_MOCK) return Promise.resolve(Mock.report(name));
    return this.request(`/reports/${name}`);
  },

  login(email, password) {
    if (CONFIG.USE_MOCK) {
      const user = MOCK.users.find(u => u.email === email) || MOCK.users[0];
      return Promise.resolve({ user });
    }
    return this.request('/auth/login', 'POST', { email, password });
  },

  logout() {
    if (CONFIG.USE_MOCK) return Promise.resolve({ ok: true });
    return this.request('/auth/logout', 'POST').catch(() => ({}));
  },
};

// In-memory stand-in for the database, including the behaviour that the
// real DB gets from triggers and views.
const Mock = {
  create(resource, record) {
    const key = ID_KEYS[resource];
    const id = Math.max(0, ...MOCK[resource].map(r => r[key])) + 1;
    const row = { ...record, [key]: id };
    MOCK[resource].push(row);
    if (resource === 'payments') this.syncInvoiceStatus(row.invoice_id);
    return row;
  },

  update(resource, id, record) {
    const key = ID_KEYS[resource];
    const row = MOCK[resource].find(r => r[key] == id);
    Object.assign(row, record);
    if (resource === 'payments') this.syncInvoiceStatus(row.invoice_id);
    return row;
  },

  remove(resource, id) {
    const key = ID_KEYS[resource];
    MOCK[resource] = MOCK[resource].filter(r => r[key] != id);
    return { ok: true };
  },

  // Mirrors the "invoice -> Paid" trigger.
  syncInvoiceStatus(invoiceId) {
    const inv = MOCK.invoices.find(i => i.invoice_id == invoiceId);
    if (!inv) return;
    const paid = MOCK.payments.filter(p => p.invoice_id == invoiceId).reduce((s, p) => s + Number(p.amount), 0);
    inv.status = paid >= inv.total_amount ? 'Paid' : paid > 0 ? 'Partial' : inv.status;
  },

  // Mirrors the vw_campaign_performance view.
  campaignPerformance() {
    return MOCK.campaigns.map(c => {
      const client = MOCK.clients.find(cl => cl.client_id == c.client_id);
      const spend = MOCK.ad_spend.filter(s => s.campaign_id == c.campaign_id).reduce((s, r) => s + Number(r.amount), 0);
      const leads = MOCK.leads.filter(l => l.campaign_id == c.campaign_id);
      const sales = MOCK.sales.filter(s => leads.some(l => l.lead_id == s.lead_id));
      const revenue = sales.reduce((s, r) => s + Number(r.sale_amount), 0);
      const customers = new Set(sales.map(s => s.lead_id)).size;
      return {
        campaign_id: c.campaign_id,
        campaign_name: c.campaign_name,
        company_name: client ? client.company_name : '-',
        platform: c.platform,
        total_spend: spend,
        total_leads: leads.length,
        total_customers: customers,
        total_revenue: revenue,
        cost_per_lead: leads.length ? spend / leads.length : 0,
        cost_per_customer: customers ? spend / customers : 0,
        conversion_rate: leads.length ? (customers / leads.length) * 100 : 0,
        roas: spend ? revenue / spend : 0,
      };
    });
  },

  report(name) {
    const perf = this.campaignPerformance();
    if (name === 'campaign-performance') return perf;
    if (name === 'dashboard') {
      const sum = (arr, k) => arr.reduce((s, r) => s + Number(r[k]), 0);
      const invoiced = sum(MOCK.invoices, 'total_amount');
      const received = sum(MOCK.payments, 'amount');
      return {
        active_clients: MOCK.clients.filter(c => c.status === 'Active').length,
        active_campaigns: MOCK.campaigns.filter(c => c.status === 'Active').length,
        total_spend: sum(perf, 'total_spend'),
        total_leads: sum(perf, 'total_leads'),
        total_customers: sum(perf, 'total_customers'),
        total_revenue: sum(perf, 'total_revenue'),
        outstanding: invoiced - received,
        pending_deliverables: MOCK.deliverables.filter(d => d.status !== 'Done').length,
        top_campaigns: [...perf].sort((a, b) => b.total_revenue - a.total_revenue).slice(0, 5),
        leads_by_status: ['New', 'Contacted', 'Converted', 'Lost'].map(s => ({
          status: s, count: MOCK.leads.filter(l => l.status === s).length,
        })),
      };
    }
    return {};
  },
};
