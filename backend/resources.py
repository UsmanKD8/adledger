"""
Maps each API resource name (used by frontend/assets/js/api.js) to its
MySQL table, primary key and the columns the API may write.
"""

RESOURCES = {
    "users": {
        "table": "agency_user",
        "pk": "user_id",
        "columns": ["full_name", "email", "role"],
        "select": "user_id, full_name, email, role, created_at",  # never expose password_hash
        "write_roles": ["Admin"],
    },
    "clients": {
        "table": "client",
        "pk": "client_id",
        "columns": ["company_name", "contact_person", "email", "phone", "industry", "status"],
    },
    "campaigns": {
        "table": "campaign",
        "pk": "campaign_id",
        "columns": ["client_id", "campaign_name", "platform", "objective",
                    "start_date", "end_date", "budget", "status"],
    },
    "ad_spend": {
        "table": "ad_spend",
        "pk": "spend_id",
        "columns": ["campaign_id", "spend_date", "amount", "impressions", "clicks"],
    },
    "leads": {
        "table": "`lead`",  # LEAD is a reserved word in MySQL 8
        "pk": "lead_id",
        "columns": ["campaign_id", "lead_name", "email", "phone", "source", "lead_date", "status"],
    },
    "followups": {
        "table": "lead_followup",
        "pk": "followup_id",
        "columns": ["lead_id", "user_id", "followup_date", "method", "notes", "outcome"],
    },
    "sales": {
        "table": "sale",
        "pk": "sale_id",
        "columns": ["lead_id", "sale_date", "sale_amount", "product_service"],
    },
    "invoices": {
        "table": "invoice",
        "pk": "invoice_id",
        "columns": ["client_id", "issue_date", "due_date", "total_amount", "status"],
    },
    "payments": {
        "table": "payment",
        "pk": "payment_id",
        "columns": ["invoice_id", "payment_date", "amount", "payment_method"],
    },
    "deliverables": {
        "table": "deliverable",
        "pk": "deliverable_id",
        "columns": ["campaign_id", "user_id", "title", "due_date", "status"],
    },
}
