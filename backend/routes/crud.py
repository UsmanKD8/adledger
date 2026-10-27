"""
Generic REST endpoints for every table in resources.py:

    GET    /api/<resource>         list rows
    GET    /api/<resource>/<id>    one row
    POST   /api/<resource>         insert
    PUT    /api/<resource>/<id>    update
    DELETE /api/<resource>/<id>    delete (Admin / Manager only)
"""
from flask import Blueprint, abort, jsonify, request
from werkzeug.security import generate_password_hash

from db import execute, get_db, query
from resources import RESOURCES
from utils.auth import has_role, login_required

bp = Blueprint("crud", __name__, url_prefix="/api")


def get_resource(name):
    res = RESOURCES.get(name)
    if res is None:
        abort(404, description=f"Unknown resource '{name}'")
    return res


def check_write_access(res):
    roles = res.get("write_roles")
    if roles and not has_role(*roles):
        abort(403, description="You do not have permission to change this data")


def clean_payload(res, data):
    """Keep only known columns; empty form fields become NULL."""
    return {c: (data[c] if data[c] != "" else None) for c in res["columns"] if c in data}


def fetch_one(res, row_id):
    select = res.get("select", "*")
    return query(f"SELECT {select} FROM {res['table']} WHERE {res['pk']} = %s", (row_id,), one=True)


@bp.get("/<resource>")
@login_required
def list_rows(resource):
    res = get_resource(resource)
    select = res.get("select", "*")
    return jsonify(query(f"SELECT {select} FROM {res['table']} ORDER BY {res['pk']}"))


@bp.get("/<resource>/<int:row_id>")
@login_required
def get_row(resource, row_id):
    res = get_resource(resource)
    row = fetch_one(res, row_id)
    if row is None:
        abort(404, description="Record not found")
    return jsonify(row)


@bp.post("/<resource>")
@login_required
def create_row(resource):
    res = get_resource(resource)
    check_write_access(res)
    raw = request.get_json(silent=True) or {}
    data = clean_payload(res, raw)

    if resource == "users":
        if not raw.get("password"):
            abort(400, description="Password is required")
        data["password_hash"] = generate_password_hash(raw["password"])
    if resource == "payments":
        return create_payment(data)
    if not data:
        abort(400, description="No data sent")

    cols = ", ".join(data)
    marks = ", ".join(["%s"] * len(data))
    new_id = execute(f"INSERT INTO {res['table']} ({cols}) VALUES ({marks})", tuple(data.values()))
    return jsonify(fetch_one(res, new_id)), 201


def create_payment(data):
    """
    Records a payment as one transaction: lock the invoice row, insert the
    payment (triggers validate it and update invoice.status), read back the
    new status, then COMMIT. Any error rolls the whole thing back.
    """
    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute("START TRANSACTION")
            cur.execute("SELECT invoice_id FROM invoice WHERE invoice_id = %s FOR UPDATE",
                        (data.get("invoice_id"),))
            if cur.fetchone() is None:
                abort(400, description="Invoice not found")
            cur.execute(
                "INSERT INTO payment (invoice_id, payment_date, amount, payment_method) "
                "VALUES (%s, %s, %s, %s)",
                (data.get("invoice_id"), data.get("payment_date"), data.get("amount"),
                 data.get("payment_method") or "Bank Transfer"),
            )
            payment_id = cur.lastrowid
            cur.execute("SELECT status FROM invoice WHERE invoice_id = %s", (data["invoice_id"],))
            invoice_status = cur.fetchone()["status"]
        db.commit()
    except Exception:
        db.rollback()
        raise
    row = fetch_one(RESOURCES["payments"], payment_id)
    row["invoice_status"] = invoice_status
    return jsonify(row), 201


@bp.put("/<resource>/<int:row_id>")
@login_required
def update_row(resource, row_id):
    res = get_resource(resource)
    check_write_access(res)
    raw = request.get_json(silent=True) or {}
    data = clean_payload(res, raw)
    if resource == "users" and raw.get("password"):
        data["password_hash"] = generate_password_hash(raw["password"])
    if not data:
        abort(400, description="No data sent")
    if fetch_one(res, row_id) is None:
        abort(404, description="Record not found")

    sets = ", ".join(f"{c} = %s" for c in data)
    execute(f"UPDATE {res['table']} SET {sets} WHERE {res['pk']} = %s", (*data.values(), row_id))
    return jsonify(fetch_one(res, row_id))


@bp.delete("/<resource>/<int:row_id>")
@login_required
def delete_row(resource, row_id):
    res = get_resource(resource)
    check_write_access(res)
    if not has_role("Admin", "Manager"):
        abort(403, description="Only Admin or Manager can delete records")
    if fetch_one(res, row_id) is None:
        abort(404, description="Record not found")
    execute(f"DELETE FROM {res['table']} WHERE {res['pk']} = %s", (row_id,))
    return jsonify(ok=True)
