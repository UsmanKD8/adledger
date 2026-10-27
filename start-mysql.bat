@echo off
REM Starts the local MySQL 8.4 server used by AdLedger (keep this window open).
REM Data folder: %LOCALAPPDATA%\MySQL\adledger\data
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" --defaults-file="%LOCALAPPDATA%\MySQL\adledger\my.ini" --console
