"""
Script para criar usuário admin sem bcrypt
"""
import os
os.environ["USE_SQLITE"] = "true"

from app.db import engine, SessionLocal
from app.models import Base, User
from datetime import date

def create_simple_admin():
    """Cria usuário admin com hash simples"""
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
        # Usar texto plano por enquanto para testar
        admin_user = User(
            email="admin@shiftbox.com",
            hashed_password="admin123",  # Temporário - texto plano
            full_name="Admin ShiftBox",
            cpf="11111111111",
            date_of_birth=date(1980, 1, 1),
            kyc_status="approved",
            is_active=True,
            is_admin=True
        )
        
        db.add(admin_user)
        db.commit()
        print("✅ Usuário admin criado com sucesso!")
        print("📧 Email: admin@shiftbox.com")
        print("🔑 Senha: admin123")
        print("⚠️  ATENÇÃO: Senha em texto plano - apenas para teste!")
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_simple_admin()