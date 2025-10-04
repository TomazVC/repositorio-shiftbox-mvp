from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.user import Base


class Transaction(Base):
    """Histórico de Transações (Auditoria)"""
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id"), nullable=False)
    
    # Tipos: deposito, saque, investimento, emprestimo_recebido, pagamento_emprestimo, rendimento
    tipo = Column(String, nullable=False)
    valor = Column(Float, nullable=False)
    descricao = Column(String, nullable=True)
    
    # Para rastreabilidade
    related_investment_id = Column(Integer, nullable=True)
    related_loan_id = Column(Integer, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relacionamentos
    wallet = relationship("Wallet", back_populates="transactions")
    
    def __repr__(self):
        return f"<Transaction(id={self.id}, tipo={self.tipo}, valor=R${self.valor:.2f})>"