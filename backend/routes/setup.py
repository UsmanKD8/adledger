"""
One-time database setup for the hosted MySQL.

POST /api/setup runs database/01..04 (read from the public GitHub repo) using
the backend's own DB credentials. It refuses to run once adledger_db exists,
so it cannot wipe live data. Remove this route after the first setup.
"""
import urllib.request

import pymysql
from flask import Blueprint, current_app, jsonify

from db import ssl_options

bp = Blueprint("setup", __name__, url_prefix="/api")

RAW_BASE = "https://raw.githubusercontent.com/UsmanKD8/adledger/main/database/"
SCRIPTS = ["01_schema.sql", "02_triggers.sql", "03_views.sql", "04_seed.sql"]


def split_statements(sql):
    """Split a MySQL script into statements, honouring DELIMITER changes."""
    delimiter, buf, out = ";", [], []
    for line in sql.splitlines():
        stripped = line.strip()
        if stripped.upper().startswith("DELIMITER "):
            delimiter = stripped.split()[1]
            continue
        if not buf and (not stripped or stripped.startswith("--")):
            continue
        buf.append(line)
        if stripped.endswith(delimiter):
            stmt = "\n".join(buf).rstrip()[: -len(delimiter)].strip()
            if stmt:
                out.append(stmt)
            buf = []
    return out


@bp.post("/setup")
def setup():
    cfg = current_app.config
    conn = pymysql.connect(
        host=cfg["DB_HOST"], port=cfg["DB_PORT"], user=cfg["DB_USER"],
        password=cfg["DB_PASSWORD"], autocommit=True, charset="utf8mb4",
        **ssl_options(cfg),
    )
    try:
        with conn.cursor() as cur:
            cur.execute("SHOW DATABASES LIKE %s", (cfg["DB_NAME"],))
            if cur.fetchone():
                return jsonify(error="Database already exists; setup refused"), 409

            done = []
            for name in SCRIPTS:
                sql = urllib.request.urlopen(RAW_BASE + name, timeout=20).read().decode()
                for stmt in split_statements(sql):
                    cur.execute(stmt)
                done.append(name)

            cur.execute(f"SELECT * FROM {cfg['DB_NAME']}.vw_dashboard_summary")
            summary = cur.fetchone()
        return jsonify(ok=True, scripts=done, dashboard=summary)
    finally:
        conn.close()
