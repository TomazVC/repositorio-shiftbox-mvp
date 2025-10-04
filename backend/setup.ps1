# Script de Setup do Backend ShiftBox
# Execute este script uma vez para configurar o ambiente

Write-Host "Setup do Backend ShiftBox" -ForegroundColor Cyan
Write-Host ("="*60)

# 1. Verificar se Python esta instalado
Write-Host ""
Write-Host "1. Verificando Python..." -ForegroundColor Yellow
try {
    $pythonVersion = py --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   OK: Python instalado - $pythonVersion" -ForegroundColor Green
    } else {
        Write-Host "   ERRO: Python nao encontrado! Instale Python 3.8+ primeiro." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ERRO: Python nao encontrado! Instale Python 3.8+ primeiro." -ForegroundColor Red
    exit 1
}

# 2. Criar ambiente virtual
Write-Host ""
Write-Host "2. Criando ambiente virtual..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "   OK: Ambiente virtual ja existe" -ForegroundColor Yellow
} else {
    py -m venv venv
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   OK: Ambiente virtual criado" -ForegroundColor Green
    } else {
        Write-Host "   ERRO: Falha ao criar ambiente virtual" -ForegroundColor Red
        exit 1
    }
}

# 3. Ativar ambiente virtual
Write-Host ""
Write-Host "3. Ativando ambiente virtual..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK: Ambiente virtual ativado" -ForegroundColor Green
} else {
    Write-Host "   AVISO: Pode ser necessario executar:" -ForegroundColor Yellow
    Write-Host "   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Yellow
}

# 4. Atualizar pip
Write-Host ""
Write-Host "4. Atualizando pip..." -ForegroundColor Yellow
py -m pip install --upgrade pip --quiet
Write-Host "   OK: pip atualizado" -ForegroundColor Green

# 5. Instalar dependencias
Write-Host ""
Write-Host "5. Instalando dependencias..." -ForegroundColor Yellow
Write-Host "   (Isso pode levar alguns minutos...)" -ForegroundColor Gray
pip install -r requirements.txt

if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK: Dependencias instaladas com sucesso!" -ForegroundColor Green
} else {
    Write-Host "   ERRO: Falha ao instalar dependencias!" -ForegroundColor Red
    exit 1
}

# 6. Verificar instalacao
Write-Host ""
Write-Host "6. Verificando instalacao..." -ForegroundColor Yellow
$packages = @("fastapi", "sqlalchemy", "alembic", "uvicorn")
$allOk = $true

foreach ($package in $packages) {
    try {
        $result = pip show $package 2>$null
        if ($result) {
            Write-Host "   OK: $package instalado" -ForegroundColor Green
        } else {
            Write-Host "   ERRO: $package NAO instalado" -ForegroundColor Red
            $allOk = $false
        }
    } catch {
        Write-Host "   ERRO: $package NAO instalado" -ForegroundColor Red
        $allOk = $false
    }
}

# Resultado final
Write-Host ""
Write-Host ("="*60)
if ($allOk) {
    Write-Host "SETUP CONCLUIDO COM SUCESSO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Proximos passos:" -ForegroundColor Cyan
    Write-Host "  1. Execute: .\venv\Scripts\Activate.ps1 (ativar ambiente)" -ForegroundColor White
    Write-Host "  2. Configure os models do banco de dados" -ForegroundColor White
    Write-Host "  3. Execute: alembic upgrade head (criar tabelas)" -ForegroundColor White
    Write-Host "  4. Execute: py seed_data.py (popular banco)" -ForegroundColor White
    Write-Host "  5. Execute: py -m uvicorn app.main:app --reload (iniciar API)" -ForegroundColor White
} else {
    Write-Host "SETUP TEVE PROBLEMAS" -ForegroundColor Red
    Write-Host "Verifique os erros acima e tente novamente." -ForegroundColor Yellow
}

Write-Host ""

