"""
Script simples para criar usuário admin
"""
import os
os.environ["USE_SQLITE"] = "true"

from app.db import engine, SessionLocal
from app.models import Base, User, Wallet
from app.services.auth_service import AuthService
from datetime import date

def create_admin():
    """Cria usuário admin"""
    print("🔧 Criando tabelas...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Apagar usuário admin existente se houver
        existing_admin = db.query(User).filter(User.email == "admin@shiftbox.com").first()
        if existing_admin:
            print("🗑️  Removendo usuário admin existente...")
            db.delete(existing_admin)
            db.commit()
        
        print("👤 Criando usuário admin...")
        # Usar o mesmo hash do AuthService
        password_hash = AuthService.hash_password("admin123")
        
        admin_user = User(
            email="admin@shiftbox.com",
            hashed_password=password_hash,
            full_name="Admin ShiftBox",
            cpf="11111111111",
            date_of_birth=date(1980, 1, 1),
            kyc_status="approved",
            is_active=True,
            is_admin=True
        )
        
        db.add(admin_user)
        db.flush()  # Para obter o ID do usuário
        
        # Criar carteira para o admin
        admin_wallet = Wallet(
            user_id=admin_user.id,
            saldo=0.0
        )
        
        db.add(admin_wallet)
        db.commit()
        print("✅ Usuário admin criado com sucesso!")
        print("💰 Carteira admin criada!")
        print("📧 Email: admin@shiftbox.com")
        print("🔑 Senha: admin123")
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()