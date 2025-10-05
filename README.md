# ShiftBox MVP - Plataforma P2P de Investimentos

![ShiftBox](https://img.shields.io/badge/ShiftBox-MVP-blue)
![Status](https://img.shields.io/badge/Status-Produção-brightgreen)
![Backend](https://img.shields.io/badge/Backend-FastAPI-green)
![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Mobile](https://img.shields.io/badge/Mobile-React%20Native-purple)

Plataforma completa para gestão de investimentos e empréstimos P2P com pool compartilhado de liquidez, interface web administrativa e aplicativo móvel.

## Índice

- [Arquitetura do Projeto](#arquitetura-do-projeto)
- [Stack Tecnológica](#stack-tecnológica)
- [Início Rápido](#início-rápido)
- [Backend - API](#backend---api)
- [Frontend - Painel Admin](#frontend---painel-admin)
- [Mobile - App Cliente](#mobile---app-cliente)
- [Endpoints Principais](#endpoints-principais)
- [Autenticação](#autenticação)
- [Regras de Negócio](#regras-de-negócio)
- [Testes](#testes)
- [Deploy](#deploy)
- [Troubleshooting](#troubleshooting)

## Arquitetura do Projeto

```
shiftbox-mvp/
├── backend/             # API FastAPI + SQLAlchemy
│   ├── app/             # Código da aplicação
│   │   ├── api/         # Endpoints REST
│   │   ├── models/      # Modelos SQLAlchemy
│   │   ├── schemas/     # Schemas Pydantic
│   │   └── services/    # Lógica de negócio
│   ├── alembic/         # Migrations de banco
│   ├── uploads/         # Arquivos KYC
│   └── shiftbox_dev.db  # Banco SQLite (dev)
├── frontend/            # Painel Admin (React + Vite)
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── pages/       # Páginas da aplicação
│   │   ├── services/    # Integração com APIs
│   │   ├── hooks/       # Hooks customizados
│   │   └── utils/       # Utilitários
├── mobile/              # App Cliente (React Native + Expo)
│   ├── screens/         # Telas do aplicativo
│   ├── services/        # Integração com APIs
│   └── navigation/      # Navegação
└── docs/                # Documentação
```

## Stack Tecnológica

### Backend
- **Python 3.12** - Linguagem principal
- **FastAPI 0.104** - Framework web moderno e rápido
- **SQLAlchemy 2.x** - ORM para banco de dados
- **Alembic** - Migrations de banco
- **SQLite** - Banco local (desenvolvimento) / PostgreSQL (produção)
- **JWT** - Autenticação com python-jose + passlib/bcrypt
- **Decimal** - Cálculos financeiros precisos
- **Uvicorn** - Servidor ASGI

### Frontend
- **React 18** - Biblioteca de interface
- **Vite** - Build tool moderna
- **TypeScript** - Tipagem estática
- **TailwindCSS** - Framework CSS utilitário
- **React Query** - Gerenciamento de estado servidor
- **Axios** - Cliente HTTP
- **React Router** - Roteamento

### Mobile
- **React Native** - Framework mobile
- **Expo** - Plataforma de desenvolvimento
- **TypeScript** - Tipagem estática
- **React Navigation** - Navegação nativa
- **Axios** - Cliente HTTP
- **AsyncStorage** - Armazenamento local

## Início Rápido

### Pré-requisitos

- **Python 3.12+** 
- **Node.js 18+**
- **npm ou yarn**
- **Git**

### Instalação Completa

```cmd
# 1. Clone o repositório
git clone https://github.com/seu-usuario/repositorio-shiftbox-mvp.git
cd repositorio-shiftbox-mvp

# 2. Configure o backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# 3. Configure o frontend
cd ..\frontend
npm install

# 4. Configure o mobile
cd ..\mobile
npm install
```

### Execução

**Terminal 1 - Backend:**
```cmd
cd backend
venv\Scripts\activate
set USE_SQLITE=true
set PYTHONIOENCODING=utf-8
python fix_users.py
python create_mobile_users.py
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```cmd
cd frontend
npm run dev
```

**Terminal 3 - Mobile (opcional):**
```cmd
cd mobile
npx expo start
```

### Acesso

- **API Backend:** http://localhost:8000
- **Swagger/Docs:** http://localhost:8000/docs
- **Frontend Admin:** http://localhost:3000
- **Mobile:** Expo App ou Emulador

## Backend - API

### Execução Passo a Passo

```cmd
# 1. Navegue para o backend
cd backend

# 2. Ative o ambiente virtual
venv\Scripts\activate

# 3. Configure variáveis de ambiente
set USE_SQLITE=true
set PYTHONIOENCODING=utf-8

# 4. Execute migrations
venv\Scripts\alembic.exe upgrade head

# 5. Crie usuário admin
python create_simple_admin.py

# 6. Popule dados de teste (opcional)
python seed_data.py

# 7. Inicie o servidor
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Scripts Disponíveis

| Script | Função |
|--------|--------|
| `create_simple_admin.py` | Criar usuário admin |
| `create_mobile_users.py` | Criar usuários de teste para mobile |
| `seed_data.py` | Popular dados de teste |
| `accrual_job.py` | Job diário de cálculo de juros |
| `inspect_db.py` | Inspecionar dados do banco |

### Script de Configuração Rápida

```cmd
# Script completo para configurar e iniciar o backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
set USE_SQLITE=true
set PYTHONIOENCODING=utf-8
venv\Scripts\alembic.exe upgrade head
python create_simple_admin.py
python create_mobile_users.py
python seed_data.py
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Frontend - Painel Admin

### Execução

```cmd
cd frontend

# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

### Funcionalidades

- **Login/Logout** - Autenticação segura
- **Gestão de Usuários** - CRUD completo
- **Gestão de Carteiras** - Saldos e transações
- **Investimentos** - Visualização e gestão
- **Empréstimos** - Aprovação e acompanhamento
- **KYC** - Upload e validação de documentos
- **Dashboard** - Métricas em tempo real

### Componentes

- **LoadingSpinner** - Feedback visual de carregamento
- **LoadingButton** - Botão com estado de loading
- **ErrorMessage** - Mensagens de erro padronizadas
- **SuccessMessage** - Feedback de sucesso
- **Input** - Campo de entrada melhorado
- **Toast** - Notificações temporárias

## Mobile - App Cliente

### Execução

```cmd
cd mobile

# Instalar dependências
npm install

# Iniciar Expo
npx expo start

# Executar no Android
npx expo start --android

# Executar no iOS
npx expo start --ios
```

### Telas

- **Login/Registro** - Autenticação
- **Dashboard** - Visão geral da conta
- **Investimentos** - Realizar aportes
- **Empréstimos** - Solicitar crédito
- **Transações** - Histórico financeiro
- **Carteira** - Saldo e movimentações
- **Credit Score** - Análise de crédito
- **Notificações** - Alertas importantes

## Endpoints Principais

### Autenticação (`/auth`)
- `POST /auth/register` - Registro de usuário
- `POST /auth/login` - Login (retorna JWT)
- `GET /auth/me` - Dados do usuário autenticado

### Usuários (`/users`)
- `GET /users` - Listar usuários (admin)
- `GET /users/{id}` - Buscar usuário específico
- `PUT /users/{id}` - Atualizar usuário
- `DELETE /users/{id}` - Deletar usuário (admin)

### Carteiras (`/wallets`)
- `GET /wallets` - Carteiras do usuário
- `POST /wallets` - Criar carteira
- `GET /wallets/{id}/transactions` - Histórico de transações

### Investimentos (`/investments`)
- `GET /investments` - Listar investimentos
- `POST /investments` - Criar investimento
- `POST /investments/preview` - Preview de rentabilidade
- `POST /investments/{id}/resgate` - Resgatar investimento

### Empréstimos (`/loans`)
- `GET /loans` - Listar empréstimos
- `POST /loans` - Solicitar empréstimo
- `POST /loans/preview` - Simular empréstimo
- `GET /loans/{id}/schedule` - Cronograma de pagamento
- `PUT /loans/{id}/approve` - Aprovar empréstimo (admin)

### KYC (`/kyc`)
- `POST /kyc/upload` - Upload de documentos
- `GET /kyc/documents` - Listar documentos
- `PUT /kyc/{id}/review` - Revisar documento (admin)

### Pool (`/pool`)
- `GET /pool/status` - Status do pool de liquidez

## Autenticação

### Credenciais Padrão

**Admin (Frontend Web):**
```
Email: admin@shiftbox.com
Senha: admin123
```

**Usuários de Teste (Mobile):**
```
Usuário 1: teste1@shiftbox.com / teste123
Usuário 2: teste2@shiftbox.com / teste456
Usuário 3: teste3@shiftbox.com / teste789
```

### Fluxo OAuth2

1. **Registro:** `POST /auth/register` com dados do usuário
2. **Login:** `POST /auth/login` com email/senha
3. **Token:** JWT retornado válido por 30 minutos
4. **Autorização:** Header `Authorization: Bearer <token>`

### Exemplo de Teste

```cmd
# Login (Windows cmd)
curl -X POST "http://localhost:8000/auth/login" ^
  -H "Content-Type: application/x-www-form-urlencoded" ^
  -d "username=admin@shiftbox.com&password=admin123"

# Usar o token retornado
curl -X GET "http://localhost:8000/auth/me" ^
  -H "Authorization: Bearer <seu-token-jwt>"

# Alternativa com PowerShell (se disponível)
Invoke-RestMethod -Uri "http://localhost:8000/auth/login" -Method POST -ContentType "application/x-www-form-urlencoded" -Body "username=admin@shiftbox.com&password=admin123"
```

## Regras de Negócio

### Pool de Liquidez
- **Limite de 80%** - Utilização máxima do pool
- **Fila Automática** - Empréstimos acima de 80% entram em fila
- **Reprocessamento** - A cada transação, a fila é reavaliada
- **Cálculo em Tempo Real** - Utilização baseada em investimentos ativos

### Cálculos Financeiros
- **Precisão Decimal** - Todos os cálculos usam `Decimal`
- **Juros Compostos** - Para investimentos
- **Juros Simples** - Para empréstimos
- **Accrual Diário** - Job automatizado de cálculo de juros

### Estados dos Empréstimos
- `pendente` - Aguardando aprovação
- `aprovado` - Aprovado e ativo
- `fila` - Em fila (pool >80%)
- `rejeitado` - Rejeitado
- `cancelado` - Cancelado pelo usuário

### Status KYC
- `pending` - Pendente de revisão
- `approved` - Aprovado
- `rejected` - Rejeitado
- `requires_resubmission` - Requer reenvio

## Testes

### Executar Testes

```cmd
cd frontend

# Testes básicos (sem framework)
npm test

# Com Vitest (se instalado)
npm run test:vitest

# Cobertura
npm run test:coverage
```

### Estrutura de Testes

```
frontend/src/__tests__/
├── userService.test.ts      # Testes do userService
├── validation.test.ts       # Testes de validação
└── components/             # Testes de componentes
```

### Documentação

Ver `frontend/TESTS.md` para guia completo de testes.

## Deploy

### Docker (Futuro)

```cmd
# Build e execução
docker-compose up --build

# Somente backend
docker-compose up backend

# Desenvolvimento
docker-compose -f docker-compose.dev.yml up
```

### Produção

1. **Backend:** Deploy no Railway/Heroku com PostgreSQL
2. **Frontend:** Build + deploy no Vercel/Netlify
3. **Mobile:** Build + publicação nas lojas

## Troubleshooting

### Problemas Comuns

#### Backend não inicia
```cmd
# Verificar Python
python --version

# Reinstalar dependências
pip install -r requirements.txt --force-reinstall

# Verificar porta
netstat -an | findstr ":8000"

# Reativar ambiente virtual
venv\Scripts\activate
set USE_SQLITE=true
```

#### Frontend não conecta
```cmd
# Verificar se backend está rodando
curl http://localhost:8000/health

# Limpar cache
npm run build
rmdir /s node_modules\.vite

# Reinstalar dependências
npm install
```

#### Erro de CORS
```cmd
# Verificar configuração do proxy no vite.config.ts
# Garantir que backend está na porta 8000
# Verificar se variáveis de ambiente estão configuradas
echo %USE_SQLITE%
```

#### Erro de bcrypt
```cmd
# Usar create_simple_admin.py em vez de create_admin.py
cd backend
venv\Scripts\activate
set USE_SQLITE=true
python create_simple_admin.py
```

#### Mobile não conecta
```cmd
# 1. Verificar se backend está rodando com --host 0.0.0.0
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 2. Descobrir IP da máquina
ipconfig | findstr "IPv4"

# 3. O arquivo config/environment.ts já está configurado com IP correto
# Exemplo: API_URL: "http://192.168.17.72:8000"

# 4. Verificar firewall do Windows
# Permitir conexões na porta 8000

# 5. Criar usuários de teste para mobile
cd backend
venv\Scripts\activate
set USE_SQLITE=true
python create_mobile_users.py

# 6. Testar conexão do mobile
curl http://192.168.17.72:8000/health
```

#### Erro de CORS no Mobile
```cmd
# O erro "Access to XMLHttpRequest blocked by CORS" indica:
# 1. Backend não está acessível do mobile
# 2. Verificar se backend está com --host 0.0.0.0
# 3. Verificar se mobile está usando IP correto da máquina
# 4. Verificar firewall

# Testar conectividade:
curl -X POST "http://192.168.17.72:8000/auth/login" ^
  -H "Content-Type: application/x-www-form-urlencoded" ^
  -d "username=teste1@shiftbox.com&password=teste123"

# Se retornar 401, execute:
cd backend
venv\Scripts\activate
set USE_SQLITE=true
python fix_users.py
python create_mobile_users.py

# Em seguida reinicie o backend:
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Suporte

Para problemas ou dúvidas:
1. Verifique este README
2. Consulte a documentação no `/docs`
3. Analise os logs do console
4. Abra uma issue no repositório

## Licença

© 2025 ShiftBox. Projeto MVP para demonstração interna.
Uso restrito ao time de desenvolvimento.

---

**Desenvolvido pela equipe ShiftBox**

