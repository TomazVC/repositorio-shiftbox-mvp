from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import User, Wallet
from app.schemas import UserCreate, UserResponse
from app.services.auth_service import AuthService, InvalidTokenError

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


class LoginResponse(BaseModel):
    token: str
    user_id: int
    email: str


def _get_user_response(user: User) -> UserResponse:
    return UserResponse.model_validate(user)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = AuthService.decode_access_token(token)
    except InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalido")

    user_id = payload.get("user_id")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalido")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario nao encontrado")
    return user


@router.post("/login", response_model=LoginResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """Autentica usuario real a partir da tabela users usando OAuth2 password flow."""
    email = form_data.username
    user = AuthService.authenticate(db, email, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email ou senha incorretos")

    token = AuthService.create_access_token(subject=user.email, user_id=user.id)
    return LoginResponse(token=token, user_id=user.id, email=user.email)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate, db: Session = Depends(get_db)) -> UserResponse:
    """Cadastro real reutilizando o schema de usuário."""
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
    return _get_user_response(user)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return _get_user_response(current_user)

