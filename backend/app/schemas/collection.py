import uuid
from datetime import datetime

from pydantic import BaseModel, Field, field_validator

from app.core.enums import CorrectionState, EngineStatus, MediaKind


class CorrectedText(BaseModel):
    corrected_text: str = Field(max_length=20000)

    @field_validator("corrected_text")
    @classmethod
    def strip_text(cls, value: str) -> str:
        return value.strip()


class ExtractionRequest(BaseModel):
    manuscript: bool = False


class TextEngineRead(BaseModel):
    id: uuid.UUID
    engine: str | None
    status: EngineStatus
    raw_text: str | None
    corrected_text: str | None
    message: str
    needs_strong_review: bool = False


class MediaRead(BaseModel):
    id: uuid.UUID
    story_id: uuid.UUID
    kind: MediaKind
    original_name: str
    content_type: str
    byte_size: int
    consent_retained: bool
    created_at: datetime
    transcript: TextEngineRead | None = None
    extraction: TextEngineRead | None = None


class CorrectionWrite(BaseModel):
    comment: str = Field(min_length=3, max_length=4000)

    @field_validator("comment")
    @classmethod
    def clean_comment(cls, value: str) -> str:
        cleaned = " ".join(value.split())
        if len(cleaned) < 3:
            raise ValueError("Le commentaire de correction est trop court.")
        return cleaned


class CorrectionRead(BaseModel):
    id: uuid.UUID
    story_id: uuid.UUID
    story_title: str
    requested_by_id: uuid.UUID
    comment: str
    status: CorrectionState
    created_at: datetime
    answered_at: datetime | None


class RevisionRead(BaseModel):
    id: uuid.UUID
    story_id: uuid.UUID
    version_number: int
    snapshot: dict
    reason: str
    created_by_name: str
    created_at: datetime
