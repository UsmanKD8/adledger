"""App settings, read from environment variables or backend/.env (see .env.example)."""
import os

from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "change-me")
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = int(os.getenv("DB_PORT", "3306"))
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME", "adledger_db")
    # Hosted MySQL (e.g. Aiven) needs TLS: DB_SSL=true, and optionally the
    # provider's CA certificate (PEM text) in DB_SSL_CA to verify the server.
    DB_SSL = os.getenv("DB_SSL", "false").lower() == "true"
    DB_SSL_CA = os.getenv("DB_SSL_CA", "")
    # Origins allowed to call the API with cookies (the static frontend server).
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5500").split(",")
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SECURE = os.getenv("SESSION_COOKIE_SECURE", "false").lower() == "true"
