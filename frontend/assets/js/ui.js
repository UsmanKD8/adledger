// Shared UI helpers: formatting, modal, toast and the generic CRUD page.

// How a foreign-key row is shown in tables and dropdowns.
const REF_LABEL = {
  users: r => r.full_name,
  clients: r => r.company_name,
  campaigns: r => r.campaign_name,
  leads: r => r.lead_name,
  invoices: r => `INV-${String(r.invoice_id).padStart(4, '0')}`,
};

const UI = {
  esc(v) {
    return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  },
  money(v) {
    return `${CONFIG.CURRENCY} ${Number(v || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
  },
  num(v, digits = 0) {
    return Number(v || 0).toLocaleString('en-PK', { maximumFractionDigits: digits });
  },
  badge(v) {
    return `<span class="badge badge-${String(v).toLowerCase().replace(/\s+/g, '-')}">${UI.esc(v)}</span>`;
  },

  toast(msg, type = 'ok') {
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2600);
  },

  openModal(title, bodyHtml, onSubmit) {
    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.innerHTML = `
      <form class="modal">
        <div class="modal-head"><h2>${UI.esc(title)}</h2><button type="button" class="icon-btn" data-close>&times;</button></div>
        <div class="modal-body">${bodyHtml}</div>
        <div class="modal-foot">
          <button type="button" class="btn" data-close>Cancel</button>
          <button type="submit" class="btn btn-primary">Save</button>
        </div>
      </form>`;
    const close = () => wrap.remove();
    wrap.addEventListener('click', e => { if (e.target === wrap || e.target.hasAttribute('data-close')) close(); });
    wrap.querySelector('form').addEventListener('submit', async e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target).entries());
      try { await onSubmit(data); close(); } catch (err) { UI.toast(err.message, 'err'); }
    });
    document.body.appendChild(wrap);
    wrap.querySelector('input, select, textarea')?.focus();
  },

  fieldInput(f, value, refs) {
    const v = value ?? f.default ?? '';
    const req = f.required ? 'required' : '';
    let input;
    if (f.ref) {
      input = `<select name="${f.key}" ${req}><option value="">Select…</option>${refs[f.ref]
        .map(r => `<option value="${r[ID_KEYS[f.ref]]}" ${r[ID_KEYS[f.ref]] == v ? 'selected' : ''}>${UI.esc(REF_LABEL[f.ref](r))}</option>`).join('')}</select>`;
    } else if (f.options) {
      input = `<select name="${f.key}" ${req}>${f.options.map(o => `<option ${o == v ? 'selected' : ''}>${UI.esc(o)}</option>`).join('')}</select>`;
    } else if (f.type === 'textarea') {
      input = `<textarea name="${f.key}" rows="3" ${req}>${UI.esc(v)}</textarea>`;
    } else {
      const extra = f.type === 'number' ? 'min="0" step="any"' : '';
      input = `<input name="${f.key}" type="${f.type || 'text'}" value="${UI.esc(v)}" ${extra} ${req}>`;
    }
    return `<label class="field ${f.type === 'textarea' ? 'field-wide' : ''}"><span>${UI.esc(f.label)}${f.required ? ' *' : ''}</span>${input}</label>`;
  },

  cellValue(f, row, refs) {
    const v = row[f.key];
    if (f.ref) {
      const r = refs[f.ref].find(x => x[ID_KEYS[f.ref]] == v);
      return r ? UI.esc(REF_LABEL[f.ref](r)) : '-';
    }
    if (f.money) return UI.money(v);
    if (f.type === 'number') return UI.num(v);
    if (f.badge) return UI.badge(v);
    return UI.esc(v);
  },

  /**
   * Builds a full list/add/edit/delete page from a config object:
   * { resource, title, singular, fields: [{ key, label, type, required, ref, options, money, badge, table }] }
   */
  async crudPage(cfg) {
    const idKey = ID_KEYS[cfg.resource];
    const content = document.getElementById('content');
    content.innerHTML = `
      <div class="page-head">
        <div><h1>${cfg.title}</h1><p class="muted">${cfg.subtitle || ''}</p></div>
        <div class="page-actions">
          <input type="search" class="search" placeholder="Search…">
          <button class="btn btn-primary" id="addBtn">+ Add ${cfg.singular}</button>
        </div>
      </div>
      <div class="card table-wrap"><table class="table"><thead></thead><tbody></tbody></table></div>`;

    const refs = {};
    for (const f of cfg.fields) if (f.ref && !refs[f.ref]) refs[f.ref] = await API.list(f.ref);

    const cols = cfg.fields.filter(f => f.table !== false);
    const tbody = content.querySelector('tbody');
    const search = content.querySelector('.search');
    content.querySelector('thead').innerHTML =
      `<tr><th>#</th>${cols.map(c => `<th>${c.label}</th>`).join('')}<th></th></tr>`;

    let rows = [];
    const render = () => {
      const q = search.value.toLowerCase();
      const shown = rows.filter(r => !q || cols.some(c => UI.cellValue(c, r, refs).toLowerCase().includes(q)));
      tbody.innerHTML = shown.length
        ? shown.map(r => `
          <tr>
            <td class="muted">${r[idKey]}</td>
            ${cols.map(c => `<td>${UI.cellValue(c, r, refs)}</td>`).join('')}
            <td class="row-actions">
              <button class="btn btn-sm" data-edit="${r[idKey]}">Edit</button>
              <button class="btn btn-sm btn-danger" data-del="${r[idKey]}">Delete</button>
            </td>
          </tr>`).join('')
        : `<tr><td colspan="${cols.length + 2}" class="empty">No records found</td></tr>`;
    };
    const load = async () => { rows = await API.list(cfg.resource); render(); };

    const openForm = row => {
      const body = `<div class="form-grid">${cfg.fields.map(f => UI.fieldInput(f, row?.[f.key], refs)).join('')}</div>`;
      UI.openModal(`${row ? 'Edit' : 'Add'} ${cfg.singular}`, body, async data => {
        if (row) await API.update(cfg.resource, row[idKey], data);
        else await API.create(cfg.resource, data);
        UI.toast(`${cfg.singular} saved`);
        await load();
      });
    };

    search.addEventListener('input', render);
    content.querySelector('#addBtn').addEventListener('click', () => openForm(null));
    tbody.addEventListener('click', async e => {
      const editId = e.target.dataset.edit;
      const delId = e.target.dataset.del;
      if (editId) openForm(rows.find(r => r[idKey] == editId));
      if (delId && confirm(`Delete this ${cfg.singular.toLowerCase()}?`)) {
        try { await API.remove(cfg.resource, delId); UI.toast(`${cfg.singular} deleted`); await load(); }
        catch (err) { UI.toast(err.message, 'err'); }
      }
    });

    await load();
  },
};
