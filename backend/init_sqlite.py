"""
Script para inicializar o banco SQLite com as tabelas necessárias
"""
import os
import sys
from pathlib import Path

# Adicionar o diretório do projeto ao path
sys.path.append(str(Path(__file__).parent))

# Configurar para usar SQLite
os.environ['USE_SQLITE'] = 'true'
os.environ['USE_POSTGRES'] = 'false'

from sqlalchemy import text
from app.db import engine, SessionLocal
from app.models import *  # Importar todos os modelos

def init_sqlite_db():
    """Criar todas as tabelas no SQLite"""
    print("🔨 Inicializando banco SQLite...")
    
    # Criar todas as tabelas
    from app.models.user import Base
    Base.metadata.create_all(bind=engine)
    
    print("✅ Tabelas criadas com sucesso!")
    
    # Verificar se existem dados
    db = SessionLocal()
    try:
        from app.models.user import User
        user_count = db.query(User).count()
        print(f"📊 Usuários existentes: {user_count}")
        
        if user_count == 0:
            print("⚠️  Banco vazio. Execute create_admin.py para criar usuário admin.")
    except Exception as e:
        print(f"❌ Erro ao verificar dados: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    try:
        init_sqlite_db()
        print("🎉 Banco SQLite inicializado com sucesso!")
    except Exception as e:
        print(f"❌ Erro ao inicializar banco: {e}")
        sys.exit(1)