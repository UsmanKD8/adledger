"""Session-based login checks for API routes."""
from functools import wraps

from flask import jsonify, session


def current_user():
    return session.get("user")


def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not current_user():
            return jsonify(error="Please log in"), 401
        return fn(*args, **kwargs)
    return wrapper


def has_role(*roles):
    user = current_user()
    return bool(user) and user["role"] in roles
