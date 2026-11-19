import uuid
from datetime import date

from pydantic import BaseModel, Field, field_validator

from app.core.enums import ContentOrigin, LanguageCode, NarratorRole, StorySource, ValidationStatus, WorkflowStatus
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
    origin_place: str | None = None
    transmission_note: str | None = None
    collected_on: date | None = None
    mentioned_ingredients: str | None = None
    publish_authorized: bool = False
    workflow_status: WorkflowStatus = WorkflowStatus.submitted

    @field_validator("origin_place", "transmission_note", "mentioned_ingredients")
    @classmethod
    def blank_is_unknown(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = " ".join(value.split())
        return cleaned or None

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
    origin_place: str | None = None
    transmission_note: str | None = None
    collected_on: date | None = None
    mentioned_ingredients: str | None = None
    publish_authorized: bool = False
    workflow_status: WorkflowStatus = WorkflowStatus.submitted
    validation_status: ValidationStatus
    content_origin: ContentOrigin = ContentOrigin.collected
    category_id: uuid.UUID | None
    category: CategoryRead | None
    created_by: UserPublic
    validated_by: UserPublic | None
    validated_at: object | None
    is_favorite: bool
    has_image: bool = False
    has_audio: bool = False
    has_document: bool = False
    created_at: object
    updated_at: object


class StoryList(BaseModel):
    items: list[StoryRead]
    total: int


class SimilarReason(BaseModel):
    code: str
    detail: str | None = None


class SimilarStory(BaseModel):
    story: StoryRead
    reasons: list[SimilarReason]
