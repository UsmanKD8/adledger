"""Login / logout using a signed Flask session cookie."""
from flask import Blueprint, jsonify, request, session
from werkzeug.security import check_password_hash

from db import query
from utils.auth import current_user, login_required

bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip()
    password = data.get("password") or ""
    if not email or not password:
        return jsonify(error="Email and password are required"), 400

    user = query("SELECT * FROM agency_user WHERE email = %s", (email,), one=True)
    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify(error="Invalid email or password"), 401

    session.clear()
    session["user"] = {k: user[k] for k in ("user_id", "full_name", "email", "role")}
    return jsonify(user=session["user"])


@bp.post("/logout")
def logout():
    session.clear()
    return jsonify(ok=True)


@bp.get("/me")
@login_required
def me():
    return jsonify(user=current_user())
