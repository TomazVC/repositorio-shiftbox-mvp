"""KYC (Know Your Customer) API routes."""
import os
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import User

router = APIRouter(prefix="/kyc", tags=["kyc"])

# Diretório para armazenar documentos KYC
KYC_UPLOAD_DIR = "uploads/kyc"
os.makedirs(KYC_UPLOAD_DIR, exist_ok=True)

# Tipos de arquivo permitidos
ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def _get_user_or_404(db: Session, user_id: int) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario nao encontrado")
    return user


def _validate_file(file: UploadFile) -> bool:
    """Validar tipo e tamanho do arquivo."""
    if not file.filename:
        return False
    
    # Verificar extensão
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        return False
    
    return True


@router.post("/upload")
async def upload_kyc_documents(
    user_id: int,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
):
    """Upload de documentos KYC para um usuário."""
    user = _get_user_or_404(db, user_id)
    
    if not files:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Nenhum arquivo enviado")
    
    uploaded_files = []
    errors = []
    
    for file in files:
        try:
            # Validar arquivo
            if not _validate_file(file):
                errors.append(f"Arquivo inválido: {file.filename}")
                continue
            
            # Ler conteúdo do arquivo
            content = await file.read()
            
            # Verificar tamanho
            if len(content) > MAX_FILE_SIZE:
                errors.append(f"Arquivo muito grande: {file.filename}")
                continue
            
            # Gerar nome único para o arquivo
            file_ext = os.path.splitext(file.filename)[1].lower()
            filename = f"user_{user_id}_{len(uploaded_files)}_{file.filename}"
            filepath = os.path.join(KYC_UPLOAD_DIR, filename)
            
            # Salvar arquivo
            with open(filepath, "wb") as f:
                f.write(content)
            
            uploaded_files.append({
                "original_name": file.filename,
                "saved_name": filename,
                "size": len(content),
                "type": file.content_type
            })
            
        except Exception as e:
            errors.append(f"Erro ao processar {file.filename}: {str(e)}")
    
    if not uploaded_files and errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Nenhum arquivo foi processado com sucesso. Erros: {'; '.join(errors)}"
        )
    
    # Atualizar status KYC do usuário para "em análise" se ainda estiver pendente
    if user.kyc_status == "pendente":
        user.kyc_status = "pendente"  # Pode mudar para "em_analise" se quiser adicionar esse status
        db.add(user)
        db.commit()
    
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "message": f"Upload realizado com sucesso. {len(uploaded_files)} arquivos processados.",
            "uploaded_files": uploaded_files,
            "errors": errors if errors else None,
            "user_kyc_status": user.kyc_status
        }
    )


@router.get("/documents/{user_id}")
async def list_user_kyc_documents(
    user_id: int,
    db: Session = Depends(get_db),
):
    """Listar documentos KYC de um usuário."""
    user = _get_user_or_404(db, user_id)
    
    # Listar arquivos do usuário no diretório
    user_files = []
    if os.path.exists(KYC_UPLOAD_DIR):
        for filename in os.listdir(KYC_UPLOAD_DIR):
            if filename.startswith(f"user_{user_id}_"):
                filepath = os.path.join(KYC_UPLOAD_DIR, filename)
                if os.path.isfile(filepath):
                    stat = os.stat(filepath)
                    user_files.append({
                        "filename": filename,
                        "size": stat.st_size,
                        "uploaded_at": stat.st_mtime
                    })
    
    return {
        "user_id": user_id,
        "kyc_status": user.kyc_status,
        "documents": user_files
    }


@router.post("/update-status/{user_id}")
async def update_kyc_status(
    user_id: int,
    new_status: str,
    comments: str = "",
    db: Session = Depends(get_db),
):
    """Atualizar status KYC de um usuário (para admins)."""
    user = _get_user_or_404(db, user_id)
    
    valid_statuses = ["pendente", "aprovado", "rejeitado"]
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Status inválido. Use: {', '.join(valid_statuses)}"
        )
    
    user.kyc_status = new_status
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return {
        "message": f"Status KYC atualizado para '{new_status}'",
        "user_id": user_id,
        "new_status": new_status,
        "comments": comments
    }