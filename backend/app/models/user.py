from sqlalchemy import Column, Integer, String, DateTime, Boolean, Date, Text
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()


class User(Base):
    """Modelo de Usuario - Investidores e tomadores de emprestimo"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    cpf = Column(String, unique=True, nullable=True)
    date_of_birth = Column(Date, nullable=True)
    profile_image_base64 = Column(Text, nullable=True)

    kyc_status = Column(String, default="pendente")
    credit_score = Column(Integer, default=500)

    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    wallet = relationship("Wallet", back_populates="user", uselist=False, cascade="all, delete-orphan")
    investments = relationship("Investment", back_populates="user", cascade="all, delete-orphan")
    loans = relationship("Loan", back_populates="user", cascade="all, delete-orphan")
    kyc_documents = relationship("KycDocument", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, kyc={self.kyc_status})>"

