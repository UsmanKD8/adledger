-- =====================================================================
-- AdLedger – 03_views.sql
-- Reporting views. All attribution maths happens here, not in the app.
-- Each aggregate is computed in its own derived table so that joining
-- spend, leads and sales never multiplies rows (no fan-out).
-- =====================================================================
USE adledger_db;

-- ---------------------------------------------------------------------
-- Campaign-to-Revenue attribution: Spend -> Leads -> Customers -> Revenue
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_campaign_performance AS
SELECT
    c.campaign_id,
    c.campaign_name,
    c.client_id,
    cl.company_name,
    c.platform,
    c.status,
    c.budget,
    COALESCE(sp.total_spend, 0)                                         AS total_spend,
    COALESCE(sp.total_impressions, 0)                                   AS total_impressions,
    COALESCE(sp.total_clicks, 0)                                        AS total_clicks,
    COALESCE(ld.total_leads, 0)                                         AS total_leads,
    COALESCE(sl.total_customers, 0)                                     AS total_customers,
    COALESCE(sl.total_revenue, 0)                                       AS total_revenue,
    ROUND(COALESCE(sp.total_spend, 0) / NULLIF(ld.total_leads, 0), 2)     AS cost_per_lead,
    ROUND(COALESCE(sp.total_spend, 0) / NULLIF(sl.total_customers, 0), 2) AS cost_per_customer,
    ROUND(COALESCE(sl.total_customers, 0) * 100 / NULLIF(ld.total_leads, 0), 2) AS conversion_rate,
    ROUND(COALESCE(sl.total_revenue, 0) / NULLIF(sp.total_spend, 0), 2)   AS roas
FROM campaign c
JOIN client cl ON cl.client_id = c.client_id
LEFT JOIN (
    SELECT campaign_id,
           SUM(amount)      AS total_spend,
           SUM(impressions) AS total_impressions,
           SUM(clicks)      AS total_clicks
      FROM ad_spend
     GROUP BY campaign_id
) sp ON sp.campaign_id = c.campaign_id
LEFT JOIN (
    SELECT campaign_id, COUNT(*) AS total_leads
      FROM `lead`
     GROUP BY campaign_id
) ld ON ld.campaign_id = c.campaign_id
LEFT JOIN (
    SELECT l.campaign_id,
           COUNT(DISTINCT s.lead_id) AS total_customers,
           SUM(s.sale_amount)        AS total_revenue
      FROM sale s
      JOIN `lead` l ON l.lead_id = s.lead_id
     GROUP BY l.campaign_id
) sl ON sl.campaign_id = c.campaign_id;

-- ---------------------------------------------------------------------
-- Invoices with amount paid and remaining balance
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_invoice_balance AS
SELECT
    i.invoice_id,
    i.client_id,
    cl.company_name,
    i.issue_date,
    i.due_date,
    i.total_amount,
    COALESCE(p.amount_paid, 0)                  AS amount_paid,
    i.total_amount - COALESCE(p.amount_paid, 0) AS balance,
    i.status,
    GREATEST(DATEDIFF(CURDATE(), i.due_date), 0) AS days_past_due
FROM invoice i
JOIN client cl ON cl.client_id = i.client_id
LEFT JOIN (
    SELECT invoice_id, SUM(amount) AS amount_paid
      FROM payment
     GROUP BY invoice_id
) p ON p.invoice_id = i.invoice_id;

-- Only invoices that still have money owed
CREATE OR REPLACE VIEW vw_outstanding_invoices AS
SELECT * FROM vw_invoice_balance WHERE balance > 0;

-- ---------------------------------------------------------------------
-- Per-client roll-up: campaigns, spend, revenue and money owed
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_client_summary AS
SELECT
    cl.client_id,
    cl.company_name,
    cl.status,
    COUNT(cp.campaign_id)               AS total_campaigns,
    COALESCE(SUM(cp.total_spend), 0)    AS total_spend,
    COALESCE(SUM(cp.total_leads), 0)    AS total_leads,
    COALESCE(SUM(cp.total_revenue), 0)  AS total_revenue,
    (SELECT COALESCE(SUM(b.balance), 0)
       FROM vw_invoice_balance b
      WHERE b.client_id = cl.client_id) AS outstanding
FROM client cl
LEFT JOIN vw_campaign_performance cp ON cp.client_id = cl.client_id
GROUP BY cl.client_id, cl.company_name, cl.status;

-- ---------------------------------------------------------------------
-- Lead pipeline counts (dashboard chart)
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_leads_by_status AS
SELECT status, COUNT(*) AS count
  FROM `lead`
 GROUP BY status;

-- ---------------------------------------------------------------------
-- Single-row KPI summary for the dashboard
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_dashboard_summary AS
SELECT
    (SELECT COUNT(*) FROM client   WHERE status = 'Active')       AS active_clients,
    (SELECT COUNT(*) FROM campaign WHERE status = 'Active')       AS active_campaigns,
    (SELECT COALESCE(SUM(amount), 0) FROM ad_spend)               AS total_spend,
    (SELECT COUNT(*) FROM `lead`)                                 AS total_leads,
    (SELECT COUNT(DISTINCT lead_id) FROM sale)                    AS total_customers,
    (SELECT COALESCE(SUM(sale_amount), 0) FROM sale)              AS total_revenue,
    (SELECT COALESCE(SUM(balance), 0) FROM vw_invoice_balance)    AS outstanding,
    (SELECT COUNT(*) FROM deliverable WHERE status <> 'Done')     AS pending_deliverables;
