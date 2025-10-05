# ShiftBox MVP - Plataforma P2P de Investimentos

![ShiftBox](https://img.shields.io/badge/ShiftBox-MVP-blue)
![Status](https://img.shields.io/badge/Status-Desenvolvimento-orange)
![Backend](https://img.shields.io/badge/Backend-FastAPI-green)
![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Mobile](https://img.shields.io/badge/Mobile-React%20Native-purple)
![Windows](https://img.shields.io/badge/Windows-Compatible-blue)

Plataforma completa para gestão de investimentos e empréstimos P2P com pool compartilhado de liquidez, interface web administrativa e aplicativo móvel.

##  Índice

- [ Início Rápido - Windows](#-início-rápido---windows)
- [ Pré-requisitos](#-pré-requisitos)
- [ Instalação Completa](#%EF%B8%8F-instalação-completa)
- [ Configuração dos Projetos](#-configuração-dos-projetos)
- [ Executando os Projetos](#%EF%B8%8F-executando-os-projetos)
- [ Arquitetura do Projeto](#%EF%B8%8F-arquitetura-do-projeto)
- [ Stack Tecnológica](#%EF%B8%8F-stack-tecnológica)
- [ Autenticação](#-autenticação)
- [ Endpoints Principais](#-endpoints-principais)
- [ Configuração Mobile](#-configuração-mobile)
- [ Troubleshooting](#-troubleshooting)
- [ Documentação Adicional](#-documentação-adicional)

##  Início Rápido - Windows

###  Setup Automático (Recomendado)

```powershell
# 1. Clone o repositório
git clone https://github.com/TomazVC/repositorio-shiftbox-mvp.git
cd repositorio-shiftbox-mvp

# 2. Execute o script de verificação
.\check-setup.ps1

# 3. Configure e execute cada projeto (3 terminais separados)
```

###  Execução Rápida

**Terminal 1 - Backend (PowerShell):**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:USE_SQLITE = "true"
python init_sqlite.py
python create_simple_admin.py
python create_mobile_users.py
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend (PowerShell):**
```powershell
cd frontend
npm install
npm run dev
```

**Terminal 3 - Mobile (PowerShell - Opcional):**
```powershell
cd mobile
npm install
npx expo start

```

###  URLs de Acesso

-  **API Backend:** http://localhost:8000
-  **Documentação API:** http://localhost:8000/docs
-  **Frontend Web:** http://localhost:3000
-  **Mobile:** App Expo Go ou Emulador

---

##  Pré-requisitos

###  Software Necessário

| Software | Versão Mínima | Download | Verificação |
|----------|---------------|----------|-------------|
| **Python** | 3.10+ | [python.org](https://python.org) | `python --version` |
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org) | `node --version` |
| **Git** | Qualquer | [git-scm.com](https://git-scm.com) | `git --version` |
| **PowerShell** | 5.1+ | Incluído no Windows | `$PSVersionTable.PSVersion` |

###  Para Mobile (Opcional)
| Software | Versão | Download |
|----------|--------|----------|
| **Expo CLI** | Latest | `npm install -g @expo/cli` |
| **Android Studio** | Opcional | [developer.android.com](https://developer.android.com/studio) |
| **Expo Go App** | Latest | Play Store / App Store |

###  Script de Verificação

Execute para verificar se tudo está instalado:
```powershell
.\check-setup.ps1
```

---

##  Instalação Completa

### 1️ Clone do Repositório
```powershell
# Abra o PowerShell como Administrador (opcional, mas recomendado)
git clone https://github.com/TomazVC/repositorio-shiftbox-mvp.git
cd repositorio-shiftbox-mvp
```

### 2️ Verificação do Ambiente
```powershell
# Execute o script de verificação
.\check-setup.ps1

# Se houver problemas, instale os pré-requisitos faltantes
```

---

##  Configuração dos Projetos

###  Backend (Python + FastAPI)

```powershell
# 1. Navegue para o backend
cd backend

# 2. Crie ambiente virtual Python
python -m venv venv

# 3. Ative o ambiente virtual
.\venv\Scripts\Activate.ps1

# 4. Atualize o pip
python -m pip install --upgrade pip

# 5. Instale dependências
pip install -r requirements.txt

# 6. Configure variáveis de ambiente
$env:USE_SQLITE = "true"
$env:PYTHONIOENCODING = "utf-8"

# 7. Inicialize o banco SQLite
python init_sqlite.py

# 8. Crie usuário administrador
python create_simple_admin.py

# 9. Crie usuários de teste para mobile
python create_mobile_users.py

# 10. Execute migrações (se necessário)
.\venv\Scripts\alembic.exe upgrade head
```

###  Frontend (React + Vite)

```powershell
# 1. Navegue para o frontend
cd frontend

# 2. Instale dependências
npm install

# 3. Verifique se instalou corretamente
npm list --depth=0
```

###  Mobile (React Native + Expo)

```powershell
# 1. Navegue para o mobile
cd mobile

# 2. Instale dependências
npm install

# 3. Instale Expo CLI globalmente (se não tiver)
npm install -g @expo/cli

# 4. Verifique se instalou corretamente
npx expo --version
```

---

##  Executando os Projetos

###  Ordem de Execução Recomendada

**IMPORTANTE:** Execute cada comando em um terminal PowerShell separado e mantenha todos abertos.

#### 1️ **Primeiro: Backend API** 
```powershell
# Terminal 1 - Backend
cd backend
.\venv\Scripts\Activate.ps1
$env:USE_SQLITE = "true"
$env:PYTHONIOENCODING = "utf-8"

# Inicie o servidor (mantenha rodando)
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Teste se funcionou:**
- Abra http://localhost:8000/docs no navegador
- Deve aparecer a documentação Swagger da API

#### 2️ **Segundo: Frontend Web**
```powershell
# Terminal 2 - Frontend (novo terminal)
cd frontend
npm run dev
```

**Teste se funcionou:**
- Abra http://localhost:3000 no navegador
- Deve aparecer a tela de login

#### 3️ **Terceiro: Mobile (Opcional)**
```powershell
# Terminal 3 - Mobile (novo terminal) 
cd mobile
npx expo start
```

**Teste se funcionou:**
- Deve abrir uma página no navegador com QR Code
- Use o app Expo Go para escanear o QR Code

###  Scripts de Desenvolvimento

#### Backend - Scripts Úteis
```powershell
# Ambiente virtual já ativado
cd backend
.\venv\Scripts\Activate.ps1

# Recriar banco (apaga dados)
python init_sqlite.py

# Criar usuário admin
python create_simple_admin.py

# Criar usuários de teste
python create_mobile_users.py

# Executar migrações
.\venv\Scripts\alembic.exe upgrade head

# Ver dados do banco
python inspect_db.py

# Job de cálculo de juros
python accrual_job.py

# Iniciar servidor de desenvolvimento
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Iniciar servidor de produção
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

#### Frontend - Scripts Disponíveis
```powershell
cd frontend

# Desenvolvimento (hot reload)
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Linting
npm run lint
```

#### Mobile - Scripts Disponíveis  
```powershell
cd mobile

# Iniciar Expo (abre no navegador)
npx expo start

# Forçar abrir no Android
npx expo start --android

# Forçar abrir no iOS (macOS apenas)
npx expo start --ios

# Versão web
npx expo start --web

# Limpar cache
npx expo start --clear
```

---

##  Arquitetura do Projeto

```
repositorio-shiftbox-mvp/
├── 📁 backend/                    #  API FastAPI + SQLAlchemy
│   ├── 📁 app/                    # Código da aplicação
│   │   ├── 📁 api/                #  Endpoints REST
│   │   ├── 📁 models/             #  Modelos SQLAlchemy  
│   │   ├── 📁 schemas/            #  Schemas Pydantic
│   │   └── 📁 services/           #  Lógica de negócio
│   ├── 📁 alembic/                #  Migrations de banco
│   ├── 📁 uploads/                #  Arquivos KYC
│   ├── 📄 shiftbox_dev.db         #  Banco SQLite
│   ├── 📄 requirements.txt        #  Dependências Python
│   ├── 📄 init_sqlite.py          #  Inicializar banco
│   ├── 📄 create_simple_admin.py  #  Criar admin
│   └── 📄 create_mobile_users.py  #  Criar usuários teste
├── 📁 frontend/                   #  Painel Admin (React + Vite)
│   ├── 📁 src/
│   │   ├── 📁 components/         #  Componentes React
│   │   ├── 📁 pages/              #  Páginas da aplicação
│   │   ├── 📁 services/           #  Integração com APIs
│   │   ├── 📁 hooks/              #  Hooks customizados
│   │   └── 📁 utils/              #  Utilitários
│   └── 📄 package.json            #  Dependências Node.js
├── 📁 mobile/                     #  App Cliente (React Native + Expo)
│   ├── 📁 screens/                #  Telas do aplicativo
│   ├── 📁 services/               #  Integração com APIs
│   ├── 📁 navigation/             #  Navegação
│   ├── 📁 config/                 #  Configurações
│   └── 📄 package.json            #  Dependências Expo
├── 📄 check-setup.ps1             #  Script verificação ambiente
├── 📄 docker-compose.yml          #  Configuração Docker
└── 📄 README.md                   #  Esta documentação
```

---

##  Stack Tecnológica

###  Backend (API)
| Tecnologia | Versão | Função |
|------------|--------|--------|
| **Python** | 3.10+ | Linguagem principal |
| **FastAPI** | 0.104.1 | Framework web moderno e rápido |
| **SQLAlchemy** | 2.0.23 | ORM para banco de dados |
| **Alembic** | 1.12.1 | Migrations de banco |
| **SQLite** | - | Banco local (desenvolvimento) |
| **PostgreSQL** | - | Banco produção (futuro) |
| **JWT** | - | Autenticação com python-jose |
| **Uvicorn** | 0.24.0 | Servidor ASGI |
| **Pydantic** | 2.5.0 | Validação de dados |

###  Frontend (Web Admin)
| Tecnologia | Versão | Função |
|------------|--------|--------|
| **React** | 18.2.0 | Biblioteca de interface |
| **Vite** | 5.0.8 | Build tool moderna |
| **TypeScript** | 5.2.2 | Tipagem estática |
| **TailwindCSS** | 3.3.6 | Framework CSS utilitário |
| **React Query** | 5.12.2 | Gerenciamento de estado servidor |
| **Axios** | 1.6.2 | Cliente HTTP |
| **React Router** | 6.20.0 | Roteamento |

###  Mobile (App Cliente)
| Tecnologia | Versão | Função |
|------------|--------|--------|
| **React Native** | 0.81.4 | Framework mobile |
| **Expo** | ~54.0.12 | Plataforma de desenvolvimento |
| **TypeScript** | 5.6.3 | Tipagem estática |
| **React Navigation** | 7.x | Navegação nativa |
| **Axios** | 1.7.7 | Cliente HTTP |
| **AsyncStorage** | 2.2.0 | Armazenamento local |
| **NativeWind** | 2.0.11 | TailwindCSS para React Native |

---

##  Autenticação

###  Credenciais Padrão

####  **Admin (Frontend Web)**
```
 Email: admin@shiftbox.com
 Senha: admin123
 Função: Administrador completo
```

####  **Usuários de Teste (Mobile)**
```
 Usuário 1:
    Email: teste1@shiftbox.com
    Senha: teste123
    Saldo: R$ 1.000,00

 Usuário 2:
    Email: teste2@shiftbox.com
    Senha: teste456
    Saldo: R$ 2.000,00

 Usuário 3:
    Email: teste3@shiftbox.com
    Senha: teste789
    Saldo: R$ 1.500,00
```

###  Fluxo de Autenticação

1. **Registro:** `POST /auth/register` com dados do usuário
2. **Login:** `POST /auth/login` com email/senha
3. **Token:** JWT retornado válido por 30 minutos
4. **Autorização:** Header `Authorization: Bearer <token>`

###  Teste de Autenticação

```powershell
# Login via PowerShell
$body = @{
    username = "admin@shiftbox.com"
    password = "admin123"
}

$response = Invoke-RestMethod -Uri "http://localhost:8000/auth/login" -Method POST -ContentType "application/x-www-form-urlencoded" -Body ($body | ForEach-Object {$_.GetEnumerator() | ForEach-Object {"$($_.Key)=$($_.Value)"}} | Join-String -Separator "&")

$token = $response.access_token
Write-Host "Token: $token"

# Usar o token para acessar dados
$headers = @{ "Authorization" = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:8000/auth/me" -Headers $headers
```

---

##  Endpoints Principais

###  Autenticação (`/auth`)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/auth/register` | Registrar novo usuário |
| `POST` | `/auth/login` | Login (retorna JWT) |
| `GET` | `/auth/me` | Dados do usuário autenticado |

###  Usuários (`/users`)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/users` | Listar usuários (admin) |
| `GET` | `/users/{id}` | Buscar usuário específico |
| `PUT` | `/users/{id}` | Atualizar usuário |
| `DELETE` | `/users/{id}` | Deletar usuário (admin) |

###  Carteiras (`/wallets`)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/wallets` | Carteiras do usuário |
| `POST` | `/wallets` | Criar carteira |
| `GET` | `/wallets/{id}/transactions` | Histórico de transações |

###  Investimentos (`/investments`)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/investments` | Listar investimentos |
| `POST` | `/investments` | Criar investimento |
| `POST` | `/investments/preview` | Preview de rentabilidade |
| `POST` | `/investments/{id}/resgate` | Resgatar investimento |

###  Empréstimos (`/loans`)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/loans` | Listar empréstimos |
| `POST` | `/loans` | Solicitar empréstimo |
| `POST` | `/loans/preview` | Simular empréstimo |
| `GET` | `/loans/{id}/schedule` | Cronograma de pagamento |
| `PUT` | `/loans/{id}/approve` | Aprovar empréstimo (admin) |

###  KYC (`/kyc`)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/kyc/upload` | Upload de documentos |
| `GET` | `/kyc/documents` | Listar documentos |
| `PUT` | `/kyc/{id}/review` | Revisar documento (admin) |

###  Pool (`/pool`)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/pool/status` | Status do pool de liquidez |

---

##  Configuração Mobile

###  Configuração de Rede

O app mobile precisa se conectar ao backend rodando na sua máquina. A configuração está em `mobile/config/environment.ts`:

```typescript
// Configuração atual
const development: Environment = {
  API_URL: resolveApiUrl("http://192.168.17.72:8000"), // IP da máquina
  APP_VERSION: "0.1.0",
  ENVIRONMENT: "development",
  TIMEOUT: 10000,
};
```

###  **Configurar IP Correto:**

1. **Descobrir seu IP:**
   ```powershell
   ipconfig | findstr "IPv4"
   ```

2. **Atualizar ambiente (se necessário):**
   ```powershell
   # Se o IP da sua máquina for diferente de 192.168.17.72
   # Edite mobile/config/environment.ts
   # Substitua pela linha com seu IP correto
   ```

3. **Iniciar backend com IP correto:**
   ```powershell
   # IMPORTANTE: Use --host 0.0.0.0 (não 127.0.0.1)
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

###  Testando Conectividade

```powershell
# Teste se o mobile consegue acessar o backend
curl http://SEU-IP:8000/health

# Exemplo:
curl http://192.168.17.72:8000/health
```

###  Firewall Windows

Se o mobile não conseguir conectar, configure o firewall:

1. **Windows Defender Firewall**
2. **Configurações Avançadas**
3. **Regras de Entrada**
4. **Nova Regra...**
5. **Porta 8000 TCP**
6. **Permitir conexão**

---

##  Troubleshooting

###  Problemas Comuns e Soluções

####  **Backend não inicia**

**Problema:** `python: command not found` ou erro de dependências
```powershell
# Solução:
# 1. Verificar se Python está instalado
python --version
py --version

# 2. Criar ambiente virtual novamente
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1

# 3. Reinstalar dependências
pip install --upgrade pip
pip install -r requirements.txt

# 4. Configurar variáveis
$env:USE_SQLITE = "true"
$env:PYTHONIOENCODING = "utf-8"
```

**Problema:** `Porta 8000 já está em uso`
```powershell
# Solução: Encontrar e matar processo
netstat -ano | findstr ":8000"
taskkill /PID NUMERO_DO_PID /F

# Ou usar porta diferente
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

####  **Frontend não conecta com Backend**

**Problema:** `Network Error` ou `ECONNREFUSED`
```powershell
# Verificações:
# 1. Backend está rodando?
curl http://localhost:8000/health

# 2. Proxy configurado no vite.config.ts?
# 3. Limpar cache
cd frontend
rm -rf node_modules\.vite
npm install
npm run dev
```

#### 📱 **Mobile não conecta (Erro de CORS)**

**Problema:** `Access to XMLHttpRequest blocked by CORS`
```powershell
# Solução Completa:

# 1. Backend DEVE usar --host 0.0.0.0 (não 127.0.0.1)
cd backend
.\venv\Scripts\Activate.ps1
$env:USE_SQLITE = "true"
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 2. Descobrir IP da máquina
ipconfig | findstr "IPv4"

# 3. Verificar se mobile/config/environment.ts tem IP correto
# Exemplo: API_URL: "http://192.168.17.72:8000"

# 4. Testar conectividade
curl http://SEU-IP:8000/health

# 5. Configurar firewall Windows (se necessário)
# Windows Defender Firewall > Regras de Entrada > Nova Regra > Porta 8000 TCP
```

####  **Erro de Autenticação (401 Unauthorized)**

**Problema:** Login falhando ou usuários não existem
```powershell
# Solução:
cd backend
.\venv\Scripts\Activate.ps1
$env:USE_SQLITE = "true"

# Recriar usuários
python create_simple_admin.py
python create_mobile_users.py

# Testar login
$body = "username=admin@shiftbox.com&password=admin123"
Invoke-RestMethod -Uri "http://localhost:8000/auth/login" -Method POST -ContentType "application/x-www-form-urlencoded" -Body $body
```

####  **Erro de Banco de Dados**

**Problema:** Tabelas não existem ou banco corrompido
```powershell
# Solução - Recriar banco:
cd backend
.\venv\Scripts\Activate.ps1
$env:USE_SQLITE = "true"

# Apagar banco atual (CUIDADO: perde dados)
rm shiftbox_dev.db -Force

# Recriar banco
python init_sqlite.py
python create_simple_admin.py
python create_mobile_users.py

# Executar migrações
.\venv\Scripts\alembic.exe upgrade head
```

####  **Erro de Dependências Node.js**

**Problema:** `npm ERR!` ou módulos não encontrados
```powershell
# Solução Frontend:
cd frontend
rm -rf node_modules package-lock.json -Force
npm cache clean --force
npm install

# Solução Mobile:
cd mobile  
rm -rf node_modules package-lock.json -Force
npm cache clean --force
npm install
npx expo install --fix
```

####  **PowerShell Execution Policy**

**Problema:** `cannot be loaded because running scripts is disabled`
```powershell
# Solução (executar como Administrador):
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Ou temporariamente:
PowerShell -ExecutionPolicy Bypass -File script.ps1
```

####  **Problema de Rede/Proxy**

**Problema:** Downloads falham ou timeouts
```powershell
# Configurar proxy (se necessário):
npm config set proxy http://proxy:porta
npm config set https-proxy http://proxy:porta
pip install --proxy proxy:porta -r requirements.txt
```

####  **Expo não funciona**

**Problema:** QR Code não funciona ou app não abre
```powershell
# Soluções:
# 1. Limpar cache Expo
cd mobile
npx expo start --clear

# 2. Usar túnel
npx expo start --tunnel

# 3. Reinstalar Expo CLI
npm uninstall -g @expo/cli
npm install -g @expo/cli@latest

# 4. Verificar se está na mesma rede WiFi
```

###  **Script de Diagnóstico Rápido**

Salve como `diagnóstico.ps1`:

```powershell
Write-Host "=== DIAGNÓSTICO SHIFTBOX ===" -ForegroundColor Cyan

# Verificar Python
Write-Host "`n Python:" -ForegroundColor Yellow
python --version 2>$null
if ($LASTEXITCODE -ne 0) { Write-Host " Python não encontrado" -ForegroundColor Red }

# Verificar Node
Write-Host "`n Node.js:" -ForegroundColor Yellow  
node --version 2>$null
if ($LASTEXITCODE -ne 0) { Write-Host " Node.js não encontrado" -ForegroundColor Red }

# Verificar portas
Write-Host "`n Portas:" -ForegroundColor Yellow
$port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if ($port8000) { Write-Host " Porta 8000 (Backend) em uso" -ForegroundColor Green }
else { Write-Host " Porta 8000 (Backend) livre" -ForegroundColor Red }

if ($port3000) { Write-Host " Porta 3000 (Frontend) em uso" -ForegroundColor Green }
else { Write-Host " Porta 3000 (Frontend) livre" -ForegroundColor Red }

# Verificar arquivos
Write-Host "`n Arquivos:" -ForegroundColor Yellow
$files = @("backend\requirements.txt", "frontend\package.json", "mobile\package.json")
foreach ($file in $files) {
    if (Test-Path $file) { Write-Host " $file" -ForegroundColor Green }
    else { Write-Host " $file" -ForegroundColor Red }
}

Write-Host "`n=== FIM DIAGNÓSTICO ===" -ForegroundColor Cyan
```

###  **Suporte e Contato**

1.  **Primeiro:** Consulte esta documentação
2.  **Segundo:** Verifique logs no console/terminal
3.  **Terceiro:** Execute o script de diagnóstico
4.  **Último recurso:** Abra uma issue no repositório

---

##  Documentação Adicional

###  **Regras de Negócio**

####  Pool de Liquidez
- **Limite de 80%** - Utilização máxima do pool
- **Fila Automática** - Empréstimos acima de 80% entram em fila
- **Reprocessamento** - A cada transação, fila é reavaliada
- **Cálculo Tempo Real** - Utilização baseada em investimentos ativos

####  Cálculos Financeiros
- **Precisão Decimal** - Todos os cálculos usam `Decimal`
- **Juros Compostos** - Para investimentos
- **Juros Simples** - Para empréstimos
- **Accrual Diário** - Job automatizado de cálculo

####  Estados dos Empréstimos
| Estado | Descrição |
|--------|-----------|
| `pendente` | Aguardando aprovação |
| `aprovado` | Aprovado e ativo |
| `fila` | Em fila (pool >80%) |
| `rejeitado` | Rejeitado pelo admin |
| `cancelado` | Cancelado pelo usuário |

####  Status KYC
| Status | Descrição |
|--------|-----------|
| `pending` | Pendente de revisão |
| `approved` | Aprovado |
| `rejected` | Rejeitado |
| `requires_resubmission` | Requer reenvio |

###  **Testes**

```powershell
# Frontend - Testes básicos
cd frontend
npm test

# Backend - Testes unitários (futuro)
cd backend
.\venv\Scripts\Activate.ps1
pytest

# Mobile - Testes E2E (futuro)  
cd mobile
npx expo test
```

###  **Deploy e Produção**

####  Docker (Futuro)
```powershell
# Build e execução completa
docker-compose up --build

# Somente backend
docker-compose up backend

# Desenvolvimento
docker-compose -f docker-compose.dev.yml up
```

####  Deploy em Produção
1. **Backend:** Railway/Heroku + PostgreSQL
2. **Frontend:** Vercel/Netlify
3. **Mobile:** Build + publicação nas lojas (Play Store/App Store)

###  **Recursos Úteis**

-  **FastAPI Docs:** https://fastapi.tiangolo.com/
-  **React Docs:** https://react.dev/
-  **Expo Docs:** https://docs.expo.dev/
-  **TailwindCSS:** https://tailwindcss.com/
-  **SQLAlchemy:** https://sqlalchemy.org/

---

##  **Licença e Informações**

© 2025 ShiftBox. Projeto MVP para demonstração interna.
Uso restrito ao time de desenvolvimento.

**Desenvolvido pela equipe ShiftBox**

---

##  **Conclusão**

Este README fornece um guia completo para configurar e executar o projeto ShiftBox MVP no Windows. 

**Processo Resumido:**
1.  Instalar pré-requisitos
2.  Clonar repositório  
3.  Configurar backend Python
4.  Configurar frontend React
5.  Configurar mobile Expo
6.  Executar todos os projetos
7.  Testar funcionalidades

**Dicas Finais:**
- Use 3 terminais PowerShell separados
- Backend SEMPRE com `--host 0.0.0.0` para mobile
- Mantenha todos os serviços rodando simultaneamente
- Verifique firewall Windows se mobile não conectar

**URLs de Acesso:**
-  **Backend:** http://localhost:8000/docs
-  **Frontend:** http://localhost:3000
-  **Mobile:** App Expo Go + QR Code