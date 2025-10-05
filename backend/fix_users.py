#!/usr/bin/env python3
"""
Script para corrigir usuários existentes
"""
import os
os.environ["USE_SQLITE"] = "true"

from app.db import engine, SessionLocal
from app.models import Base, User

def fix_existing_users():
    """Corrige usuários existentes que podem ter campos None"""
    print("🔧 Corrigindo usuários existentes...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Buscar todos os usuários
        users = db.query(User).all()
        
        for user in users:
            updated = False
            
            # Corrigir profile_image_base64 se for None
            if user.profile_image_base64 is None:
                user.profile_image_base64 = ""
                updated = True
                print(f"✅ Corrigido profile_image_base64 para usuário {user.email}")
            
            # Garantir que outros campos necessários estão preenchidos
            if user.date_of_birth is None:
                from datetime import date
                user.date_of_birth = date(1990, 1, 1)
                updated = True
                print(f"✅ Adicionada data de nascimento para usuário {user.email}")
            
            if user.kyc_status is None:
                user.kyc_status = "approved"
                updated = True
                print(f"✅ Definido KYC status para usuário {user.email}")
            
            if user.credit_score is None:
                user.credit_score = 600
                updated = True
                print(f"✅ Definido credit score para usuário {user.email}")
        
        if updated:
            db.commit()
            print("✅ Usuários corrigidos com sucesso!")
        else:
            print("✅ Todos os usuários já estão corretos!")
            
    except Exception as e:
        print(f"❌ Erro ao corrigir usuários: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    try:
        fix_existing_users()
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()