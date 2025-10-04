"""
Database Inspector
Visualiza a estrutura e dados do banco de dados
"""
import os
os.environ["USE_SQLITE"] = "true"

from sqlalchemy import inspect
from app.db import engine, SessionLocal
from app.models import User, Wallet, Transaction, Investment, Loan


def print_header(title):
    """Imprime cabeçalho formatado"""
    print("\n" + "=" * 60)
    print(f"📊 {title}")
    print("=" * 60)


def inspect_schema():
    """Inspeciona e exibe a estrutura do banco"""
    print_header("ESTRUTURA DO BANCO DE DADOS")

    inspector = inspect(engine)
    tables = inspector.get_table_names()

    print(f"\n✅ Tabelas encontradas: {len(tables)}\n")

    for table_name in tables:
        print(f"📋 Tabela: {table_name}")
        columns = inspector.get_columns(table_name)

        for column in columns:
            col_type = str(column['type'])
            nullable = "NULL" if column['nullable'] else "NOT NULL"
            print(f"  • {column['name']:<20} {col_type:<20} {nullable}")
        print()


def inspect_data():
    """Inspeciona e exibe os dados do banco"""
    db = SessionLocal()

    try:
        # Usuários
        print_header("USUÁRIOS")
        users = db.query(User).all()
        print(f"\n✅ Total: {len(users)} usuários\n")

        for user in users:
            print(f"👤 ID: {user.id}")
            print(f"   Nome: {user.full_name}")
            print(f"   CPF: {user.cpf}")
            print(f"   Nascimento: {user.date_of_birth}")
            print(f"   Email: {user.email}")
            preview = (user.profile_image_base64 or "")[:20]
            print(f"   Imagem (Base64 - preview): {preview + '...' if user.profile_image_base64 else 'N/A'}")
            print(f"   KYC: {user.kyc_status}")
            print(f"   Score: {user.credit_score}")
            print(f"   Ativo: {'Sim' if user.is_active else 'Não'}")
            print(f"   Criado em: {user.created_at}")
            print()

        # Carteiras
        print_header("CARTEIRAS")
        wallets = db.query(Wallet).all()
        print(f"\n✅ Total: {len(wallets)} carteiras\n")

        for wallet in wallets:
            user = db.query(User).filter(User.id == wallet.user_id).first()
            print(f"👛 ID: {wallet.id}")
            print(f"   Usuário: {user.full_name if user else 'N/A'}")
            print(f"   Saldo: R$ {wallet.saldo}")
            print(f"   Criado em: {wallet.created_at}")
            print()

        # Investimentos
        print_header("INVESTIMENTOS")
        investments = db.query(Investment).all()
        print(f"\n✅ Total: {len(investments)} investimentos\n")

        for investment in investments:
            user = db.query(User).filter(User.id == investment.user_id).first()
            print(f"📈 ID: {investment.id}")
            print(f"   Usuário: {user.full_name if user else 'N/A'}")
            print(f"   Valor: R$ {investment.valor}")
            print(f"   Status: {investment.status}")
            print(f"   Criado em: {investment.created_at}")
            print()

        # Empréstimos
        print_header("EMPRÉSTIMOS")
        loans = db.query(Loan).all()
        print(f"\n✅ Total: {len(loans)} empréstimos\n")

        for loan in loans:
            user = db.query(User).filter(User.id == loan.user_id).first()
            print(f"💳 ID: {loan.id}")
            print(f"   Usuário: {user.full_name if user else 'N/A'}")
            print(f"   Valor: R$ {loan.valor}")
            print(f"   Status: {loan.status}")
            print(f"   Criado em: {loan.created_at}")
            if loan.approved_at:
                print(f"   Aprovado em: {loan.approved_at}")
            print()

        # Transações
        print_header("TRANSAÇÕES")
        transactions = db.query(Transaction).all()
        print(f"\n✅ Total: {len(transactions)} transações\n")

        for transaction in transactions:
            wallet = db.query(Wallet).filter(Wallet.id == transaction.wallet_id).first()
            user = db.query(User).filter(User.id == wallet.user_id).first() if wallet else None

            print(f"💸 ID: {transaction.id}")
            print(f"   Usuário: {user.full_name if user else 'N/A'}")
            print(f"   Tipo: {transaction.tipo}")
            print(f"   Valor: R$ {transaction.valor}")
            print(f"   Criado em: {transaction.created_at}")
            print()

        # Resumo
        print_header("RESUMO")
        print(f"\n👥 Usuários: {len(users)}")
        print(f"👛 Carteiras: {len(wallets)}")
        print(f"📈 Investimentos: {len(investments)}")
        print(f"💳 Empréstimos: {len(loans)}")
        print(f"💸 Transações: {len(transactions)}")

        # Totais
        total_balance = sum(w.saldo for w in wallets)
        total_investments = sum(i.valor for i in investments if i.status == "ativo")
        total_loans = sum(l.valor for l in loans)

        print(f"\n💰 Saldo total em carteiras: R$ {total_balance}")
        print(f"📊 Total investido (ativos): R$ {total_investments}")
        print(f"🏦 Total em empréstimos: R$ {total_loans}")
        print()

    except Exception as e:
        print(f"\n❌ Erro ao inspecionar dados: {e}")
    finally:
        db.close()


def main():
    """Função principal"""
    print("\n" + "=" * 60)
    print("🔍 INSPETOR DE BANCO DE DADOS - ShiftBox MVP")
    print("=" * 60)

    try:
        inspect_schema()
        inspect_data()

        print("=" * 60)
        print("✅ Inspeção concluída!")
        print("=" * 60)

    except Exception as e:
        print(f"\n❌ Erro: {e}")


if __name__ == "__main__":
    main()

