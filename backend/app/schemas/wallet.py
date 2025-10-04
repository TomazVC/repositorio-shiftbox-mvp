"""Pydantic schemas for wallet domain."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class WalletBase(BaseModel):
    saldo: float = Field(default=0.0, ge=0)


class WalletCreate(WalletBase):
    user_id: int


class WalletUpdate(BaseModel):
    saldo: Optional[float] = Field(default=None)


class WalletResponse(WalletBase):
    id: int
    user_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

