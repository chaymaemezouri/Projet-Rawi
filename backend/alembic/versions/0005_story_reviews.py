"""Décisions de relecture humaine, séparées du récit original."""

import sqlalchemy as sa
from alembic import op

revision = "0005_story_reviews"
down_revision = "0004_story_analysis"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "story_reviews",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("story_id", sa.Uuid(), nullable=False),
        sa.Column("reviewer_id", sa.Uuid(), nullable=False),
        sa.Column("decision", sa.String(length=32), nullable=False),
        sa.Column("comment", sa.Text(), nullable=False, server_default=""),
        sa.Column("content_sha256", sa.String(length=64), nullable=False),
        sa.Column("story_revision", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["reviewer_id"], ["users.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["story_id"], ["stories.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_story_reviews_story_id", "story_reviews", ["story_id"])


def downgrade() -> None:
    op.drop_index("ix_story_reviews_story_id", table_name="story_reviews")
    op.drop_table("story_reviews")
