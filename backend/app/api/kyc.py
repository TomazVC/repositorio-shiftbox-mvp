"""KYC API routes."""
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import KycDocument, User
from app.schemas import KycDocumentCreate, KycDocumentResponse, KycDocumentReview
from app.api.auth import get_current_user

router = APIRouter(prefix="/kyc", tags=["kyc"])


@router.get("/{user_id}", response_model=List[KycDocumentResponse])
async def list_user_documents(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> List[KycDocument]:
    return (
        db.query(KycDocument)
        .filter(KycDocument.user_id == user_id)
        .order_by(KycDocument.created_at.desc())
        .all()
    )


@router.post("/{user_id}", response_model=KycDocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    user_id: int,
    payload: KycDocumentCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> KycDocument:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario nao encontrado")

    document = KycDocument(
        user_id=user_id,
        document_type=payload.document_type,
        file_base64=payload.file_base64,
        status="pendente",
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return document


@router.post("/documents/{document_id}/review", response_model=KycDocumentResponse)
async def review_document(
    document_id: int,
    payload: KycDocumentReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> KycDocument:
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Apenas administradores podem revisar KYC")

    document = db.query(KycDocument).filter(KycDocument.id == document_id).first()
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Documento nao encontrado")

    document.status = payload.status
    document.notes = payload.notes
    document.reviewed_at = datetime.utcnow()
    db.add(document)
    db.commit()
    db.refresh(document)
    return document

