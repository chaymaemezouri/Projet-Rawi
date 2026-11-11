"""Schéma initial : utilisateurs, catégories, récits et favoris."""

import sqlalchemy as sa
from alembic import op

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=120), nullable=False),
        sa.Column("role", sa.String(length=32), nullable=False, server_default="contributor"),
        sa.Column("preferred_language", sa.String(length=8), nullable=False, server_default="fr"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "categories",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("slug", sa.String(length=80), nullable=False),
        sa.Column("name_fr", sa.String(length=120), nullable=False),
        sa.Column("name_ar", sa.String(length=120), nullable=False),
        sa.Column("name_ary", sa.String(length=120), nullable=False),
        sa.Column("description_fr", sa.Text(), nullable=False, server_default=""),
        sa.Column("description_ar", sa.Text(), nullable=False, server_default=""),
        sa.Column("description_ary", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_categories_slug", "categories", ["slug"], unique=True)

    op.create_table(
        "stories",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("title", sa.String(length=180), nullable=False),
        sa.Column("narrator_name", sa.String(length=160), nullable=False),
        sa.Column("narrator_role", sa.String(length=40), nullable=False),
        sa.Column("source", sa.String(length=32), nullable=False),
        sa.Column("language", sa.String(length=8), nullable=False),
        sa.Column("original_content", sa.Text(), nullable=False),
        sa.Column("consent", sa.Boolean(), nullable=False),
        sa.Column("validation_status", sa.String(length=32), nullable=False, server_default="pending"),
        sa.Column("category_id", sa.Uuid(as_uuid=True), nullable=True),
        sa.Column("created_by_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("validated_by_id", sa.Uuid(as_uuid=True), nullable=True),
        sa.Column("validated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["validated_by_id"], ["users.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_stories_category_id", "stories", ["category_id"])
    op.create_index("ix_stories_created_by_id", "stories", ["created_by_id"])

    op.create_table(
        "favorites",
        sa.Column("user_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("story_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["story_id"], ["stories.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("user_id", "story_id"),
    )


def downgrade() -> None:
    op.drop_table("favorites")
    op.drop_index("ix_stories_created_by_id", table_name="stories")
    op.drop_index("ix_stories_category_id", table_name="stories")
    op.drop_table("stories")
    op.drop_index("ix_categories_slug", table_name="categories")
    op.drop_table("categories")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
