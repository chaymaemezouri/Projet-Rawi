"""Ajoute la provenance, le brouillon et l'autorisation de publication."""

import sqlalchemy as sa
from alembic import op

revision = "0002_story_provenance"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("stories", sa.Column("origin_place", sa.String(length=160), nullable=True))
    op.add_column("stories", sa.Column("transmission_note", sa.Text(), nullable=True))
    op.add_column("stories", sa.Column("collected_on", sa.Date(), nullable=True))
    op.add_column("stories", sa.Column("mentioned_ingredients", sa.Text(), nullable=True))
    op.add_column(
        "stories",
        sa.Column("publish_authorized", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column(
        "stories",
        sa.Column("workflow_status", sa.String(length=16), nullable=False, server_default="submitted"),
    )


def downgrade() -> None:
    op.drop_column("stories", "workflow_status")
    op.drop_column("stories", "publish_authorized")
    op.drop_column("stories", "mentioned_ingredients")
    op.drop_column("stories", "collected_on")
    op.drop_column("stories", "transmission_note")
    op.drop_column("stories", "origin_place")
