from fastapi import APIRouter, Depends
from pydantic import BaseModel

router = APIRouter()


class PoolResponse(BaseModel):
    saldo_total: float
    saldo_disponivel: float
    saldo_emprestado: float
    percentual_utilizacao: float
    total_investidores: int


@router.get("", response_model=PoolResponse)
async def get_pool_status():
    """
    Retorna o status atual do pool de investimentos.
    Para MVP, retorna dados mockados.
    """
    saldo_total = 1000000.0
    saldo_emprestado = 350000.0
    saldo_disponivel = saldo_total - saldo_emprestado
    percentual_utilizacao = (saldo_emprestado / saldo_total) * 100
    
    return PoolResponse(
        saldo_total=saldo_total,
        saldo_disponivel=saldo_disponivel,
        saldo_emprestado=saldo_emprestado,
        percentual_utilizacao=round(percentual_utilizacao, 2),
        total_investidores=45
    )

