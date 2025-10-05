@echo off
echo === Iniciando Backend ShiftBox (SQLite) ===
echo.

REM Definir variáveis de ambiente para SQLite
set USE_SQLITE=true
set USE_POSTGRES=false
set DATABASE_URL=sqlite:///./shiftbox_dev.db

echo Configurado para usar SQLite
echo.

REM Ativar ambiente virtual
echo Ativando ambiente virtual...
call .\venv\Scripts\activate.bat

REM Iniciar servidor
echo.
echo === Iniciando servidor FastAPI ===
echo URL: http://localhost:8000
echo Docs: http://localhost:8000/docs
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload