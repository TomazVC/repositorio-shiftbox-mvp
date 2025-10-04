"""Loan API routes."""
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Investment, Loan, Transaction, User, Wallet
from app.schemas import (
    LoanApproval,
    LoanCreate,
    LoanPayment,
    LoanResponse,
    LoanRejection,
    LoanUpdate,
)

router = APIRouter(prefix="/loans", tags=["loans"])


APPROVAL_STATUSES = {"pendente", "ativo"}


def _get_loan_or_404(db: Session, loan_id: int) -> Loan:
    loan = db.query(Loan).filter(Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emprestimo nao encontrado")
    return loan


def _ensure_wallet_for_user(db: Session, user_id: int) -> Wallet:
    wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
    if wallet:
        return wallet
    wallet = Wallet(user_id=user_id, saldo=0.0)
    db.add(wallet)
    db.flush()
    return wallet


@router.get("", response_model=List[LoanResponse])
async def list_loans(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
) -> List[Loan]:
    query = db.query(Loan)
    if status_filter:
        query = query.filter(Loan.status == status_filter)
    if user_id is not None:
        query = query.filter(Loan.user_id == user_id)
    return query.order_by(Loan.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{loan_id}", response_model=LoanResponse)
async def get_loan(loan_id: int, db: Session = Depends(get_db)) -> Loan:
    return _get_loan_or_404(db, loan_id)


@router.post("", response_model=LoanResponse, status_code=status.HTTP_201_CREATED)
async def create_loan(payload: LoanCreate, db: Session = Depends(get_db)) -> Loan:
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario nao encontrado")

    loan = Loan(
        user_id=payload.user_id,
        valor=payload.valor,
        valor_pago=payload.valor_pago,
        taxa_juros=payload.taxa_juros,
        prazo_meses=payload.prazo_meses,
        status="pendente",
    )

    db.add(loan)
    db.commit()
    db.refresh(loan)
    return loan


@router.patch("/{loan_id}", response_model=LoanResponse)
async def update_loan(loan_id: int, payload: LoanUpdate, db: Session = Depends(get_db)) -> Loan:
    loan = _get_loan_or_404(db, loan_id)
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(loan, key, value)
    db.add(loan)
    db.commit()
    db.refresh(loan)
    return loan


@router.post("/{loan_id}/approve", response_model=LoanResponse)
async def approve_loan(
    loan_id: int,
    payload: LoanApproval,
    db: Session = Depends(get_db),
) -> Loan:
    loan = _get_loan_or_404(db, loan_id)
    if loan.status not in {"pendente", "reavaliacao"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Emprestimo nao esta pendente")

    pool_total = (
        db.query(func.coalesce(func.sum(Investment.valor), 0))
        .filter(Investment.status == "ativo")
        .scalar()
    )

    emprestado_total = (
        db.query(func.coalesce(func.sum(Loan.valor), 0))
        .filter(Loan.id != loan.id)
        .filter(Loan.status.in_(APPROVAL_STATUSES))
        .scalar()
    )

    if pool_total <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Pool nao possui recursos disponiveis")

    if emprestado_total + loan.valor > pool_total * 0.8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limite de 80% do pool excedido para aprovacao",
        )

    if payload.taxa_juros is not None:
        loan.taxa_juros = payload.taxa_juros
    if payload.prazo_meses is not None:
        loan.prazo_meses = payload.prazo_meses

    loan.status = "ativo"
    loan.approved_at = datetime.utcnow()

    wallet = _ensure_wallet_for_user(db, loan.user_id)
    wallet.saldo += loan.valor

    transaction = Transaction(
        wallet_id=wallet.id,
        tipo="emprestimo_recebido",
        valor=loan.valor,
        descricao="Valor liberado de emprestimo",
        related_loan_id=loan.id,
    )
    db.add(transaction)
    db.add(loan)
    db.add(wallet)
    db.commit()
    db.refresh(loan)
    return loan


@router.post("/{loan_id}/reject", response_model=LoanResponse)
async def reject_loan(
    loan_id: int,
    payload: LoanRejection,
    db: Session = Depends(get_db),
) -> Loan:
    loan = _get_loan_or_404(db, loan_id)
    if loan.status != "pendente":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Apenas emprestimos pendentes podem ser rejeitados")

    loan.status = "rejeitado"
    loan.motivo_rejeicao = payload.motivo_rejeicao
    db.add(loan)
    db.commit()
    db.refresh(loan)
    return loan


@router.post("/{loan_id}/pay", response_model=LoanResponse)
async def pay_loan(
    loan_id: int,
    payload: LoanPayment,
    db: Session = Depends(get_db),
) -> Loan:
    loan = _get_loan_or_404(db, loan_id)
    if loan.status not in {"ativo", "pendente"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Emprestimo nao esta ativo")

    wallet = _ensure_wallet_for_user(db, loan.user_id)

    if wallet.saldo < payload.valor_pagamento:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Saldo insuficiente na carteira")

    wallet.saldo -= payload.valor_pagamento
    loan.valor_pago += payload.valor_pagamento

    valor_total = loan.valor_total_com_juros
    if loan.valor_pago >= valor_total:
        loan.status = "pago"
        loan.paid_at = datetime.utcnow()
        loan.valor_pago = valor_total

    transaction = Transaction(
        wallet_id=wallet.id,
        tipo="pagamento_emprestimo",
        valor=payload.valor_pagamento,
        descricao="Pagamento de parcela de emprestimo",
        related_loan_id=loan.id,
    )

    db.add(transaction)
    db.add(wallet)
    db.add(loan)
    db.commit()
    db.refresh(loan)
    return loan


@router.delete("/{loan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_loan(loan_id: int, db: Session = Depends(get_db)) -> Response:
    loan = _get_loan_or_404(db, loan_id)
    if loan.status not in {"pendente", "rejeitado"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="So e possivel excluir emprestimos pendentes ou rejeitados")

    db.delete(loan)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

