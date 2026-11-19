"""Espace personnel : notes, accusés de notification, demandes de suppression."""

import sqlalchemy as sa
from alembic import op

revision = "0008_personal_space"
down_revision = "0007_safety_reviews"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "recipe_notes",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("recipe_id", sa.Uuid(), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["recipe_id"], ["recipes.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "recipe_id", name="uq_recipe_notes_user_recipe"),
    )
    op.create_index("ix_recipe_notes_user_id", "recipe_notes", ["user_id"])
    op.create_index("ix_recipe_notes_recipe_id", "recipe_notes", ["recipe_id"])
    op.create_table(
        "notification_acks",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("event_key", sa.String(length=80), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("user_id", "event_key"),
    )
    op.create_table(
        "deletion_requests",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("scope", sa.String(length=16), nullable=False),
        sa.Column("story_id", sa.Uuid(), nullable=True),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["story_id"], ["stories.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_deletion_requests_user_id", "deletion_requests", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_deletion_requests_user_id", table_name="deletion_requests")
    op.drop_table("deletion_requests")
    op.drop_table("notification_acks")
    op.drop_index("ix_recipe_notes_recipe_id", table_name="recipe_notes")
    op.drop_index("ix_recipe_notes_user_id", table_name="recipe_notes")
    op.drop_table("recipe_notes")
