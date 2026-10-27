"""MySQL connection handling: one connection per request, closed on teardown."""
import os
import tempfile

import pymysql
from flask import current_app, g


def ssl_options(cfg):
    if not cfg["DB_SSL"]:
        return {}
    if cfg["DB_SSL_CA"]:
        path = os.path.join(tempfile.gettempdir(), "adledger-db-ca.pem")
        if not os.path.exists(path):
            with open(path, "w") as f:
                f.write(cfg["DB_SSL_CA"].replace("\\n", "\n"))
        return {"ssl_ca": path, "ssl_verify_cert": True}
    # TLS without certificate verification
    return {"ssl": {"check_hostname": False}}


def get_db():
    if "db" not in g:
        cfg = current_app.config
        g.db = pymysql.connect(
            host=cfg["DB_HOST"],
            port=cfg["DB_PORT"],
            user=cfg["DB_USER"],
            password=cfg["DB_PASSWORD"],
            database=cfg["DB_NAME"],
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=False,
            charset="utf8mb4",
            **ssl_options(cfg),
        )
    return g.db


def close_db(_exc=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def query(sql, params=None, one=False):
    """Run a SELECT and return a list of dict rows (or one row)."""
    with get_db().cursor() as cur:
        cur.execute(sql, params)
        return cur.fetchone() if one else cur.fetchall()


def execute(sql, params=None):
    """Run one INSERT/UPDATE/DELETE inside a transaction; returns lastrowid."""
    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute(sql, params)
            last_id = cur.lastrowid
        db.commit()
        return last_id
    except Exception:
        db.rollback()
        raise
