# Script para debug do backend
Write-Host "🔍 Verificando dependências..." -ForegroundColor Blue

# Verificar se Python está disponível
try {
    $pythonVersion = python --version
    Write-Host "✅ Python encontrado: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python não encontrado!" -ForegroundColor Red
    exit 1
}

# Verificar se uvicorn está instalado
try {
    python -c "import uvicorn; print('✅ uvicorn disponível')"
} catch {
    Write-Host "❌ uvicorn não encontrado! Instalando..." -ForegroundColor Yellow
    pip install uvicorn
}

# Verificar se FastAPI está instalado
try {
    python -c "import fastapi; print('✅ FastAPI disponível')"
} catch {
    Write-Host "❌ FastAPI não encontrado! Instalando..." -ForegroundColor Yellow
    pip install fastapi
}

Write-Host "🚀 Iniciando servidor backend..." -ForegroundColor Blue
Write-Host "📍 URL: http://localhost:8000" -ForegroundColor Cyan
Write-Host "📍 Docs: http://localhost:8000/docs" -ForegroundColor Cyan

# Iniciar o servidor
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000