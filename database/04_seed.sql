-- =====================================================================
-- AdLedger – 04_seed.sql
-- Sample data (same records as frontend/assets/js/mock-data.js).
-- Run after 01, 02 and 03. Triggers fire while this loads, so invoice
-- statuses are calculated from the payments below.
--
-- Test login for every seeded user:  password = password123
-- =====================================================================
USE adledger_db;

INSERT INTO agency_user (user_id, full_name, email, password_hash, role) VALUES
(1, 'Admin User',      'admin@adledger.test',   'pbkdf2:sha256:600000$34ea3908a976716b$879d92f6aa985afb5631d0044defb2bb49b17653155987b2c4ce727b7a5deb36', 'Admin'),
(2, 'Account Manager', 'manager@adledger.test', 'pbkdf2:sha256:600000$34ea3908a976716b$879d92f6aa985afb5631d0044defb2bb49b17653155987b2c4ce727b7a5deb36', 'Manager'),
(3, 'Sales Rep',       'sales@adledger.test',   'pbkdf2:sha256:600000$34ea3908a976716b$879d92f6aa985afb5631d0044defb2bb49b17653155987b2c4ce727b7a5deb36', 'Sales');

INSERT INTO client (client_id, company_name, contact_person, email, phone, industry, status) VALUES
(1, 'Bloom Cosmetics',  'Sara Khan',  'sara@bloom.test',    '0300-1111111', 'Beauty',      'Active'),
(2, 'UrbanFit Gym',     'Ali Raza',   'ali@urbanfit.test',  '0301-2222222', 'Fitness',     'Active'),
(3, 'TechNest Store',   'Hina Malik', 'hina@technest.test', '0302-3333333', 'Electronics', 'Active'),
(4, 'Spice Route Cafe', 'Omar Shah',  'omar@spice.test',    '0303-4444444', 'Food',        'Inactive');

INSERT INTO campaign (campaign_id, client_id, campaign_name, platform, objective, start_date, end_date, budget, status) VALUES
(1, 1, 'Summer Glow Launch',  'Meta',      'Leads',       '2026-06-01', '2026-06-30', 150000, 'Completed'),
(2, 2, 'New Year Membership', 'Google',    'Conversions', '2026-07-01', '2026-08-15', 200000, 'Active'),
(3, 3, 'Gadget Week',         'TikTok',    'Sales',       '2026-08-01', '2026-08-10', 120000, 'Completed'),
(4, 1, 'Retargeting Q3',      'Meta',      'Conversions', '2026-09-01', '2026-10-31',  80000, 'Active'),
(5, 4, 'Lunch Deals',         'Instagram', 'Awareness',   '2026-10-01', '2026-11-30',  50000, 'Paused');

INSERT INTO ad_spend (campaign_id, spend_date, amount, impressions, clicks) VALUES
(1, '2026-06-05', 40000, 120000, 3100),
(1, '2026-06-20', 55000, 160000, 4200),
(2, '2026-07-10', 70000,  90000, 2800),
(2, '2026-08-01', 60000,  85000, 2500),
(3, '2026-08-05', 95000, 300000, 7600),
(4, '2026-09-15', 30000,  45000, 1300),
(5, '2026-10-05', 12000,  60000,  900);

-- Leads that later get a sale start as 'Contacted'; the sale trigger
-- converts them, which also writes rows into lead_status_log.
INSERT INTO `lead` (lead_id, campaign_id, lead_name, email, phone, source, lead_date, status) VALUES
(1,  1, 'Ayesha Noor',   'ayesha@mail.test', '0311-0000001', 'Facebook Form', '2026-06-06', 'Contacted'),
(2,  1, 'Zara Ahmed',    'zara@mail.test',   '0311-0000002', 'Facebook Form', '2026-06-08', 'Contacted'),
(3,  1, 'Maha Iqbal',    'maha@mail.test',   '0311-0000003', 'Website',       '2026-06-21', 'Contacted'),
(4,  2, 'Bilal Hussain', 'bilal@mail.test',  '0311-0000004', 'Google Ads',    '2026-07-12', 'Contacted'),
(5,  2, 'Usman Tariq',   'usman@mail.test',  '0311-0000005', 'Google Ads',    '2026-07-14', 'Lost'),
(6,  2, 'Hamza Ali',     'hamza@mail.test',  '0311-0000006', 'Landing Page',  '2026-08-02', 'New'),
(7,  3, 'Fatima Zahid',  'fatima@mail.test', '0311-0000007', 'TikTok',        '2026-08-06', 'Contacted'),
(8,  3, 'Saad Javed',    'saad@mail.test',   '0311-0000008', 'TikTok',        '2026-08-07', 'Contacted'),
(9,  3, 'Noor Fatima',   'noor@mail.test',   '0311-0000009', 'Website',       '2026-08-08', 'Contacted'),
(10, 4, 'Kamran Butt',   'kamran@mail.test', '0311-0000010', 'Facebook Form', '2026-09-16', 'New'),
(11, 5, 'Rabia Saleem',  'rabia@mail.test',  '0311-0000011', 'Instagram',     '2026-10-06', 'New');

INSERT INTO lead_followup (lead_id, user_id, followup_date, method, notes, outcome) VALUES
(2, 3, '2026-06-10', 'Call',     'Interested, wants discount', 'Pending'),
(5, 3, '2026-07-16', 'WhatsApp', 'Chose another gym',          'Negative'),
(6, 2, '2026-08-04', 'Email',    'Sent pricing PDF',           'Pending'),
(9, 3, '2026-08-10', 'Call',     'Will buy next month',        'Positive');

INSERT INTO sale (lead_id, sale_date, sale_amount, product_service) VALUES
(1, '2026-06-09',  45000, 'Skincare Bundle'),
(3, '2026-06-25',  38000, 'Makeup Kit'),
(4, '2026-07-15',  60000, 'Annual Membership'),
(7, '2026-08-07', 120000, 'Laptop'),
(8, '2026-08-09',  85000, 'Smartphone');

-- Invoices start as Unpaid; the payment triggers set Paid / Partial and
-- the refresh below marks unpaid invoices past their due date Overdue.
INSERT INTO invoice (invoice_id, client_id, issue_date, due_date, total_amount) VALUES
(1, 1, '2026-07-01', '2026-07-15', 50000),
(2, 2, '2026-08-01', '2026-08-15', 70000),
(3, 3, '2026-08-15', '2026-12-30', 40000),
(4, 1, '2026-10-01', '2026-10-15', 30000);

INSERT INTO payment (invoice_id, payment_date, amount, payment_method) VALUES
(1, '2026-07-10', 50000, 'Bank Transfer'),
(2, '2026-08-12', 30000, 'Cheque');

CALL sp_refresh_invoice_status(3);
CALL sp_refresh_invoice_status(4);

INSERT INTO deliverable (campaign_id, user_id, title, due_date, status) VALUES
(1, 2, 'Ad creatives (5 posts)',     '2026-05-28', 'Done'),
(2, 2, 'Landing page copy',          '2026-06-28', 'Done'),
(4, 1, 'Retargeting audience setup', '2026-08-30', 'In Progress'),
(5, 2, 'Reel video (30s)',           '2026-10-25', 'Pending');
