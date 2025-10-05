"""User API routes."""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.db import get_db
from app.models import Investment, Loan, User, Wallet
from app.schemas import (
    UserCreate,
    UserResponse,
    UserStatusUpdate,
    UserUpdate,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/users", tags=["users"])


def _get_user_or_404(db: Session, user_id: int) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario nao encontrado")
    return user


@router.get("", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> List[User]:
    query = db.query(User)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    return query.order_by(User.id).offset(skip).limit(limit).all()


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> User:
    return _get_user_or_404(db, user_id)


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Apenas administradores podem criar usuarios")

    existing_email = db.query(User).filter(User.email == payload.email).first()
    if existing_email:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email ja cadastrado")

    existing_cpf = db.query(User).filter(User.cpf == payload.cpf).first()
    if existing_cpf:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="CPF ja cadastrado")

    hashed_password = AuthService.hash_password(payload.password)

    user = User(
        email=payload.email,
        hashed_password=hashed_password,
        full_name=payload.full_name,
        cpf=payload.cpf,
        date_of_birth=payload.date_of_birth,
        profile_image_base64=payload.profile_image_base64,
        kyc_status=payload.kyc_status or "pendente",
        credit_score=payload.credit_score if payload.credit_score is not None else 500,
        is_admin=payload.is_admin or False,
    )

    db.add(user)
    db.flush()

    wallet = Wallet(user_id=user.id, saldo=0.0)
    db.add(wallet)

    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> User:
    user = _get_user_or_404(db, user_id)

    update_data = payload.model_dump(exclude_unset=True)

    if "cpf" in update_data:
        existing_cpf = (
            db.query(User)
            .filter(User.cpf == update_data["cpf"], User.id != user_id)
            .first()
        )
        if existing_cpf:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="CPF ja cadastrado")

    for key, value in update_data.items():
        setattr(user, key, value)

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/{user_id}/status", response_model=UserResponse)
async def toggle_user_status(
    user_id: int,
    payload: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Apenas administradores podem alterar status")

    user = _get_user_or_404(db, user_id)
    user.is_active = payload.is_active
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Apenas administradores podem remover usuarios")

    user = _get_user_or_404(db, user_id)

    active_investments = (
        db.query(Investment)
        .filter(Investment.user_id == user_id, Investment.status.notin_(["resgatado", "cancelado"]))
        .count()
    )
    if active_investments:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario possui investimentos ativos",
        )

    active_loans = (
        db.query(Loan)
        .filter(Loan.user_id == user_id, Loan.status.in_(["pendente", "ativo", "fila"]))
        .count()
    )
    if active_loans:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario possui emprestimos ativos ou pendentes",
        )

    db.delete(user)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

