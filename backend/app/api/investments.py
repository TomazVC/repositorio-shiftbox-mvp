"""Investment API routes."""
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Investment, Transaction, User, Wallet
from app.schemas import InvestmentCreate, InvestmentResponse, InvestmentUpdate

router = APIRouter(prefix="/investments", tags=["investments"])


def _get_investment_or_404(db: Session, investment_id: int) -> Investment:
    investment = db.query(Investment).filter(Investment.id == investment_id).first()
    if not investment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investimento nao encontrado")
    return investment


@router.get("", response_model=List[InvestmentResponse])
async def list_investments(
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
) -> List[Investment]:
    query = db.query(Investment)
    if user_id is not None:
        query = query.filter(Investment.user_id == user_id)
    return query.order_by(Investment.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{investment_id}", response_model=InvestmentResponse)
async def get_investment(investment_id: int, db: Session = Depends(get_db)) -> Investment:
    return _get_investment_or_404(db, investment_id)


@router.post("", response_model=InvestmentResponse, status_code=status.HTTP_201_CREATED)
async def create_investment(payload: InvestmentCreate, db: Session = Depends(get_db)) -> Investment:
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario nao encontrado")

    wallet = db.query(Wallet).filter(Wallet.user_id == payload.user_id).first()
    if not wallet:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Usuario nao possui carteira")

    if wallet.saldo < payload.valor:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Saldo insuficiente na carteira")

    investment = Investment(
        user_id=payload.user_id,
        valor=payload.valor,
        taxa_rendimento=payload.taxa_rendimento,
        rendimento_acumulado=payload.rendimento_acumulado,
        status=payload.status,
    )

    wallet.saldo -= payload.valor

    db.add(investment)
    db.flush()

    transaction = Transaction(
        wallet_id=wallet.id,
        tipo="investimento",
        valor=payload.valor,
        descricao="Aplicacao no pool",
        related_investment_id=investment.id,
    )
    db.add(transaction)

    db.commit()
    db.refresh(investment)
    return investment


@router.patch("/{investment_id}", response_model=InvestmentResponse)
async def update_investment(
    investment_id: int,
    payload: InvestmentUpdate,
    db: Session = Depends(get_db),
) -> Investment:
    investment = _get_investment_or_404(db, investment_id)
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(investment, key, value)
    db.add(investment)
    db.commit()
    db.refresh(investment)
    return investment


@router.post("/{investment_id}/redeem", response_model=InvestmentResponse)
async def redeem_investment(investment_id: int, db: Session = Depends(get_db)) -> Investment:
    investment = _get_investment_or_404(db, investment_id)
    if investment.status == "resgatado":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Investimento ja resgatado")

    wallet = db.query(Wallet).filter(Wallet.user_id == investment.user_id).first()
    if not wallet:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Carteira nao encontrada para o usuario")

    total_resgate = investment.valor + (investment.rendimento_acumulado or 0)
    wallet.saldo += total_resgate

    investment.status = "resgatado"
    investment.resgatado_at = datetime.utcnow()

    transaction = Transaction(
        wallet_id=wallet.id,
        tipo="resgate_investimento",
        valor=total_resgate,
        descricao="Resgate de investimento",
        related_investment_id=investment.id,
    )
    db.add(transaction)
    db.add(investment)
    db.commit()
    db.refresh(investment)
    return investment


@router.delete("/{investment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_investment(investment_id: int, db: Session = Depends(get_db)) -> Response:
    investment = _get_investment_or_404(db, investment_id)
    if investment.status == "resgatado":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Investimento ja resgatado")

    wallet = db.query(Wallet).filter(Wallet.user_id == investment.user_id).first()
    if not wallet:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Carteira nao encontrada para o usuario")

    wallet.saldo += investment.valor

    transaction = Transaction(
        wallet_id=wallet.id,
        tipo="cancelamento_investimento",
        valor=investment.valor,
        descricao="Cancelamento de investimento",
        related_investment_id=investment.id,
    )
    db.add(transaction)
    db.add(wallet)
    db.delete(investment)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

