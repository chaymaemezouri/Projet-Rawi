import uuid

from pydantic import BaseModel, Field, field_validator

from app.core.enums import ContentOrigin, LanguageCode, NarratorRole, StorySource, ValidationStatus
from app.schemas import CategoryRead, UserPublic


class StoryWrite(BaseModel):
    title: str = Field(min_length=3, max_length=180)
    narrator_name: str = Field(min_length=2, max_length=160)
    narrator_role: NarratorRole
    source: StorySource
    language: LanguageCode
    original_content: str = Field(min_length=10, max_length=20000)
    consent: bool
    category_id: uuid.UUID | None = None

    @field_validator("title", "narrator_name")
    @classmethod
    def clean_short_text(cls, value: str) -> str:
        return " ".join(value.split())

    @field_validator("original_content")
    @classmethod
    def clean_content(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 10:
            raise ValueError("Le récit doit contenir au moins 10 caractères.")
        return cleaned

    @field_validator("consent")
    @classmethod
    def require_consent(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("Le consentement explicite du contributeur est obligatoire.")
        return value


class ValidationUpdate(BaseModel):
    validation_status: ValidationStatus


class StoryRead(BaseModel):
    id: uuid.UUID
    title: str
    narrator_name: str
    narrator_role: NarratorRole
    source: StorySource
    language: LanguageCode
    original_content: str
    consent: bool
    validation_status: ValidationStatus
    content_origin: ContentOrigin = ContentOrigin.collected
    category_id: uuid.UUID | None
    category: CategoryRead | None
    created_by: UserPublic
    validated_by: UserPublic | None
    validated_at: object | None
    is_favorite: bool
    created_at: object
    updated_at: object


class StoryList(BaseModel):
    items: list[StoryRead]
    total: int
