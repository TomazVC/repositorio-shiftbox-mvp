from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# URL do banco de dados
# Se USE_SQLITE=true, usa SQLite local (para desenvolvimento sem Docker)
if os.getenv("USE_SQLITE") == "true":
    DATABASE_URL = "sqlite:///./shiftbox_dev.db"
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}  # Necessário para SQLite
    )
else:
    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "postgresql://shiftbox:shiftbox123@db:5432/shiftbox_db"
    )
    engine = create_engine(DATABASE_URL)

# Criar sessão
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """
    Dependency para obter sessão do banco de dados.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

