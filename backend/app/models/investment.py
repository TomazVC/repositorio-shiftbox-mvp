from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.user import Base


class Investment(Base):
    """Investimento no Pool"""
    __tablename__ = "investments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    valor = Column(Float, nullable=False)
    rendimento_acumulado = Column(Float, default=0.0)
    taxa_rendimento = Column(Float, default=0.12)

    status = Column(String, default="ativo")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resgatado_at = Column(DateTime, nullable=True)
    last_accrual_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="investments")

    def __repr__(self):
        return f"<Investment(id={self.id}, user_id={self.user_id}, valor=R${self.valor:.2f}, status={self.status})>"

