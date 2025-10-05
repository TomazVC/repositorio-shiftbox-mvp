"""Pydantic schemas for KYC documents."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class KycDocumentCreate(BaseModel):
    document_type: str = Field(max_length=100)
    file_base64: str


class KycDocumentReview(BaseModel):
    status: str = Field(pattern="^(aprovado|rejeitado)$")
    notes: Optional[str] = Field(default=None, max_length=255)


class KycDocumentResponse(BaseModel):
    id: int
    user_id: int
    document_type: str
    status: str
    notes: Optional[str] = None
    created_at: datetime
    reviewed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

