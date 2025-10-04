"""
Seed Data Script
Popula o banco de dados com dados de teste
"""
import os
os.environ["USE_SQLITE"] = "true"

from datetime import datetime, timedelta
from decimal import Decimal
from app.db import engine, SessionLocal
from app.models import Base, User, Wallet, Transaction, Investment, Loan
from passlib.context import CryptContext

# Configuração para hash de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Gera hash da senha"""
    # Bcrypt tem limite de 72 bytes, truncar se necessário
    if len(password.encode('utf-8')) > 72:
        password = password[:72]
    return pwd_context.hash(password)


def clear_database():
    """Limpa todas as tabelas"""
    print("🗑️  Limpando banco de dados...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("✅ Banco de dados limpo!")


def create_users(db):
    """Cria 4 usuários de teste"""
    print("\n👥 Criando usuários...")
    
    users_data = [
        {
            "email": "joao@example.com",
            "full_name": "João Silva",
            "password": "senha123"
        },
        {
            "email": "maria@example.com",
            "full_name": "Maria Oliveira",
            "password": "senha123"
        },
        {
            "email": "pedro@example.com",
            "full_name": "Pedro Santos",
            "password": "senha123"
        },
        {
            "email": "ana@example.com",
            "full_name": "Ana Costa",
            "password": "senha123"
        }
    ]
    
    users = []
    for user_data in users_data:
        user = User(
            email=user_data["email"],
            full_name=user_data["full_name"],
            hashed_password=hash_password(user_data["password"]),
            is_active=True,
            kyc_status="aprovado",
            credit_score=750,
            created_at=datetime.utcnow()
        )
        db.add(user)
        users.append(user)
        print(f"  ✅ {user.full_name} ({user.email})")
    
    db.commit()
    
    # Recarregar para obter os IDs
    for user in users:
        db.refresh(user)
    
    return users


def create_wallets(db, users):
    """Cria carteiras para cada usuário"""
    print("\n💰 Criando carteiras...")
    
    wallets_data = [
        {"saldo": 5000.00},
        {"saldo": 10000.00},
        {"saldo": 3000.00},
        {"saldo": 8000.00}
    ]
    
    wallets = []
    for user, wallet_data in zip(users, wallets_data):
        wallet = Wallet(
            user_id=user.id,
            saldo=wallet_data["saldo"],
            created_at=datetime.utcnow()
        )
        db.add(wallet)
        wallets.append(wallet)
        print(f"  ✅ Carteira de {user.full_name}: R$ {wallet.saldo}")
    
    db.commit()
    
    for wallet in wallets:
        db.refresh(wallet)
    
    return wallets


def create_investments(db, users):
    """Cria investimentos de teste"""
    print("\n📈 Criando investimentos...")
    
    investments_data = [
        {
            "user_id": users[0].id,
            "valor": 2000.00,
            "status": "ativo",
            "days_ago": 30
        },
        {
            "user_id": users[1].id,
            "valor": 5000.00,
            "status": "ativo",
            "days_ago": 60
        },
        {
            "user_id": users[3].id,
            "valor": 3000.00,
            "status": "ativo",
            "days_ago": 15
        }
    ]
    
    investments = []
    for inv_data in investments_data:
        investment = Investment(
            user_id=inv_data["user_id"],
            valor=inv_data["valor"],
            status=inv_data["status"],
            created_at=datetime.utcnow() - timedelta(days=inv_data["days_ago"])
        )
        db.add(investment)
        investments.append(investment)
        user = next(u for u in users if u.id == inv_data["user_id"])
        print(f"  ✅ {user.full_name}: R$ {investment.valor} ({investment.status})")
    
    db.commit()
    return investments


def create_loans(db, users):
    """Cria empréstimos de teste"""
    print("\n💳 Criando empréstimos...")
    
    loans_data = [
        {
            "user_id": users[2].id,
            "valor": 1000.00,
            "status": "pendente",
            "days_ago": 5
        },
        {
            "user_id": users[1].id,
            "valor": 2500.00,
            "status": "aprovado",
            "approved_at": True,
            "days_ago": 10
        }
    ]
    
    loans = []
    for loan_data in loans_data:
        loan = Loan(
            user_id=loan_data["user_id"],
            valor=loan_data["valor"],
            status=loan_data["status"],
            created_at=datetime.utcnow() - timedelta(days=loan_data["days_ago"])
        )
        if loan_data.get("approved_at"):
            loan.approved_at = datetime.utcnow() - timedelta(days=loan_data["days_ago"] - 1)
        
        db.add(loan)
        loans.append(loan)
        user = next(u for u in users if u.id == loan_data["user_id"])
        print(f"  ✅ {user.full_name}: R$ {loan.valor} ({loan.status})")
    
    db.commit()
    return loans


def create_transactions(db, wallets):
    """Cria transações de teste"""
    print("\n💸 Criando transações...")
    
    transactions_data = [
        {
            "wallet_id": wallets[0].id,
            "tipo": "deposito",
            "valor": 1000.00,
            "days_ago": 40
        },
        {
            "wallet_id": wallets[1].id,
            "tipo": "investimento",
            "valor": 5000.00,
            "days_ago": 60
        },
        {
            "wallet_id": wallets[2].id,
            "tipo": "saque",
            "valor": 500.00,
            "days_ago": 7
        }
    ]
    
    for trans_data in transactions_data:
        transaction = Transaction(
            wallet_id=trans_data["wallet_id"],
            tipo=trans_data["tipo"],
            valor=trans_data["valor"],
            created_at=datetime.utcnow() - timedelta(days=trans_data["days_ago"])
        )
        db.add(transaction)
        wallet = next(w for w in wallets if w.id == trans_data["wallet_id"])
        print(f"  ✅ {trans_data['tipo']}: R$ {transaction.valor}")
    
    db.commit()


def main():
    """Função principal"""
    print("=" * 60)
    print("🌱 SEED DATA - Populando banco de dados")
    print("=" * 60)
    
    # Limpar banco
    clear_database()
    
    # Criar sessão
    db = SessionLocal()
    
    try:
        # Criar dados
        users = create_users(db)
        wallets = create_wallets(db, users)
        investments = create_investments(db, users)
        loans = create_loans(db, users)
        create_transactions(db, wallets)
        
        print("\n" + "=" * 60)
        print("✅ SEED DATA CONCLUÍDO!")
        print("=" * 60)
        print(f"👥 {len(users)} usuários criados")
        print(f"💰 {len(wallets)} carteiras criadas")
        print(f"📈 {len(investments)} investimentos criados")
        print(f"💳 {len(loans)} empréstimos criados")
        print(f"💸 3 transações criadas")
        print("\n🔑 Login de teste:")
        print("  Email: joao@example.com")
        print("  Senha: senha123")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Erro ao popular banco: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()

