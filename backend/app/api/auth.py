from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from app.services.auth_service import AuthService

router = APIRouter()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    token: str
    user_id: int
    email: str


@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    """
    Endpoint de login com email e senha.
    Para MVP, usa autenticação fake.
    """
    auth_service = AuthService()
    result = auth_service.authenticate(credentials.email, credentials.password)
    
    if not result:
        raise HTTPException(
            status_code=401,
            detail="Email ou senha incorretos"
        )
    
    return LoginResponse(**result)


@router.post("/register")
async def register(credentials: LoginRequest):
    """
    Endpoint de cadastro para MVP.
    """
    return {
        "message": "Usuário registrado com sucesso",
        "email": credentials.email
    }

