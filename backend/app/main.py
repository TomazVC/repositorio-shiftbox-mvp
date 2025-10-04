from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, pool

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
app.include_router(pool.router, prefix="/pool", tags=["pool"])


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

