"""Wallet API routes."""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Transaction, User, Wallet
from app.schemas import TransactionResponse, WalletCreate, WalletResponse, WalletUpdate

router = APIRouter(prefix="/wallets", tags=["wallets"])


def _get_wallet_or_404(db: Session, wallet_id: int) -> Wallet:
    wallet = db.query(Wallet).filter(Wallet.id == wallet_id).first()
    if not wallet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Carteira nao encontrada")
    return wallet


@router.get("", response_model=List[WalletResponse])
async def list_wallets(
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
) -> List[Wallet]:
    query = db.query(Wallet)
    if user_id is not None:
        query = query.filter(Wallet.user_id == user_id)
    return query.order_by(Wallet.id).offset(skip).limit(limit).all()


@router.get("/{wallet_id}", response_model=WalletResponse)
async def get_wallet(wallet_id: int, db: Session = Depends(get_db)) -> Wallet:
    return _get_wallet_or_404(db, wallet_id)


@router.get("/user/{user_id}", response_model=WalletResponse)
async def get_wallet_by_user(user_id: int, db: Session = Depends(get_db)) -> Wallet:
    wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
    if not wallet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Carteira nao encontrada")
    return wallet


@router.post("", response_model=WalletResponse, status_code=status.HTTP_201_CREATED)
async def create_wallet(payload: WalletCreate, db: Session = Depends(get_db)) -> Wallet:
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario nao encontrado")

    existing = db.query(Wallet).filter(Wallet.user_id == payload.user_id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Usuario ja possui carteira")

    wallet = Wallet(user_id=payload.user_id, saldo=payload.saldo)
    db.add(wallet)
    db.commit()
    db.refresh(wallet)
    return wallet


@router.patch("/{wallet_id}", response_model=WalletResponse)
async def update_wallet(wallet_id: int, payload: WalletUpdate, db: Session = Depends(get_db)) -> Wallet:
    wallet = _get_wallet_or_404(db, wallet_id)
    update_data = payload.model_dump(exclude_unset=True)

    if "saldo" in update_data and update_data["saldo"] is not None:
        novo_saldo = float(update_data["saldo"])
        delta = novo_saldo - wallet.saldo
        wallet.saldo = novo_saldo

        if abs(delta) > 0:
            transaction = Transaction(
                wallet_id=wallet.id,
                tipo="ajuste_saldo",
                valor=abs(delta),
                descricao="Ajuste manual de saldo",
            )
            db.add(transaction)

    db.add(wallet)
    db.commit()
    db.refresh(wallet)
    return wallet


@router.get("/{wallet_id}/transactions", response_model=List[TransactionResponse])
async def list_wallet_transactions(wallet_id: int, db: Session = Depends(get_db)) -> List[Transaction]:
    _ = _get_wallet_or_404(db, wallet_id)
    return (
        db.query(Transaction)
        .filter(Transaction.wallet_id == wallet_id)
        .order_by(Transaction.created_at.desc())
        .all()
    )


@router.delete("/{wallet_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_wallet(wallet_id: int, db: Session = Depends(get_db)) -> Response:
    wallet = _get_wallet_or_404(db, wallet_id)

    has_transactions = (
        db.query(Transaction)
        .filter(Transaction.wallet_id == wallet_id)
        .count()
    )
    if has_transactions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nao e possivel remover carteira com historico de transacoes",
        )

    if wallet.saldo != 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Carteira com saldo diferente de zero nao pode ser removida",
        )

    db.delete(wallet)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

