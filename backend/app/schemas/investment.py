"""Pydantic schemas for investment domain."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class InvestmentBase(BaseModel):
    valor: float = Field(gt=0)
    taxa_rendimento: float = Field(default=0.12, ge=0)
    rendimento_acumulado: float = Field(default=0.0, ge=0)
    status: str = Field(default="ativo", max_length=50)


class InvestmentCreate(InvestmentBase):
    user_id: int


class InvestmentUpdate(BaseModel):
    valor: Optional[float] = Field(default=None, gt=0)
    rendimento_acumulado: Optional[float] = Field(default=None, ge=0)
    taxa_rendimento: Optional[float] = Field(default=None, ge=0)
    status: Optional[str] = Field(default=None, max_length=50)
    resgatado_at: Optional[datetime] = None


class InvestmentResponse(InvestmentBase):
    id: int
    user_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    resgatado_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

