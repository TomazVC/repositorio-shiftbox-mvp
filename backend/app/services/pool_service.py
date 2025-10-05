"""Pool and loan queue helpers."""
from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Investment, Loan

POOL_THRESHOLD = 0.8


def get_pool_totals(db: Session) -> tuple[float, float]:
    total_invested = (
        db.query(func.coalesce(func.sum(Investment.valor), 0.0))
        .filter(Investment.status == "ativo")
        .scalar()
    ) or 0.0
    total_committed = (
        db.query(func.coalesce(func.sum(Loan.valor), 0.0))
        .filter(Loan.status.in_(["pendente", "ativo"]))
        .scalar()
    ) or 0.0
    return float(total_invested), float(total_committed)


def active_investors_count(db: Session) -> int:
    return (
        db.query(func.count(func.distinct(Investment.user_id)))
        .filter(Investment.status == "ativo")
        .scalar()
    ) or 0


def should_enqueue(db: Session, loan_value: float) -> bool:
    total, committed = get_pool_totals(db)
    if total <= 0:
        return True
    return committed + loan_value > total * POOL_THRESHOLD


def next_queue_position(db: Session) -> int:
    current = (
        db.query(func.coalesce(func.max(Loan.queue_position), 0))
        .filter(Loan.status == "fila")
        .scalar()
    ) or 0
    return int(current) + 1


def process_loan_queue(db: Session) -> bool:
    total, committed = get_pool_totals(db)
    if total <= 0:
        return False

    updated = False
    queue = (
        db.query(Loan)
        .filter(Loan.status == "fila")
        .order_by(Loan.queue_position.asc(), Loan.created_at.asc())
        .all()
    )

    for loan in queue:
        if committed + loan.valor <= total * POOL_THRESHOLD:
            loan.status = "pendente"
            loan.queue_position = None
            loan.updated_at = datetime.utcnow()
            db.add(loan)
            committed += loan.valor
            updated = True
        else:
            break

    if updated:
        db.commit()
    return updated


def queued_loans_count(db: Session) -> int:
    return (
        db.query(func.count(Loan.id))
        .filter(Loan.status == "fila")
        .scalar()
    ) or 0

