"""Finance preview schemas."""
from datetime import date
from decimal import Decimal
from typing import List, Literal

from pydantic import BaseModel, Field


class InvestmentPreviewRequest(BaseModel):
    valor: Decimal = Field(gt=0)
    taxa_rendimento: Decimal = Field(gt=0)
    dias: int = Field(gt=0)
    tipo: Literal["simples", "composto"] = "simples"
    capitalizacao: Literal["diaria", "mensal", "semestral", "anual"] = "mensal"


class InvestmentPreviewResponse(BaseModel):
    valor_investido: Decimal
    rendimento_previsto: Decimal
    total_previsto: Decimal
    taxa_mensal: Decimal
    apy: Decimal


class LoanPreviewRequest(BaseModel):
    valor: Decimal = Field(gt=0)
    taxa_juros: Decimal = Field(gt=0)
    prazo_meses: int = Field(gt=0)
    sistema: Literal["price", "sac"] = "price"
    primeira_parcela: date | None = None


class LoanInstallment(BaseModel):
    numero: int
    data_pagamento: date
    valor_parcela: Decimal
    juros: Decimal
    amortizacao: Decimal
    saldo_devedor: Decimal


class LoanPreviewResponse(BaseModel):
    valor_contratado: Decimal
    taxa_mensal: Decimal
    total_pago: Decimal
    total_juros: Decimal
    parcelas: List[LoanInstallment]


class InterestAccrualResult(BaseModel):
    dias: int
    juros: Decimal

