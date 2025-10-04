# Script para rodar backend localmente sem Docker
Write-Host ""
Write-Host "=== Iniciando Backend ShiftBox (Modo Local) ===" -ForegroundColor Cyan
Write-Host ""

# Verificar Python
$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
    Write-Host "ERRO: Python nao encontrado!" -ForegroundColor Red
    Write-Host "Instale Python 3.11+: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

$pythonVersion = python --version
Write-Host "Python encontrado: $pythonVersion" -ForegroundColor Green

# Criar venv se nao existir
if (-not (Test-Path "venv")) {
    Write-Host ""
    Write-Host "Criando ambiente virtual..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "Ambiente virtual criado!" -ForegroundColor Green
}

# Ativar venv
Write-Host ""
Write-Host "Ativando ambiente virtual..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# Instalar dependencias
Write-Host ""
Write-Host "Instalando dependencias..." -ForegroundColor Yellow
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

Write-Host ""
Write-Host "Dependencias instaladas!" -ForegroundColor Green

# Configurar para usar SQLite em vez de PostgreSQL
$env:USE_SQLITE = "true"

# Iniciar servidor
Write-Host ""
Write-Host "=== Iniciando servidor FastAPI ===" -ForegroundColor Cyan
Write-Host "URL: http://localhost:8000" -ForegroundColor Green
Write-Host "Docs: http://localhost:8000/docs" -ForegroundColor Green
Write-Host ""
Write-Host "Pressione Ctrl+C para parar o servidor" -ForegroundColor Gray
Write-Host ""

# Mudar para diretorio backend e rodar
Set-Location -Path $PSScriptRoot
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

