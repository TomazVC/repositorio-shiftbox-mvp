"""Pool dashboard API."""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.db import get_db
from app.services.pool_service import (
    POOL_THRESHOLD,
    active_investors_count,
    get_pool_totals,
    queued_loans_count,
)
from app.models import User

router = APIRouter(prefix="/pool", tags=["pool"])


class PoolResponse(BaseModel):
    saldo_total: float
    saldo_disponivel: float
    saldo_emprestado: float
    percentual_utilizacao: float
    total_investidores: int
    emprestimos_em_fila: int
    limite_utilizacao: float


@router.get("", response_model=PoolResponse)
async def get_pool_status(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> PoolResponse:
    total_investido, total_comprometido = get_pool_totals(db)
    saldo_disponivel = max(total_investido - total_comprometido, 0.0)
    percentual_utilizacao = 0.0
    if total_investido:
        percentual_utilizacao = round((total_comprometido / total_investido) * 100, 2)

    return PoolResponse(
        saldo_total=total_investido,
        saldo_disponivel=saldo_disponivel,
        saldo_emprestado=total_comprometido,
        percentual_utilizacao=percentual_utilizacao,
        total_investidores=active_investors_count(db),
        emprestimos_em_fila=queued_loans_count(db),
        limite_utilizacao=POOL_THRESHOLD * 100,
    )
