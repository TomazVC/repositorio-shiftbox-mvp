"""add_user_personal_fields

Revision ID: 936b587f4acd
Revises: fbd6379aa86f
Create Date: 2025-10-04 14:41:57.352959

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '936b587f4acd'
down_revision = 'fbd6379aa86f'
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table('users') as batch_op:
        batch_op.add_column(sa.Column('cpf', sa.String(length=14), nullable=True))
        batch_op.add_column(sa.Column('date_of_birth', sa.Date(), nullable=True))
        batch_op.add_column(sa.Column('profile_image_base64', sa.Text(), nullable=True))
        batch_op.create_unique_constraint('uq_users_cpf', ['cpf'])


def downgrade() -> None:
    with op.batch_alter_table('users') as batch_op:
        batch_op.drop_constraint('uq_users_cpf', type_='unique')
        batch_op.drop_column('profile_image_base64')
        batch_op.drop_column('date_of_birth')
        batch_op.drop_column('cpf')

