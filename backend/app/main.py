from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, investments, loans, pool, transactions, users, wallets

app = FastAPI(
    title="ShiftBox API",
    description="API para gerenciamento de pool de investimento e empréstimos",
    version="0.1.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especificar domínios
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


@app.get("/")
def read_root():
    return {
        "message": "ShiftBox API está rodando!",
        "version": "0.1.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}

