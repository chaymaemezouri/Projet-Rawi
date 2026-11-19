"""Revue de sécurité d'utilisation, séparée des fiches documentaires."""

import sqlalchemy as sa
from alembic import op

revision = "0007_safety_reviews"
down_revision = "0006_recipes"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "safety_reviews",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("recipe_id", sa.Uuid(), nullable=False),
        sa.Column("reviewer_id", sa.Uuid(), nullable=False),
        sa.Column("decision", sa.String(length=16), nullable=False),
        sa.Column("note", sa.Text(), nullable=False),
        sa.Column("recipe_version", sa.Integer(), nullable=False),
        sa.Column("source_fingerprint", sa.String(length=64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["recipe_id"], ["recipes.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["reviewer_id"], ["users.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_safety_reviews_recipe_id", "safety_reviews", ["recipe_id"])


def downgrade() -> None:
    op.drop_index("ix_safety_reviews_recipe_id", table_name="safety_reviews")
    op.drop_table("safety_reviews")
