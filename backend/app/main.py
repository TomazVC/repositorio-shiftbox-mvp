import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, investments, loans, pool, transactions, users, wallets, kyc

# Carregar variáveis de ambiente do arquivo .env se existir
env_file = Path(__file__).parent.parent / ".env"
if env_file.exists():
    print(f"📁 Carregando .env de: {env_file}")
    with open(env_file, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key] = value
                print(f"🔧 {key} = {value}")
app = FastAPI(
    title="ShiftBox API",
    description="API para gerenciamento de pool de investimento e emprestimos",
    version="0.1.0"
)

# Configurar CORS - permitir todas as origens para desenvolvimento
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em producao, especificar dominios
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600  # Cache preflight por 1 hora
)

# Incluir rotas
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(pool.router)
app.include_router(users.router)
app.include_router(wallets.router)
app.include_router(investments.router)
app.include_router(loans.router)
app.include_router(transactions.router)
app.include_router(kyc.router)


@app.get("/")
def read_root():
    return {
        "message": "ShiftBox API esta rodando!",
        "version": "0.1.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "cors_enabled": True}


@app.options("/{path:path}")
def options_handler(path: str):
    return {"message": "CORS preflight"}

