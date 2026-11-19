"""Administration : activation, catégories, journal et conservation."""

import sqlalchemy as sa
from alembic import op

revision = "0009_admin"
down_revision = "0008_personal_space"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("is_active", sa.Boolean(), server_default=sa.true(), nullable=False))
    op.add_column("categories", sa.Column("is_active", sa.Boolean(), server_default=sa.true(), nullable=False))
    op.add_column("deletion_requests", sa.Column("status", sa.String(length=16), server_default="recorded", nullable=False))
    op.create_table(
        "admin_audits",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("actor_id", sa.Uuid(), nullable=False),
        sa.Column("action", sa.String(length=40), nullable=False),
        sa.Column("target_type", sa.String(length=32), nullable=False),
        sa.Column("target_id", sa.String(length=64), nullable=False),
        sa.Column("detail", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["actor_id"], ["users.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_admin_audits_actor_id", "admin_audits", ["actor_id"])


def downgrade() -> None:
    op.drop_index("ix_admin_audits_actor_id", table_name="admin_audits")
    op.drop_table("admin_audits")
    op.drop_column("deletion_requests", "status")
    op.drop_column("categories", "is_active")
    op.drop_column("users", "is_active")
