"""Transaction API routes."""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.db import get_db
from app.models import Transaction, User, Wallet
from app.schemas import TransactionCreate, TransactionResponse, TransactionUpdate

router = APIRouter(prefix="/transactions", tags=["transactions"])


BALANCE_INCREMENTS = {
    "deposito",
    "rendimento",
    "emprestimo_recebido",
    "resgate_investimento",
}
BALANCE_DECREMENTS = {
    "saque",
    "investimento",
    "pagamento_emprestimo",
}


def _get_transaction_or_404(db: Session, transaction_id: int) -> Transaction:
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transacao nao encontrada")
    return transaction


@router.get("", response_model=List[TransactionResponse])
async def list_transactions(
    skip: int = 0,
    limit: int = 100,
    wallet_id: Optional[int] = None,
    tipo: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> List[Transaction]:
    query = db.query(Transaction)
    if wallet_id is not None:
        query = query.filter(Transaction.wallet_id == wallet_id)
    if tipo:
        query = query.filter(Transaction.tipo == tipo)
    return query.order_by(Transaction.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> Transaction:
    return _get_transaction_or_404(db, transaction_id)


@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    payload: TransactionCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> Transaction:
    wallet = db.query(Wallet).filter(Wallet.id == payload.wallet_id).first()
    if not wallet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Carteira nao encontrada")

    transaction = Transaction(
        wallet_id=payload.wallet_id,
        tipo=payload.tipo,
        valor=payload.valor,
        descricao=payload.descricao,
        related_investment_id=payload.related_investment_id,
        related_loan_id=payload.related_loan_id,
    )

    if payload.tipo in BALANCE_INCREMENTS:
        wallet.saldo += payload.valor
    elif payload.tipo in BALANCE_DECREMENTS:
        if wallet.saldo < payload.valor:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Saldo insuficiente para a transacao")
        wallet.saldo -= payload.valor

    db.add(transaction)
    db.add(wallet)
    db.commit()
    db.refresh(transaction)
    return transaction


@router.patch("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: int,
    payload: TransactionUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> Transaction:
    transaction = _get_transaction_or_404(db, transaction_id)

    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        return transaction

    for key, value in update_data.items():
        setattr(transaction, key, value)

    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> Response:
    transaction = _get_transaction_or_404(db, transaction_id)

    if transaction.related_investment_id or transaction.related_loan_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nao e possivel remover transacao vinculada a investimento ou emprestimo",
        )

    wallet = db.query(Wallet).filter(Wallet.id == transaction.wallet_id).first()
    if not wallet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Carteira nao encontrada")

    if transaction.tipo in BALANCE_INCREMENTS:
        if wallet.saldo < transaction.valor:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Carteira nao possui saldo suficiente para reverter a transacao",
            )
        wallet.saldo -= transaction.valor
    elif transaction.tipo in BALANCE_DECREMENTS:
        wallet.saldo += transaction.valor

    db.delete(transaction)
    db.add(wallet)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

