# 📦 Guia de Instalação - Backend ShiftBox

## ✅ Pré-requisitos

- **Python 3.8+** instalado
- **PowerShell** (Windows)
- **Git** (para clonar o repositório)

---

## 🚀 Instalação Rápida (Recomendado)

Execute o script automático na pasta `backend`:

```powershell
.\setup.ps1
```

Este script irá:
1. ✅ Verificar Python
2. ✅ Criar ambiente virtual
3. ✅ Instalar todas as dependências
4. ✅ Configurar arquivo .env
5. ✅ Validar instalação

---

## 🔧 Instalação Manual

Se preferir fazer passo a passo:

### 1. Criar ambiente virtual

```powershell
python -m venv venv
```

### 2. Ativar ambiente virtual

```powershell
.\venv\Scripts\Activate.ps1
```

### 3. Atualizar pip

```powershell
python -m pip install --upgrade pip
```

### 4. Instalar dependências

```powershell
pip install -r requirements.txt
```

### 5. Criar arquivo .env

Crie um arquivo `.env` na pasta `backend` com:

```env
USE_SQLITE=true
SECRET_KEY=shiftbox-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## 📦 Dependências Instaladas

### FastAPI e Servidor
- `fastapi` - Framework web moderno
- `uvicorn` - Servidor ASGI

### Banco de Dados
- `sqlalchemy` - ORM para Python
- `alembic` - Migrations de banco de dados
- `psycopg2-binary` - Driver PostgreSQL (opcional)

### Autenticação e Segurança
- `python-jose` - JWT tokens
- `passlib` - Hashing de senhas (bcrypt)

### Validação
- `pydantic` - Validação de dados
- `python-multipart` - Upload de arquivos

### Utilitários
- `python-dotenv` - Variáveis de ambiente
- `python-dateutil` - Manipulação de datas

---

## ✅ Verificar Instalação

Execute para verificar se tudo está instalado:

```powershell
# Verificar FastAPI
python -c "import fastapi; print('FastAPI:', fastapi.__version__)"

# Verificar SQLAlchemy
python -c "import sqlalchemy; print('SQLAlchemy:', sqlalchemy.__version__)"

# Verificar Alembic
alembic --version
```

---

## 🔍 Solução de Problemas

### Erro: "Execution of scripts is disabled"

Execute como Administrador:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Erro ao instalar psycopg2-binary

Se não for usar PostgreSQL, comente a linha no `requirements.txt`:
```
# psycopg2-binary==2.9.9
```

### Erro: "Microsoft Visual C++ 14.0 is required"

Instale o Visual C++ Build Tools:
https://visualstudio.microsoft.com/visual-cpp-build-tools/

---

## 🎯 Próximos Passos

Após a instalação bem-sucedida:

1. **Criar modelos do banco** (User, Wallet, Investment, Loan)
2. **Configurar Alembic** (migrations)
3. **Gerar tabelas** (`alembic upgrade head`)
4. **Popular banco** (`python seed_data.py`)
5. **Iniciar API** (`python -m uvicorn app.main:app --reload`)

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique se Python 3.8+ está instalado
2. Verifique se o ambiente virtual está ativado
3. Tente reinstalar as dependências: `pip install -r requirements.txt --force-reinstall`

