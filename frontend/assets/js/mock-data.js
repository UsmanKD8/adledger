// Sample data that mirrors the adledger_db tables.
// Used only while CONFIG.USE_MOCK is true.
const MOCK = {
  users: [
    { user_id: 1, full_name: 'Admin User', email: 'admin@adledger.test', role: 'Admin' },
    { user_id: 2, full_name: 'Account Manager', email: 'manager@adledger.test', role: 'Manager' },
    { user_id: 3, full_name: 'Sales Rep', email: 'sales@adledger.test', role: 'Sales' },
  ],
  clients: [
    { client_id: 1, company_name: 'Bloom Cosmetics', contact_person: 'Sara Khan', email: 'sara@bloom.test', phone: '0300-1111111', industry: 'Beauty', status: 'Active' },
    { client_id: 2, company_name: 'UrbanFit Gym', contact_person: 'Ali Raza', email: 'ali@urbanfit.test', phone: '0301-2222222', industry: 'Fitness', status: 'Active' },
    { client_id: 3, company_name: 'TechNest Store', contact_person: 'Hina Malik', email: 'hina@technest.test', phone: '0302-3333333', industry: 'Electronics', status: 'Active' },
    { client_id: 4, company_name: 'Spice Route Cafe', contact_person: 'Omar Shah', email: 'omar@spice.test', phone: '0303-4444444', industry: 'Food', status: 'Inactive' },
  ],
  campaigns: [
    { campaign_id: 1, client_id: 1, campaign_name: 'Summer Glow Launch', platform: 'Meta', objective: 'Leads', start_date: '2026-06-01', end_date: '2026-06-30', budget: 150000, status: 'Completed' },
    { campaign_id: 2, client_id: 2, campaign_name: 'New Year Membership', platform: 'Google', objective: 'Conversions', start_date: '2026-07-01', end_date: '2026-08-15', budget: 200000, status: 'Active' },
    { campaign_id: 3, client_id: 3, campaign_name: 'Gadget Week', platform: 'TikTok', objective: 'Sales', start_date: '2026-08-01', end_date: '2026-08-10', budget: 120000, status: 'Completed' },
    { campaign_id: 4, client_id: 1, campaign_name: 'Retargeting Q3', platform: 'Meta', objective: 'Conversions', start_date: '2026-09-01', end_date: '2026-10-31', budget: 80000, status: 'Active' },
    { campaign_id: 5, client_id: 4, campaign_name: 'Lunch Deals', platform: 'Instagram', objective: 'Awareness', start_date: '2026-10-01', end_date: '2026-11-30', budget: 50000, status: 'Paused' },
  ],
  ad_spend: [
    { spend_id: 1, campaign_id: 1, spend_date: '2026-06-05', amount: 40000, impressions: 120000, clicks: 3100 },
    { spend_id: 2, campaign_id: 1, spend_date: '2026-06-20', amount: 55000, impressions: 160000, clicks: 4200 },
    { spend_id: 3, campaign_id: 2, spend_date: '2026-07-10', amount: 70000, impressions: 90000, clicks: 2800 },
    { spend_id: 4, campaign_id: 2, spend_date: '2026-08-01', amount: 60000, impressions: 85000, clicks: 2500 },
    { spend_id: 5, campaign_id: 3, spend_date: '2026-08-05', amount: 95000, impressions: 300000, clicks: 7600 },
    { spend_id: 6, campaign_id: 4, spend_date: '2026-09-15', amount: 30000, impressions: 45000, clicks: 1300 },
    { spend_id: 7, campaign_id: 5, spend_date: '2026-10-05', amount: 12000, impressions: 60000, clicks: 900 },
  ],
  leads: [
    { lead_id: 1, campaign_id: 1, lead_name: 'Ayesha Noor', email: 'ayesha@mail.test', phone: '0311-0000001', source: 'Facebook Form', lead_date: '2026-06-06', status: 'Converted' },
    { lead_id: 2, campaign_id: 1, lead_name: 'Zara Ahmed', email: 'zara@mail.test', phone: '0311-0000002', source: 'Facebook Form', lead_date: '2026-06-08', status: 'Contacted' },
    { lead_id: 3, campaign_id: 1, lead_name: 'Maha Iqbal', email: 'maha@mail.test', phone: '0311-0000003', source: 'Website', lead_date: '2026-06-21', status: 'Converted' },
    { lead_id: 4, campaign_id: 2, lead_name: 'Bilal Hussain', email: 'bilal@mail.test', phone: '0311-0000004', source: 'Google Ads', lead_date: '2026-07-12', status: 'Converted' },
    { lead_id: 5, campaign_id: 2, lead_name: 'Usman Tariq', email: 'usman@mail.test', phone: '0311-0000005', source: 'Google Ads', lead_date: '2026-07-14', status: 'Lost' },
    { lead_id: 6, campaign_id: 2, lead_name: 'Hamza Ali', email: 'hamza@mail.test', phone: '0311-0000006', source: 'Landing Page', lead_date: '2026-08-02', status: 'New' },
    { lead_id: 7, campaign_id: 3, lead_name: 'Fatima Zahid', email: 'fatima@mail.test', phone: '0311-0000007', source: 'TikTok', lead_date: '2026-08-06', status: 'Converted' },
    { lead_id: 8, campaign_id: 3, lead_name: 'Saad Javed', email: 'saad@mail.test', phone: '0311-0000008', source: 'TikTok', lead_date: '2026-08-07', status: 'Converted' },
    { lead_id: 9, campaign_id: 3, lead_name: 'Noor Fatima', email: 'noor@mail.test', phone: '0311-0000009', source: 'Website', lead_date: '2026-08-08', status: 'Contacted' },
    { lead_id: 10, campaign_id: 4, lead_name: 'Kamran Butt', email: 'kamran@mail.test', phone: '0311-0000010', source: 'Facebook Form', lead_date: '2026-09-16', status: 'New' },
    { lead_id: 11, campaign_id: 5, lead_name: 'Rabia Saleem', email: 'rabia@mail.test', phone: '0311-0000011', source: 'Instagram', lead_date: '2026-10-06', status: 'New' },
  ],
  followups: [
    { followup_id: 1, lead_id: 2, user_id: 3, followup_date: '2026-06-10', method: 'Call', notes: 'Interested, wants discount', outcome: 'Pending' },
    { followup_id: 2, lead_id: 5, user_id: 3, followup_date: '2026-07-16', method: 'WhatsApp', notes: 'Chose another gym', outcome: 'Negative' },
    { followup_id: 3, lead_id: 6, user_id: 2, followup_date: '2026-08-04', method: 'Email', notes: 'Sent pricing PDF', outcome: 'Pending' },
    { followup_id: 4, lead_id: 9, user_id: 3, followup_date: '2026-08-10', method: 'Call', notes: 'Will buy next month', outcome: 'Positive' },
  ],
  sales: [
    { sale_id: 1, lead_id: 1, sale_date: '2026-06-09', sale_amount: 45000, product_service: 'Skincare Bundle' },
    { sale_id: 2, lead_id: 3, sale_date: '2026-06-25', sale_amount: 38000, product_service: 'Makeup Kit' },
    { sale_id: 3, lead_id: 4, sale_date: '2026-07-15', sale_amount: 60000, product_service: 'Annual Membership' },
    { sale_id: 4, lead_id: 7, sale_date: '2026-08-07', sale_amount: 120000, product_service: 'Laptop' },
    { sale_id: 5, lead_id: 8, sale_date: '2026-08-09', sale_amount: 85000, product_service: 'Smartphone' },
  ],
  invoices: [
    { invoice_id: 1, client_id: 1, issue_date: '2026-07-01', due_date: '2026-07-15', total_amount: 50000, status: 'Paid' },
    { invoice_id: 2, client_id: 2, issue_date: '2026-08-01', due_date: '2026-08-15', total_amount: 70000, status: 'Partial' },
    { invoice_id: 3, client_id: 3, issue_date: '2026-08-15', due_date: '2026-12-30', total_amount: 40000, status: 'Unpaid' },
    { invoice_id: 4, client_id: 1, issue_date: '2026-10-01', due_date: '2026-10-15', total_amount: 30000, status: 'Overdue' },
  ],
  payments: [
    { payment_id: 1, invoice_id: 1, payment_date: '2026-07-10', amount: 50000, payment_method: 'Bank Transfer' },
    { payment_id: 2, invoice_id: 2, payment_date: '2026-08-12', amount: 30000, payment_method: 'Cheque' },
  ],
  deliverables: [
    { deliverable_id: 1, campaign_id: 1, user_id: 2, title: 'Ad creatives (5 posts)', due_date: '2026-05-28', status: 'Done' },
    { deliverable_id: 2, campaign_id: 2, user_id: 2, title: 'Landing page copy', due_date: '2026-06-28', status: 'Done' },
    { deliverable_id: 3, campaign_id: 4, user_id: 1, title: 'Retargeting audience setup', due_date: '2026-08-30', status: 'In Progress' },
    { deliverable_id: 4, campaign_id: 5, user_id: 2, title: 'Reel video (30s)', due_date: '2026-10-25', status: 'Pending' },
  ],
};
