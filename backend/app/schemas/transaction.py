"""Pydantic schemas for transaction domain."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class TransactionBase(BaseModel):
    tipo: str = Field(max_length=50)
    valor: float
    descricao: Optional[str] = Field(default=None, max_length=255)
    related_investment_id: Optional[int] = None
    related_loan_id: Optional[int] = None


class TransactionCreate(TransactionBase):
    wallet_id: int


class TransactionUpdate(BaseModel):
    descricao: Optional[str] = Field(default=None, max_length=255)


class TransactionResponse(TransactionBase):
    id: int
    wallet_id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

