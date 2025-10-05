"""Daily accrual job for investments and loans."""
from datetime import datetime, timezone, timedelta
from decimal import Decimal
import logging

from sqlalchemy.orm import Session

from app.db import SessionLocal
from app.models import Investment, Loan, Transaction, Wallet
from app.services.finance_service import calculate_investment_accrual, calculate_loan_accrual

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("accrual_job")


def _utc_now() -> datetime:
    return datetime.now(tz=timezone.utc)


def _floor_days(delta: timedelta) -> int:
    return max(int(delta.total_seconds() // 86400), 0)


def _ensure_wallet(db: Session, user_id: int) -> Wallet:
    wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
    if wallet:
        return wallet
    wallet = Wallet(user_id=user_id, saldo=0.0)
    db.add(wallet)
    db.flush()
    return wallet


def process_investments(db: Session) -> int:
    count = 0
    now = _utc_now()
    investments = (
        db.query(Investment)
        .filter(Investment.status == "ativo")
        .all()
    )
    for investment in investments:
        last = investment.last_accrual_at or investment.created_at or now
        diff_days = _floor_days(now - last)
        if diff_days <= 0:
            continue
        accrual = calculate_investment_accrual(
            Decimal(str(investment.valor)),
            Decimal(str(investment.taxa_rendimento)),
            diff_days,
        )
        if accrual.juros <= 0:
            continue
        investment.rendimento_acumulado += float(accrual.juros)
        investment.last_accrual_at = last + timedelta(days=diff_days)
        wallet = _ensure_wallet(db, investment.user_id)
        tx = Transaction(
            wallet_id=wallet.id,
            tipo="rendimento_acumulado",
            valor=float(accrual.juros),
            descricao=f"Juros acumulados ({diff_days} dias) investimento {investment.id}",
            related_investment_id=investment.id,
        )
        db.add(tx)
        db.add(investment)
        count += 1
    return count


def process_loans(db: Session) -> int:
    count = 0
    now = _utc_now()
    loans = (
        db.query(Loan)
        .filter(Loan.status.in_(["ativo", "pendente"]))
        .all()
    )
    for loan in loans:
        last = loan.last_accrual_at or loan.created_at or now
        diff_days = _floor_days(now - last)
        if diff_days <= 0:
            continue
        saldo = Decimal(str(loan.valor_restante))
        if saldo <= 0:
            loan.last_accrual_at = now
            db.add(loan)
            continue
        accrual = calculate_loan_accrual(saldo, Decimal(str(loan.taxa_juros)), diff_days)
        if accrual.juros <= 0:
            continue
        loan.interest_accrued += float(accrual.juros)
        loan.last_accrual_at = last + timedelta(days=diff_days)
        wallet = _ensure_wallet(db, loan.user_id)
        tx = Transaction(
            wallet_id=wallet.id,
            tipo="juros_acumulado",
            valor=float(accrual.juros),
            descricao=f"Juros acumulados ({diff_days} dias) emprestimo {loan.id}",
            related_loan_id=loan.id,
        )
        db.add(tx)
        db.add(loan)
        count += 1
    return count


def run_accrual_job() -> None:
    db = SessionLocal()
    try:
        investments_processed = process_investments(db)
        loans_processed = process_loans(db)
        if investments_processed or loans_processed:
            db.commit()
        else:
            db.rollback()
        logger.info(
            "Accrual job finished - investments=%s, loans=%s",
            investments_processed,
            loans_processed,
        )
    except Exception as exc:  # pragma: no cover - logging defensivo
        db.rollback()
        logger.exception("Accrual job failed: %s", exc)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_accrual_job()

