from decimal import Decimal, ROUND_HALF_EVEN, getcontext
from datetime import date
import math

from app.schemas.finance import (
    InterestAccrualResult,
    InvestmentPreviewRequest,
    InvestmentPreviewResponse,
    LoanInstallment,
    LoanPreviewRequest,
    LoanPreviewResponse,
)

getcontext().prec = 28

TWO_PLACES = Decimal("0.01")
FOUR_PLACES = Decimal("0.0001")
ALL_DAYS_YEAR = Decimal(365)


def decimal_round(value: Decimal, places: Decimal = TWO_PLACES) -> Decimal:
    return value.quantize(places, rounding=ROUND_HALF_EVEN)


def _pow_decimal(base: Decimal, exponent: Decimal) -> Decimal:
    return Decimal(math.pow(float(base), float(exponent)))


def _rate_annual_to_monthly(rate: Decimal) -> Decimal:
    return Decimal(_pow_decimal(Decimal(1) + rate, Decimal(1) / Decimal(12)) - 1)


def _rate_annual_to_daily(rate: Decimal) -> Decimal:
    return Decimal(_pow_decimal(Decimal(1) + rate, Decimal(1) / ALL_DAYS_YEAR) - 1)


def calculate_investment_preview(req: InvestmentPreviewRequest) -> InvestmentPreviewResponse:
    valor = req.valor
    annual_rate = req.taxa_rendimento
    dias = req.dias

    taxa_mensal = _rate_annual_to_monthly(annual_rate)
    apy = Decimal(_pow_decimal(Decimal(1) + taxa_mensal, Decimal(12)) - 1)

    if req.tipo == "simples":
        rendimento = valor * annual_rate * Decimal(dias) / ALL_DAYS_YEAR
        total = valor + rendimento
    else:
        if req.capitalizacao == "diaria":
            diaria = _rate_annual_to_daily(annual_rate)
            total = valor * Decimal(_pow_decimal(Decimal(1) + diaria, Decimal(dias)))
        elif req.capitalizacao == "mensal":
            meses = Decimal(dias) / Decimal(30)
            total = valor * Decimal(_pow_decimal(Decimal(1) + taxa_mensal, meses))
        elif req.capitalizacao == "semestral":
            semestral = Decimal(_pow_decimal(Decimal(1) + annual_rate, Decimal(1) / Decimal(2)) - 1)
            periodos = Decimal(dias) / Decimal(182.5)
            total = valor * Decimal(_pow_decimal(Decimal(1) + semestral, periodos))
        else:
            total = valor * Decimal(_pow_decimal(Decimal(1) + annual_rate, Decimal(dias) / ALL_DAYS_YEAR))
        rendimento = total - valor

    return InvestmentPreviewResponse(
        valor_investido=decimal_round(valor),
        rendimento_previsto=decimal_round(rendimento),
        total_previsto=decimal_round(total),
        taxa_mensal=decimal_round(taxa_mensal, FOUR_PLACES),
        apy=decimal_round(apy, FOUR_PLACES),
    )


def calculate_investment_accrual(valor: Decimal, taxa_rendimento: Decimal, dias: int) -> InterestAccrualResult:
    juros = valor * taxa_rendimento * Decimal(dias) / ALL_DAYS_YEAR
    return InterestAccrualResult(dias=dias, juros=decimal_round(juros))


def calculate_loan_accrual(saldo: Decimal, taxa_juros: Decimal, dias: int) -> InterestAccrualResult:
    juros = saldo * taxa_juros * Decimal(dias) / ALL_DAYS_YEAR
    return InterestAccrualResult(dias=dias, juros=decimal_round(juros))


def _add_months(base_date: date, months: int) -> date:
    year = base_date.year + (base_date.month - 1 + months) // 12
    month = (base_date.month - 1 + months) % 12 + 1
    day = min(base_date.day, 28)
    return date(year, month, day)


def _price_schedule(valor: Decimal, taxa_mensal: Decimal, prazo: int, primeira: date) -> list[LoanInstallment]:
    parcelas: list[LoanInstallment] = []
    if taxa_mensal == 0:
        parcela_valor = valor / prazo
    else:
        fator = (taxa_mensal * (Decimal(1) + taxa_mensal) ** prazo) / ((Decimal(1) + taxa_mensal) ** prazo - 1)
        parcela_valor = valor * fator

    saldo = valor
    for i in range(1, prazo + 1):
        data_pagamento = _add_months(primeira, i - 1)
        juros = saldo * taxa_mensal
        amortizacao = parcela_valor - juros
        saldo -= amortizacao
        if saldo < Decimal("0.005"):
            saldo = Decimal(0)
        parcelas.append(
            LoanInstallment(
                numero=i,
                data_pagamento=data_pagamento,
                valor_parcela=decimal_round(parcela_valor),
                juros=decimal_round(juros),
                amortizacao=decimal_round(amortizacao),
                saldo_devedor=decimal_round(saldo),
            )
        )
    return parcelas


def _sac_schedule(valor: Decimal, taxa_mensal: Decimal, prazo: int, primeira: date) -> list[LoanInstallment]:
    parcelas: list[LoanInstallment] = []
    amortizacao_constante = valor / prazo
    saldo = valor
    for i in range(1, prazo + 1):
        data_pagamento = _add_months(primeira, i - 1)
        juros = saldo * taxa_mensal
        parcela = amortizacao_constante + juros
        saldo -= amortizacao_constante
        if saldo < Decimal("0.005"):
            saldo = Decimal(0)
        parcelas.append(
            LoanInstallment(
                numero=i,
                data_pagamento=data_pagamento,
                valor_parcela=decimal_round(parcela),
                juros=decimal_round(juros),
                amortizacao=decimal_round(amortizacao_constante),
                saldo_devedor=decimal_round(saldo),
            )
        )
    return parcelas


def calculate_loan_preview(req: LoanPreviewRequest) -> LoanPreviewResponse:
    valor = req.valor
    taxa_mensal = _rate_annual_to_monthly(req.taxa_juros)
    primeira = req.primeira_parcela or date.today()

    if req.sistema == "price":
        parcelas = _price_schedule(valor, taxa_mensal, req.prazo_meses, primeira)
    else:
        parcelas = _sac_schedule(valor, taxa_mensal, req.prazo_meses, primeira)

    total_pago = sum(p.valor_parcela for p in parcelas)
    total_juros = sum(p.juros for p in parcelas)

    return LoanPreviewResponse(
        valor_contratado=decimal_round(valor),
        taxa_mensal=decimal_round(taxa_mensal, FOUR_PLACES),
        total_pago=decimal_round(total_pago),
        total_juros=decimal_round(total_juros),
        parcelas=parcelas,
    )

