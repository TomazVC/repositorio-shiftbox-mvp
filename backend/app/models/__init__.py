"""
Models Module
Importa todos os modelos para Alembic detectar
"""

from app.models.user import Base, User
from app.models.wallet import Wallet
from app.models.transaction import Transaction
from app.models.investment import Investment
from app.models.loan import Loan

__all__ = [
    "Base",
    "User",
    "Wallet",
    "Transaction",
    "Investment",
    "Loan"
]