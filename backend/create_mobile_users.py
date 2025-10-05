#!/usr/bin/env python3
"""
Script para criar usuários de teste para mobile
"""
import os
os.environ["USE_SQLITE"] = "true"

from decimal import Decimal
from datetime import date
from app.db import engine, SessionLocal
from app.models import Base, User, Wallet

def create_mobile_users():
    # Configurar banco
    print("🔧 Criando tabelas...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Usuários de teste para mobile
        mobile_users = [
            {
                "email": "teste1@shiftbox.com",
                "password": "teste123",
                "full_name": "Usuário Teste 1",
                "cpf": "12345678901",
                "is_admin": False,
                "is_active": True,
                "initial_balance": Decimal("1000.00")
            },
            {
                "email": "teste2@shiftbox.com", 
                "password": "teste456",
                "full_name": "Usuário Teste 2",
                "cpf": "12345678902",
                "is_admin": False,
                "is_active": True,
                "initial_balance": Decimal("2000.00")
            },
            {
                "email": "teste3@shiftbox.com",
                "password": "teste789",
                "full_name": "Usuário Teste 3", 
                "cpf": "12345678903",
                "is_admin": False,
                "is_active": True,
                "initial_balance": Decimal("1500.00")
            }
        ]
        
        for user_data in mobile_users:
            # Verificar se usuário já existe
            existing_user = db.query(User).filter(User.email == user_data["email"]).first()
            
            if existing_user:
                print(f"✅ Usuário {user_data['email']} já existe")
                continue
                
            # Criar usuário - usando senha em texto plano por enquanto
            user = User(
                email=user_data["email"],
                hashed_password=user_data["password"],  # Texto plano temporário
                full_name=user_data["full_name"],
                cpf=user_data["cpf"],
                date_of_birth=date(1990, 1, 1),
                profile_image_base64="",  # String vazia em vez de None
                kyc_status="approved",
                credit_score=600,
                is_admin=user_data["is_admin"],
                is_active=user_data["is_active"]
            )
            
            db.add(user)
            db.flush()  # Para obter o ID do usuário
            
            # Criar carteira principal para o usuário
            wallet = Wallet(
                user_id=user.id,
                saldo=float(user_data["initial_balance"])
            )
            
            db.add(wallet)
            
            print(f"✅ Usuário criado: {user_data['email']} (senha: {user_data['password']})")
            print(f"💰 Carteira criada com saldo: R$ {user_data['initial_balance']}")
        
        db.commit()
        print("\n🎉 Usuários de teste para mobile criados com sucesso!")
        print("\n📱 Credenciais para teste no mobile:")
        for user_data in mobile_users:
            print(f"   Email: {user_data['email']}")
            print(f"   Senha: {user_data['password']}")
            print(f"   Saldo inicial: R$ {user_data['initial_balance']}")
            print("   ---")
    
    except Exception as e:
        print(f"❌ Erro ao criar usuários: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    try:
        create_mobile_users()
    except Exception as e:
        print(f"❌ Erro ao criar usuários: {e}")
        import traceback
        traceback.print_exc()