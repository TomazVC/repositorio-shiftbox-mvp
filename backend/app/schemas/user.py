"""Pydantic schemas for user domain."""
import base64
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


def _validate_base64(value: str) -> str:
    try:
        base64.b64decode(value, validate=True)
    except Exception as exc:  # pragma: no cover - defensive
        raise ValueError("Imagem deve estar em Base64 válida") from exc
    return value


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(max_length=255)
    cpf: str = Field(min_length=11, max_length=14)
    date_of_birth: date
    profile_image_base64: Optional[str] = None

    @field_validator("cpf")
    @classmethod
    def validate_cpf(cls, value: str) -> str:
        only_digits = "".join(filter(str.isdigit, value))
        if len(only_digits) != 11:
            raise ValueError("CPF deve conter 11 dígitos")
        return only_digits

    @field_validator("profile_image_base64")
    @classmethod
    def validate_base64(cls, value: Optional[str]) -> Optional[str]:
        if value is None or value == "":
            return value
        return _validate_base64(value)


class UserCreate(UserBase):
    password: str = Field(min_length=6, max_length=128)
    profile_image_base64: Optional[str] = None
    kyc_status: Optional[str] = Field(default="pendente", max_length=50)
    credit_score: Optional[int] = Field(default=500, ge=0, le=1000)
    is_admin: Optional[bool] = False


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, max_length=255)
    cpf: Optional[str] = Field(default=None, min_length=11, max_length=14)
    date_of_birth: Optional[date] = None
    profile_image_base64: Optional[str] = None
    kyc_status: Optional[str] = Field(default=None, max_length=50)
    credit_score: Optional[int] = Field(default=None, ge=0, le=1000)
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None

    @field_validator("cpf")
    @classmethod
    def validate_cpf(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        only_digits = "".join(filter(str.isdigit, value))
        if len(only_digits) != 11:
            raise ValueError("CPF deve conter 11 dígitos")
        return only_digits

    @field_validator("profile_image_base64")
    @classmethod
    def validate_base64(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        return _validate_base64(value)


class UserStatusUpdate(BaseModel):
    is_active: bool


class UserResponse(UserBase):
    id: int
    kyc_status: str
    credit_score: Optional[int] = None
    is_active: bool
    is_admin: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

