"""Loan API routes."""
from datetime import datetime, date
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.db import get_db
from app.models import Investment, Loan, Transaction, User, Wallet
from app.schemas import (
    LoanApproval,
    LoanCreate,
    LoanPayment,
    LoanPreviewRequest,
    LoanPreviewResponse,
    LoanResponse,
    LoanRejection,
    LoanUpdate,
)
from app.services.finance_service import calculate_loan_preview
from app.services.pool_service import (
    next_queue_position,
    process_loan_queue,
    should_enqueue,
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


@router.post("/preview", response_model=LoanPreviewResponse)
async def preview_loan(
    payload: LoanPreviewRequest,
    _: User = Depends(get_current_user),
) -> LoanPreviewResponse:
    return calculate_loan_preview(payload)


@router.get("/{loan_id}/schedule", response_model=LoanPreviewResponse)
async def get_loan_schedule(
    loan_id: int,
    primeira_parcela: Optional[date] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> LoanPreviewResponse:
    loan = _get_loan_or_404(db, loan_id)
    req = LoanPreviewRequest(
        valor=Decimal(str(loan.valor)),
        taxa_juros=Decimal(str(loan.taxa_juros)),
        prazo_meses=loan.prazo_meses,
        sistema="price",
        primeira_parcela=primeira_parcela or (loan.created_at.date() if loan.created_at else date.today()),
    )
    return calculate_loan_preview(req)


@router.get("", response_model=List[LoanResponse])
async def list_loans(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> List[Loan]:
    query = db.query(Loan)
    if status_filter:
        query = query.filter(Loan.status == status_filter)
    if user_id is not None:
        query = query.filter(Loan.user_id == user_id)
    return query.order_by(Loan.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{loan_id}", response_model=LoanResponse)
async def get_loan(
    loan_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> Loan:
    return _get_loan_or_404(db, loan_id)


@router.post("", response_model=LoanResponse, status_code=status.HTTP_201_CREATED)
async def create_loan(
    payload: LoanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Loan:
    if current_user.id != payload.user_id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sem permissao para solicitar emprestimo para outro usuario")

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

    if should_enqueue(db, payload.valor):
        loan.status = "fila"
        loan.queue_position = next_queue_position(db)

    db.add(loan)
    db.commit()
    db.refresh(loan)
    return loan


@router.patch("/{loan_id}", response_model=LoanResponse)
async def update_loan(
    loan_id: int,
    payload: LoanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Loan:
    loan = _get_loan_or_404(db, loan_id)
    if loan.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sem permissao para alterar este emprestimo")

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
    current_user: User = Depends(get_current_user),
) -> Loan:
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Apenas administradores podem aprovar emprestimos")

    loan = _get_loan_or_404(db, loan_id)
    if loan.status == "fila":
        return loan
    if loan.status not in {"pendente", "reavaliacao"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Emprestimo nao esta pendente")

    pool_total = (
        db.query(func.coalesce(func.sum(Investment.valor), 0))
        .filter(Investment.status == "ativo")
        .scalar()
    ) or 0

    emprestado_total = (
        db.query(func.coalesce(func.sum(Loan.valor), 0))
        .filter(Loan.id != loan.id)
        .filter(Loan.status.in_(APPROVAL_STATUSES))
        .scalar()
    ) or 0

    if pool_total <= 0 or emprestado_total + loan.valor > pool_total * 0.8:
        loan.status = "fila"
        loan.queue_position = loan.queue_position or next_queue_position(db)
        db.add(loan)
        db.commit()
        db.refresh(loan)
        return loan

    if payload.taxa_juros is not None:
        loan.taxa_juros = payload.taxa_juros
    if payload.prazo_meses is not None:
        loan.prazo_meses = payload.prazo_meses

    loan.status = "ativo"
    loan.approved_at = datetime.utcnow()
    loan.queue_position = None

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
    current_user: User = Depends(get_current_user),
) -> Loan:
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Apenas administradores podem rejeitar emprestimos")

    loan = _get_loan_or_404(db, loan_id)
    if loan.status not in {"pendente", "fila"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Apenas emprestimos pendentes ou na fila podem ser rejeitados")

    loan.status = "rejeitado"
    loan.motivo_rejeicao = payload.motivo_rejeicao
    loan.queue_position = None
    db.add(loan)
    db.commit()
    db.refresh(loan)
    process_loan_queue(db)
    return loan


@router.post("/{loan_id}/pay", response_model=LoanResponse)
async def pay_loan(
    loan_id: int,
    payload: LoanPayment,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Loan:
    loan = _get_loan_or_404(db, loan_id)
    if loan.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sem permissao para pagar este emprestimo")
    if loan.status not in {"ativo", "pendente"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Emprestimo nao esta ativo")

    wallet = _ensure_wallet_for_user(db, loan.user_id)

    if wallet.saldo < payload.valor_pagamento:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Saldo insuficiente na carteira")

    valor_pagamento = Decimal(str(payload.valor_pagamento))
    wallet.saldo -= float(valor_pagamento)

    juros_pendentes = Decimal(str(loan.interest_accrued))
    if juros_pendentes > 0:
        abatimento_juros = min(valor_pagamento, juros_pendentes)
        loan.interest_accrued = float(juros_pendentes - abatimento_juros)
        valor_pagamento -= abatimento_juros

    if valor_pagamento > 0:
        loan.valor_pago += float(valor_pagamento)

    valor_total = loan.valor_total_com_juros + loan.interest_accrued
    if loan.valor_pago >= valor_total:
        loan.status = "pago"
        loan.paid_at = datetime.utcnow()
        loan.valor_pago = valor_total

    transaction = Transaction(
        wallet_id=wallet.id,
        tipo="pagamento_emprestimo",
        valor=float(payload.valor_pagamento),
        descricao="Pagamento de emprestimo (juros priorizados)",
        related_loan_id=loan.id,
    )

    db.add(transaction)
    db.add(wallet)
    db.add(loan)
    db.commit()
    db.refresh(loan)

    process_loan_queue(db)
    return loan


@router.delete("/{loan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_loan(
    loan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Apenas administradores podem remover emprestimos")

    loan = _get_loan_or_404(db, loan_id)
    if loan.status not in {"pendente", "rejeitado", "fila"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="So e possivel excluir emprestimos pendentes, em fila ou rejeitados")

    db.delete(loan)
    db.commit()
    process_loan_queue(db)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

