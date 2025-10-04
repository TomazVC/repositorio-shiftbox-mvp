"""Pool dashboard API."""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Investment, Loan, Wallet

router = APIRouter(prefix="/pool", tags=["pool"])


class PoolResponse(BaseModel):
    saldo_total: float
    saldo_disponivel: float
    saldo_emprestado: float
    percentual_utilizacao: float
    total_investidores: int


@router.get("", response_model=PoolResponse)
async def get_pool_status(db: Session = Depends(get_db)) -> PoolResponse:
    saldo_total = db.query(func.coalesce(func.sum(Wallet.saldo), 0.0)).scalar()
    saldo_emprestado = (
        db.query(func.coalesce(func.sum(Loan.valor), 0.0))
        .filter(Loan.status.in_(["pendente", "ativo"]))
        .scalar()
    )
    saldo_disponivel = max((saldo_total or 0.0) - (saldo_emprestado or 0.0), 0.0)
    percentual_utilizacao = 0.0
    if saldo_total:
        percentual_utilizacao = round((saldo_emprestado or 0.0) / saldo_total * 100, 2)

    total_investidores = (
        db.query(func.count(func.distinct(Investment.user_id)))
        .filter(Investment.status == "ativo")
        .scalar()
    ) or 0

    return PoolResponse(
        saldo_total=float(saldo_total or 0.0),
        saldo_disponivel=float(saldo_disponivel),
        saldo_emprestado=float(saldo_emprestado or 0.0),
        percentual_utilizacao=percentual_utilizacao,
        total_investidores=int(total_investidores),
    )
