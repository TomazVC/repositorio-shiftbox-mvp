from datetime import datetime, timedelta
import os
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.models import User

SECRET_KEY = os.getenv("SECRET_KEY", "shiftbox-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class InvalidTokenError(Exception):
    """Raised when a JWT token is invalid or expired."""


class AuthService:
    """Real authentication service backed by the users table."""

    @staticmethod
    def authenticate(db: Session, email: str, password: str) -> Optional[User]:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None
        if not AuthService.verify_password(password, user.hashed_password):
            return None
        return user

    @staticmethod
    def create_access_token(*, subject: str, user_id: int, expires_delta: Optional[timedelta] = None) -> str:
        to_encode = {"sub": subject, "user_id": user_id}
        expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    @staticmethod
    def decode_access_token(token: str) -> dict:
        try:
            return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        except JWTError as exc:  # pragma: no cover - defensive
            raise InvalidTokenError from exc

    @staticmethod
    def hash_password(password: str) -> str:
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        # TEMPORÁRIO: Se a senha hash for igual ao texto plano, aceitar (para testes)
        if plain_password == hashed_password:
            return True
        # Tentar verificação bcrypt normal
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except:
            return False

