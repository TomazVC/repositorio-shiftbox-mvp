# Script completo para inicializar e rodar o backend com SQLite
Write-Host ""
Write-Host "=== ShiftBox Backend - Inicialização SQLite ===" -ForegroundColor Cyan
Write-Host ""

# Configurar variáveis de ambiente
$env:USE_SQLITE = "true"
$env:USE_POSTGRES = "false"
$env:DATABASE_URL = "sqlite:///./shiftbox_dev.db"

Write-Host "🔧 Configurado para usar SQLite" -ForegroundColor Green

# Verificar se está no diretório correto
if (-not (Test-Path "app")) {
    Write-Host "❌ ERRO: Execute este script do diretório backend!" -ForegroundColor Red
    Write-Host "   cd C:\Users\tomaz\OneDrive\Documents\repositorio-shiftbox\repositorio-shiftbox-mvp\backend" -ForegroundColor Yellow
    exit 1
}

# Ativar ambiente virtual
Write-Host ""
Write-Host "🐍 Ativando ambiente virtual..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# Verificar se ativou corretamente
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao ativar ambiente virtual" -ForegroundColor Red
    Write-Host "💡 Tente: python -m venv venv" -ForegroundColor Yellow
    exit 1
}

# Instalar dependências se necessário
Write-Host ""
Write-Host "📦 Verificando dependências..." -ForegroundColor Yellow
pip install --quiet -r requirements.txt

# Inicializar banco SQLite
Write-Host ""
Write-Host "💾 Inicializando banco SQLite..." -ForegroundColor Yellow
python init_sqlite.py

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao inicializar banco" -ForegroundColor Red
    exit 1
}

# Criar usuário admin se necessário
Write-Host ""
Write-Host "👤 Verificando usuário admin..." -ForegroundColor Yellow
python create_admin.py

# Iniciar servidor
Write-Host ""
Write-Host "=== 🚀 Iniciando Servidor FastAPI ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 URL: http://localhost:8000" -ForegroundColor Green
Write-Host "📚 Docs: http://localhost:8000/docs" -ForegroundColor Green
Write-Host "🔍 Health: http://localhost:8000/health" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Pressione Ctrl+C para parar o servidor" -ForegroundColor Gray
Write-Host ""

# Rodar servidor
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload