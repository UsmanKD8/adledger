# Branch: Rayyan

**Rayyan Asif (25SP-004-AI)** · Database Lead – MySQL

## Tasks

**Already done**
- [x] `01_schema.sql` – 11 tables with PK, FK, NOT NULL, UNIQUE, CHECK, DEFAULT, indexes
- [x] `02_triggers.sql` – invoice auto-status, overpayment block, lead status log, sale → Converted
- [x] `03_views.sql` – campaign performance (CPL, CPC, conversion rate, ROAS), dashboard, invoices
- [x] `04_seed.sql` – sample data
- [x] Free MySQL database created on Aiven

**To do**
- [ ] ER diagram of all entities with cardinality (draw.io / MySQL Workbench) → `database/erd.png`
- [ ] Normalization write-up: show 1NF → 2NF → 3NF for the report
- [ ] `05_queries.sql` – complex queries for the report: multi-table JOINs, subqueries, GROUP BY / HAVING
- [ ] `06_transactions.sql` – START TRANSACTION … COMMIT / ROLLBACK demo (payment + invoice)
- [ ] Run `EXPLAIN` on the report queries and justify the indexes
- [ ] Add more realistic seed data (more campaigns, leads and payments)
- [ ] Verify every trigger and view on the online (Aiven) database

### How to work on this branch

```bash
git clone https://github.com/UsmanKD8/adledger.git
cd adledger
git checkout Rayyan
# ...make changes...
git add .
git commit -m "Describe what you did"
git push
```

When a task is finished, open a Pull Request from `Rayyan` into `main` on GitHub
so the others can review it. Pull `main` into your branch regularly
(`git pull origin main`) to stay up to date.

---

# AdLedger – Campaign-to-Revenue Intelligence Platform

CSC204 Database Systems project. MySQL + Python Flask + HTML/CSS/JS.

```
DB PROJECT FOLDER/
├── database/     MySQL scripts (run in order 01 → 04)
├── backend/      Flask REST API (also serves the frontend)
├── frontend/     HTML / CSS / JavaScript UI
└── AdLedger_Work_Distribution.docx
```

## Quick start (this computer)

Everything is already installed and the database is loaded.

1. Double-click `start-mysql.bat` (keep the window open).
2. Double-click `start-backend.bat`.
3. Open **http://localhost:5000** and log in with `admin@adledger.test` / `password123`.

Local setup details: MySQL 8.4 is in `C:\Program Files\MySQL\MySQL Server 8.4`, data in
`%LOCALAPPDATA%\MySQL\adledger`. `root` has no password and only accepts local connections;
the backend uses its own user `adledger_app` (password in `backend/.env`, not committed).

## 1. Database (MySQL 8)

Run the four scripts in order:

| File | What it does |
|---|---|
| `01_schema.sql` | Creates `adledger_db`, 11 tables, PK/FK, NOT NULL, UNIQUE, CHECK, DEFAULT, indexes |
| `02_triggers.sql` | Invoice auto-status (Paid / Partial / Overdue), overpayment block, lead status log, sale → lead Converted |
| `03_views.sql` | `vw_campaign_performance`, `vw_dashboard_summary`, `vw_invoice_balance`, `vw_outstanding_invoices`, `vw_client_summary`, `vw_leads_by_status` |
| `04_seed.sql` | Sample data (same as the frontend demo data) |

From a terminal (or open each file in MySQL Workbench and run it):

```bash
cd database
mysql -u root -p < 01_schema.sql
mysql -u root -p < 02_triggers.sql
mysql -u root -p < 03_views.sql
mysql -u root -p < 04_seed.sql
```

Seeded test logins (all use password `password123`):
`admin@adledger.test` (Admin), `manager@adledger.test` (Manager), `sales@adledger.test` (Sales).

## 2. Backend (Flask)

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env      # then put your MySQL user/password in .env
python app.py
```

API runs at `http://localhost:5000/api`, and the full app opens at **http://localhost:5000**.

| Endpoint | Methods |
|---|---|
| `/api/auth/login`, `/api/auth/logout`, `/api/auth/me` | POST, POST, GET |
| `/api/<resource>` | GET, POST |
| `/api/<resource>/<id>` | GET, PUT, DELETE |
| `/api/reports/dashboard`, `/campaign-performance`, `/outstanding-invoices`, `/client-summary` | GET |

`<resource>` = `users, clients, campaigns, ad_spend, leads, followups, sales, invoices, payments, deliverables`.

Rules: every route needs login; only Admin can manage users; only Admin/Manager can delete.
Recording a payment runs as an explicit transaction (`START TRANSACTION … COMMIT/ROLLBACK`).

## 3. Frontend

`frontend/assets/js/config.js`:

- `USE_MOCK: true` – runs on built-in sample data, no backend needed (open `frontend/index.html`).
- `USE_MOCK: false` – uses the Flask API. Open **http://localhost:5000** (always `localhost`, not `127.0.0.1`, so the login cookie works).
