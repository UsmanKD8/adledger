@echo off
REM Starts the Flask backend. Open http://localhost:5000 after it starts.
cd /d "%~dp0backend"
venv\Scripts\python.exe app.py
