from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext

# Configurações de segurança (para MVP)
SECRET_KEY = "shiftbox-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    """
    Serviço de autenticação para MVP.
    Usa credenciais fake para desenvolvimento rápido.
    """
    
    # Usuários fake para MVP
    FAKE_USERS = {
        "admin@shiftbox.com": {
            "id": 1,
            "email": "admin@shiftbox.com",
            "password": "admin123",
            "role": "admin"
        },
        "user@shiftbox.com": {
            "id": 2,
            "email": "user@shiftbox.com",
            "password": "user123",
            "role": "user"
        }
    }
    
    def authenticate(self, email: str, password: str):
        """
        Autentica usuário com email e senha.
        Para MVP, usa lista de usuários fake.
        """
        user = self.FAKE_USERS.get(email)
        
        if not user or user["password"] != password:
            return None
        
        # Gerar token JWT
        token = self._create_access_token(
            data={"sub": user["email"], "user_id": user["id"]}
        )
        
        return {
            "token": token,
            "user_id": user["id"],
            "email": user["email"]
        }
    
    def _create_access_token(self, data: dict):
        """Cria token JWT."""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash de senha usando bcrypt."""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verifica senha contra hash."""
        return pwd_context.verify(plain_password, hashed_password)

