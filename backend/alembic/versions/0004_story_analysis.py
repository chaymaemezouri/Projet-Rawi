"""Analyses lexicales et corrections humaines, séparées du récit."""

import sqlalchemy as sa
from alembic import op

revision = "0004_story_analysis"
down_revision = "0003_story_media"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "story_analyses",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("story_id", sa.Uuid(), nullable=False),
        sa.Column("engine", sa.String(length=40), nullable=False),
        sa.Column("engine_version", sa.String(length=20), nullable=False),
        sa.Column("content_sha256", sa.String(length=64), nullable=False),
        sa.Column("story_revision", sa.Integer(), nullable=False),
        sa.Column("result", sa.JSON(), nullable=False),
        sa.Column("created_by_id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["story_id"], ["stories.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_story_analyses_story_id", "story_analyses", ["story_id"])
    op.create_table(
        "analysis_corrections",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("analysis_id", sa.Uuid(), nullable=False),
        sa.Column("target_id", sa.String(length=40), nullable=False),
        sa.Column("action", sa.String(length=16), nullable=False),
        sa.Column("previous_value", sa.JSON(), nullable=True),
        sa.Column("replacement", sa.Text(), nullable=True),
        sa.Column("note", sa.Text(), nullable=False),
        sa.Column("created_by_id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["analysis_id"], ["story_analyses.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_analysis_corrections_analysis_id", "analysis_corrections", ["analysis_id"])


def downgrade() -> None:
    op.drop_index("ix_analysis_corrections_analysis_id", table_name="analysis_corrections")
    op.drop_table("analysis_corrections")
    op.drop_index("ix_story_analyses_story_id", table_name="story_analyses")
    op.drop_table("story_analyses")
