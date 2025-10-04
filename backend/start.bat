@echo off
echo === Iniciando Backend ShiftBox ===
echo.

cd /d "%~dp0"

if not exist venv (
    echo Criando ambiente virtual...
    python -m venv venv
    echo.
)

echo Ativando ambiente virtual...
call venv\Scripts\activate.bat

echo.
echo Instalando/Atualizando dependencias...
pip install -q -r requirements.txt

echo.
echo === Iniciando Servidor FastAPI ===
echo URL: http://localhost:8000
echo Docs: http://localhost:8000/docs
echo.
echo Pressione Ctrl+C para parar
echo.

set USE_SQLITE=true
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

