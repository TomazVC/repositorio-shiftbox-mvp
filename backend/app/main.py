from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, investments, kyc, loans, pool, transactions, users, wallets

app = FastAPI(
    title="ShiftBox API",
    description="API para gerenciamento de pool de investimento e emprestimos",
    version="0.1.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em producao, especificar dominios
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    return {"status": "healthy"}

