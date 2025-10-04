from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.user import Base


class Loan(Base):
    """Empréstimo do Pool"""
    __tablename__ = "loans"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    valor = Column(Float, nullable=False)
    valor_pago = Column(Float, default=0.0)
    taxa_juros = Column(Float, default=0.15)  # 15% ao ano
    prazo_meses = Column(Integer, default=12)
    
    # Status: pendente, aprovado, rejeitado, ativo, pago, cancelado
    status = Column(String, default="pendente")
    motivo_rejeicao = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    approved_at = Column(DateTime, nullable=True)
    paid_at = Column(DateTime, nullable=True)
    
    # Relacionamentos
    user = relationship("User", back_populates="loans")
    
    @property
    def valor_total_com_juros(self):
        """Calcula valor total a pagar incluindo juros"""
        return self.valor * (1 + self.taxa_juros)
    
    @property
    def valor_restante(self):
        """Calcula valor restante a pagar"""
        return self.valor_total_com_juros - self.valor_pago
    
    def __repr__(self):
        return f"<Loan(id={self.id}, user_id={self.user_id}, valor=R${self.valor:.2f}, status={self.status})>"