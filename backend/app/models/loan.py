from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.user import Base


class Loan(Base):
    """Emprestimo do Pool"""
    __tablename__ = "loans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    valor = Column(Float, nullable=False)
    valor_pago = Column(Float, default=0.0)
    taxa_juros = Column(Float, default=0.15)
    prazo_meses = Column(Integer, default=12)

    status = Column(String, default="pendente")
    motivo_rejeicao = Column(String, nullable=True)
    queue_position = Column(Integer, nullable=True)
    interest_accrued = Column(Float, default=0.0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    approved_at = Column(DateTime, nullable=True)
    paid_at = Column(DateTime, nullable=True)
    last_accrual_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="loans")

    @property
    def valor_total_com_juros(self):
        return self.valor * (1 + self.taxa_juros)

    @property
    def valor_restante(self):
        return self.valor_total_com_juros - self.valor_pago - self.interest_accrued

    def __repr__(self):
        return f"<Loan(id={self.id}, user_id={self.user_id}, valor=R${self.valor:.2f}, status={self.status})>"

