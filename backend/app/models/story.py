from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import LanguageCode, NarratorRole, StorySource, ValidationStatus
from app.db.base import Base


class Story(Base):
    __tablename__ = "stories"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    narrator_name: Mapped[str] = mapped_column(String(160), nullable=False)
    narrator_role: Mapped[NarratorRole] = mapped_column(
        Enum(NarratorRole, name="narrator_role", native_enum=False, length=40),
        nullable=False,
    )
    source: Mapped[StorySource] = mapped_column(
        Enum(StorySource, name="story_source", native_enum=False, length=32),
        nullable=False,
    )
    language: Mapped[LanguageCode] = mapped_column(
        Enum(LanguageCode, name="story_language", native_enum=False, length=8),
        nullable=False,
    )
    original_content: Mapped[str] = mapped_column(Text, nullable=False)
    consent: Mapped[bool] = mapped_column(Boolean, nullable=False)
    validation_status: Mapped[ValidationStatus] = mapped_column(
        Enum(ValidationStatus, name="validation_status", native_enum=False, length=32),
        nullable=False,
        default=ValidationStatus.pending,
        server_default=ValidationStatus.pending.value,
    )
    category_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    validated_by_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    validated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    category: Mapped[Category | None] = relationship(back_populates="stories")
    created_by: Mapped[User] = relationship(
        back_populates="stories",
        foreign_keys=[created_by_id],
    )
    validated_by: Mapped[User | None] = relationship(foreign_keys=[validated_by_id])
