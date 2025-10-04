# Script de verificacao do ambiente ShiftBox MVP
Write-Host ""
Write-Host "=== ShiftBox MVP - Verificacao de Ambiente ===" -ForegroundColor Cyan
Write-Host ""

# Verificar Docker
Write-Host "[1/4] Verificando Docker..." -ForegroundColor Yellow
$docker = Get-Command docker -ErrorAction SilentlyContinue
if ($docker) {
    $dockerVersion = docker --version 2>$null
    Write-Host "  OK Docker instalado: $dockerVersion" -ForegroundColor Green
} else {
    Write-Host "  X Docker nao encontrado. Instale: https://www.docker.com/get-started" -ForegroundColor Red
}

$dockerCompose = Get-Command docker-compose -ErrorAction SilentlyContinue
if ($dockerCompose) {
    $dockerComposeVersion = docker-compose --version 2>$null
    Write-Host "  OK Docker Compose instalado: $dockerComposeVersion" -ForegroundColor Green
} else {
    Write-Host "  X Docker Compose nao encontrado" -ForegroundColor Red
}

# Verificar Node.js
Write-Host ""
Write-Host "[2/4] Verificando Node.js..." -ForegroundColor Yellow
$node = Get-Command node -ErrorAction SilentlyContinue
if ($node) {
    $nodeVersion = node --version 2>$null
    Write-Host "  OK Node.js instalado: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "  X Node.js nao encontrado. Instale: https://nodejs.org/" -ForegroundColor Red
}

$npm = Get-Command npm -ErrorAction SilentlyContinue
if ($npm) {
    $npmVersion = npm --version 2>$null
    Write-Host "  OK npm instalado: v$npmVersion" -ForegroundColor Green
} else {
    Write-Host "  X npm nao encontrado" -ForegroundColor Red
}

# Verificar Git
Write-Host ""
Write-Host "[3/4] Verificando Git..." -ForegroundColor Yellow
$git = Get-Command git -ErrorAction SilentlyContinue
if ($git) {
    $gitVersion = git --version 2>$null
    Write-Host "  OK Git instalado: $gitVersion" -ForegroundColor Green
} else {
    Write-Host "  X Git nao encontrado. Instale: https://git-scm.com/" -ForegroundColor Red
}

# Verificar estrutura de arquivos
Write-Host ""
Write-Host "[4/4] Verificando estrutura de arquivos..." -ForegroundColor Yellow

$requiredFiles = @(
    "docker-compose.yml",
    "README.md",
    "backend/Dockerfile",
    "backend/requirements.txt",
    "backend/app/main.py",
    "frontend/package.json",
    "frontend/src/App.tsx",
    "mobile/package.json",
    "mobile/App.tsx",
    "docs/api-contract.md"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  OK $file" -ForegroundColor Green
    } else {
        Write-Host "  X $file nao encontrado" -ForegroundColor Red
        $allFilesExist = $false
    }
}

# Resumo
Write-Host ""
Write-Host "=== Resumo ===" -ForegroundColor Cyan
if ($allFilesExist -eq $true) {
    Write-Host "Estrutura de arquivos: OK" -ForegroundColor Green
} else {
    Write-Host "Estrutura de arquivos: INCOMPLETA" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Proximos Passos ===" -ForegroundColor Cyan
Write-Host "1. Backend:  docker-compose up --build" -ForegroundColor White
Write-Host "2. Frontend: cd frontend && npm install && npm run dev" -ForegroundColor White
Write-Host "3. Mobile:   cd mobile && npm install && npx expo start" -ForegroundColor White
Write-Host ""
Write-Host "Documentacao: docs/SETUP.md" -ForegroundColor Gray
Write-Host ""
