"""
AdLedger Flask backend.

Run:  python app.py   ->  API at http://localhost:5000/api
The frontend folder is also served at http://localhost:5000/ so the whole
app can run from this one server.
"""
import os
from datetime import date, datetime
from decimal import Decimal

import pymysql
from flask import Flask, jsonify, send_from_directory
from flask.json.provider import DefaultJSONProvider
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

from config import Config
from db import close_db
from routes import auth, crud, reports

FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))

# MySQL error codes that mean "the data broke a rule" (shown to the user as 400).
USER_ERROR_CODES = {
    1048,  # column cannot be null
    1062,  # duplicate entry (UNIQUE)
    1264,  # out of range value
    1265,  # data truncated (bad ENUM value)
    1292,  # incorrect date/number value
    1366,  # incorrect value for column
    1451,  # cannot delete: row is referenced by a foreign key
    1452,  # foreign key target does not exist
    1644,  # SIGNAL from a trigger
    3819,  # CHECK constraint violated
}


class JSONProvider(DefaultJSONProvider):
    """Send dates as YYYY-MM-DD and DECIMAL as numbers (what the frontend expects)."""

    @staticmethod
    def default(o):
        if isinstance(o, (date, datetime)):
            return o.isoformat()
        if isinstance(o, Decimal):
            return float(o)
        return DefaultJSONProvider.default(o)


def create_app():
    app = Flask(__name__, static_folder=None)
    app.json = JSONProvider(app)
    app.config.from_object(Config)
    CORS(app, origins=app.config["CORS_ORIGINS"], supports_credentials=True)

    app.register_blueprint(auth.bp)
    app.register_blueprint(reports.bp)
    app.register_blueprint(crud.bp)
    app.teardown_appcontext(close_db)

    @app.get("/api/health")
    def health():
        return jsonify(status="ok")

    @app.errorhandler(HTTPException)
    def http_error(e):
        return jsonify(error=e.description), e.code

    @app.errorhandler(pymysql.MySQLError)
    def db_error(e):
        code = e.args[0] if e.args else None
        message = e.args[1] if len(e.args) > 1 else str(e)
        if code == 1451:
            message = "This record is used by other records, so it cannot be deleted"
        elif code == 1452:
            message = "The selected related record does not exist"
        if code in USER_ERROR_CODES:
            return jsonify(error=message), 400
        app.logger.exception("Database error")
        return jsonify(error="Database error: " + message), 500

    @app.get("/")
    @app.get("/<path:path>")
    def frontend(path="index.html"):
        return send_from_directory(FRONTEND_DIR, path)

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="localhost", port=5000, debug=True)
