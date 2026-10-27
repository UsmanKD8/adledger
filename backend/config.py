"""App settings, read from environment variables or backend/.env (see .env.example)."""
import hashlib
import os

from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))


def default_secret_key():
    # When SECRET_KEY is not set (e.g. on Vercel), derive a stable key from the
    # DB password so every serverless instance signs sessions the same way.
    seed = os.getenv("DB_PASSWORD", "") + ":adledger-session"
    return hashlib.sha256(seed.encode()).hexdigest()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY") or default_secret_key()
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
