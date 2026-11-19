"""Fichiers associés à un récit : accès, transcription et lecture documentaire."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.enums import EngineStatus, LanguageCode, MediaKind, UserRole, WorkflowStatus
from app.models import DocumentText, Story, StoryMedia, Transcript, User
from app.schemas.collection import CorrectedText, MediaRead, TextEngineRead
from app.services import reading, speech, storage
from app.services.story_service import ensure_visible, get_story

MAX_BYTES = {
    MediaKind.audio: 20_000_000,
    MediaKind.image: 12_000_000,
    MediaKind.document: 20_000_000,
}


def _engine_read(row: Transcript | DocumentText | None) -> TextEngineRead | None:
    if row is None:
        return None
    strong = bool(getattr(row, "needs_strong_review", False))
    return TextEngineRead(
        id=row.id,
        engine=row.engine,
        status=row.status,
        raw_text=row.raw_text,
        corrected_text=row.corrected_text,
        message=row.message,
        needs_strong_review=strong,
    )


def serialize_media(db: Session, item: StoryMedia) -> MediaRead:
    transcript = db.scalar(select(Transcript).where(Transcript.media_id == item.id))
    extraction = db.scalar(select(DocumentText).where(DocumentText.media_id == item.id))
    return MediaRead(
        id=item.id,
        story_id=item.story_id,
        kind=item.kind,
        original_name=item.original_name,
        content_type=item.content_type,
        byte_size=item.byte_size,
        consent_retained=item.consent_retained,
        created_at=item.created_at,
        transcript=_engine_read(transcript),
        extraction=_engine_read(extraction),
    )


def _owned(user: User, story: Story) -> None:
    if user.role == UserRole.admin or user.id == story.created_by_id:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Vous ne pouvez pas modifier les fichiers de ce récit.")


def ensure_file_access(user: User, story: Story) -> None:
    ensure_visible(user, story)
    if user.role == UserRole.admin or user.id == story.created_by_id:
        return
    if user.role == UserRole.validator and story.workflow_status == WorkflowStatus.submitted:
        return
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Ces fichiers ne sont pas accessibles avec votre compte.",
    )


def list_media(db: Session, user: User, story_id: uuid.UUID) -> list[MediaRead]:
    story = get_story(db, story_id)
    ensure_file_access(user, story)
    rows = db.scalars(select(StoryMedia).where(StoryMedia.story_id == story.id).order_by(StoryMedia.created_at)).all()
    return [serialize_media(db, item) for item in rows]


def store_upload(
    db: Session,
    user: User,
    story_id: uuid.UUID,
    filename: str | None,
    data: bytes,
    consent_to_retain: bool,
) -> MediaRead:
    story = get_story(db, story_id)
    ensure_visible(user, story)
    _owned(user, story)
    if consent_to_retain is not True:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="La conservation du fichier exige un consentement explicite.",
        )
    content_type = storage.detect_content_type(data)
    if content_type is None:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Type de fichier refusé. Formats acceptés : audio, JPEG, PNG, WebP, PDF.",
        )
    kind = MediaKind(storage.kind_for(content_type))
    if len(data) > MAX_BYTES[kind]:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Le fichier dépasse la taille autorisée.",
        )
    stored_name, path = storage.allocate_path(story.id, content_type)
    path.write_bytes(data)
    item = StoryMedia(
        story_id=story.id,
        kind=kind,
        stored_name=stored_name,
        original_name=storage.safe_original_name(filename, content_type),
        content_type=content_type,
        byte_size=len(data),
        consent_retained=True,
        created_by_id=user.id,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return serialize_media(db, item)


def get_media(db: Session, user: User, story_id: uuid.UUID, media_id: uuid.UUID) -> tuple[Story, StoryMedia]:
    story = get_story(db, story_id)
    ensure_file_access(user, story)
    item = db.get(StoryMedia, media_id)
    if item is None or item.story_id != story.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fichier introuvable.")
    return story, item


def open_cover(db: Session, user: User, story_id: uuid.UUID) -> tuple[StoryMedia, Path]:
    story = get_story(db, story_id)
    ensure_visible(user, story)
    published = story.workflow_status == WorkflowStatus.submitted and story.publish_authorized
    if user.id != story.created_by_id and user.role != UserRole.admin and not published:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image introuvable.")
    item = db.scalar(
        select(StoryMedia)
        .where(StoryMedia.story_id == story.id, StoryMedia.kind == MediaKind.image)
        .order_by(StoryMedia.created_at)
    )
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image introuvable.")
    path = storage.resolve_stored(item.story_id, item.stored_name)
    if not path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image introuvable.")
    return item, path


def open_file(db: Session, user: User, story_id: uuid.UUID, media_id: uuid.UUID) -> tuple[StoryMedia, Path]:
    _story, item = get_media(db, user, story_id, media_id)
    path = storage.resolve_stored(item.story_id, item.stored_name)
    if not path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fichier introuvable.")
    return item, path


def delete_media(db: Session, user: User, story_id: uuid.UUID, media_id: uuid.UUID) -> None:
    story = get_story(db, story_id)
    ensure_visible(user, story)
    _owned(user, story)
    item = db.get(StoryMedia, media_id)
    if item is None or item.story_id != story.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fichier introuvable.")
    storage.remove_file(item.story_id, item.stored_name)
    db.delete(item)
    db.commit()


def delete_files_for_story(db: Session, story_id: uuid.UUID) -> None:
    rows = db.scalars(select(StoryMedia).where(StoryMedia.story_id == story_id)).all()
    for item in rows:
        storage.remove_file(item.story_id, item.stored_name)


def _apply_engine(row: Transcript | DocumentText, outcome_status: EngineStatus, text: str | None, engine: str | None, message: str) -> None:
    row.status = outcome_status
    row.engine = engine
    row.message = message
    row.updated_at = datetime.now(timezone.utc)
    if outcome_status == EngineStatus.completed:
        row.raw_text = text


def transcribe_media(db: Session, user: User, story_id: uuid.UUID, media_id: uuid.UUID) -> MediaRead:
    story, item = get_media(db, user, story_id, media_id)
    _owned(user, story)
    if item.kind != MediaKind.audio:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Seuls les fichiers audio peuvent être transcrits.")
    path = storage.resolve_stored(item.story_id, item.stored_name)
    language = story.language if isinstance(story.language, LanguageCode) else LanguageCode(story.language)
    row = db.scalar(select(Transcript).where(Transcript.media_id == item.id))
    if row is None:
        row = Transcript(media_id=item.id, engine=None, status=EngineStatus.processing, raw_text=None, message="Transcription en cours.")
        db.add(row)
    else:
        row.status = EngineStatus.processing
        row.message = "Transcription en cours."
        row.updated_at = datetime.now(timezone.utc)
    db.commit()
    outcome = speech.transcribe_path(path, language)
    _apply_engine(row, outcome.status, outcome.text, outcome.engine, outcome.message)
    db.commit()
    return serialize_media(db, item)


def correct_transcript(db: Session, user: User, story_id: uuid.UUID, media_id: uuid.UUID, payload: CorrectedText) -> MediaRead:
    story, item = get_media(db, user, story_id, media_id)
    _owned(user, story)
    row = db.scalar(select(Transcript).where(Transcript.media_id == item.id))
    if row is None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Aucune transcription n'est associée à ce fichier.")
    row.corrected_text = payload.corrected_text
    row.updated_at = datetime.now(timezone.utc)
    db.commit()
    return serialize_media(db, item)


def read_document(
    db: Session,
    user: User,
    story_id: uuid.UUID,
    media_id: uuid.UUID,
    manuscript: bool,
) -> MediaRead:
    story, item = get_media(db, user, story_id, media_id)
    _owned(user, story)
    if item.kind == MediaKind.audio:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Un fichier audio se transcrit, il ne passe pas par la lecture de document.")
    path = storage.resolve_stored(item.story_id, item.stored_name)
    language = story.language if isinstance(story.language, LanguageCode) else LanguageCode(story.language)
    row = db.scalar(select(DocumentText).where(DocumentText.media_id == item.id))
    if row is None:
        row = DocumentText(media_id=item.id, engine=None, status=EngineStatus.processing, raw_text=None, message="Lecture en cours.", needs_strong_review=manuscript)
        db.add(row)
    else:
        row.status = EngineStatus.processing
        row.message = "Lecture en cours."
        row.updated_at = datetime.now(timezone.utc)
    db.commit()
    outcome = reading.extract_document(path, item.content_type, language, manuscript)
    _apply_engine(row, outcome.status, outcome.text, outcome.engine, outcome.message)
    row.needs_strong_review = outcome.needs_strong_review
    db.commit()
    return serialize_media(db, item)


def correct_document(db: Session, user: User, story_id: uuid.UUID, media_id: uuid.UUID, payload: CorrectedText) -> MediaRead:
    story, item = get_media(db, user, story_id, media_id)
    _owned(user, story)
    row = db.scalar(select(DocumentText).where(DocumentText.media_id == item.id))
    if row is None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Aucune lecture n'est associée à ce document.")
    row.corrected_text = payload.corrected_text
    row.updated_at = datetime.now(timezone.utc)
    db.commit()
    return serialize_media(db, item)
