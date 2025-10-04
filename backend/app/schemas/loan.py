"""Pydantic schemas for loan domain."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class LoanBase(BaseModel):
    valor: float = Field(gt=0)
    valor_pago: float = Field(default=0.0, ge=0)
    taxa_juros: float = Field(default=0.15, ge=0)
    prazo_meses: int = Field(default=12, ge=1)
    status: str = Field(default="pendente", max_length=50)
    motivo_rejeicao: Optional[str] = Field(default=None, max_length=255)


class LoanCreate(LoanBase):
    user_id: int


class LoanUpdate(BaseModel):
    valor: Optional[float] = Field(default=None, gt=0)
    valor_pago: Optional[float] = Field(default=None, ge=0)
    taxa_juros: Optional[float] = Field(default=None, ge=0)
    prazo_meses: Optional[int] = Field(default=None, ge=1)
    status: Optional[str] = Field(default=None, max_length=50)
    motivo_rejeicao: Optional[str] = Field(default=None, max_length=255)
    approved_at: Optional[datetime] = None
    paid_at: Optional[datetime] = None


class LoanApproval(BaseModel):
    taxa_juros: Optional[float] = Field(default=None, ge=0)
    prazo_meses: Optional[int] = Field(default=None, ge=1)


class LoanRejection(BaseModel):
    motivo_rejeicao: str = Field(max_length=255)


class LoanPayment(BaseModel):
    valor_pagamento: float = Field(gt=0)


class LoanResponse(LoanBase):
    id: int
    user_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    paid_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

