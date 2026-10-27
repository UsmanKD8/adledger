"""Read-only report endpoints backed by the views in database/03_views.sql."""
from flask import Blueprint, jsonify

from db import query
from utils.auth import login_required

bp = Blueprint("reports", __name__, url_prefix="/api/reports")

LEAD_STATUSES = ["New", "Contacted", "Converted", "Lost"]


@bp.get("/campaign-performance")
@login_required
def campaign_performance():
    return jsonify(query("SELECT * FROM vw_campaign_performance ORDER BY campaign_id"))


@bp.get("/dashboard")
@login_required
def dashboard():
    summary = query("SELECT * FROM vw_dashboard_summary", one=True)
    summary["top_campaigns"] = query(
        "SELECT * FROM vw_campaign_performance ORDER BY total_revenue DESC LIMIT 5"
    )
    counts = {r["status"]: r["count"] for r in query("SELECT * FROM vw_leads_by_status")}
    summary["leads_by_status"] = [{"status": s, "count": counts.get(s, 0)} for s in LEAD_STATUSES]
    return jsonify(summary)


@bp.get("/outstanding-invoices")
@login_required
def outstanding_invoices():
    return jsonify(query("SELECT * FROM vw_outstanding_invoices ORDER BY due_date"))


@bp.get("/client-summary")
@login_required
def client_summary():
    return jsonify(query("SELECT * FROM vw_client_summary ORDER BY total_revenue DESC"))
