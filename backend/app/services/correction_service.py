"""Demandes de correction et historique des versions examinées."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.enums import CorrectionState, UserRole, ValidationStatus, WorkflowStatus
from app.models import CorrectionRequest, Story, StoryRevision, User
from app.schemas.collection import CorrectionRead, CorrectionWrite, RevisionRead
from app.services.story_service import ensure_visible, get_story, is_favorite, serialize_story


def _snapshot(story: Story) -> dict:
    collected = story.collected_on.isoformat() if story.collected_on else None
    return {
        "title": story.title,
        "original_content": story.original_content,
        "origin_place": story.origin_place,
        "transmission_note": story.transmission_note,
        "collected_on": collected,
        "mentioned_ingredients": story.mentioned_ingredients,
        "validation_status": story.validation_status.value,
        "workflow_status": story.workflow_status.value,
    }


def _remember(db: Session, user: User, story: Story, reason: str) -> None:
    snap = _snapshot(story)
    latest = db.scalar(
        select(StoryRevision)
        .where(StoryRevision.story_id == story.id)
        .order_by(StoryRevision.version_number.desc())
    )
    if latest is not None and latest.snapshot.get("original_content") == snap["original_content"] and latest.snapshot.get("title") == snap["title"]:
        return
    number = (latest.version_number + 1) if latest is not None else 1
    db.add(
        StoryRevision(
            story_id=story.id,
            version_number=number,
            snapshot=snap,
            reason=reason,
            created_by_id=user.id,
        )
    )


def _read(row: CorrectionRequest, title: str) -> CorrectionRead:
    return CorrectionRead(
        id=row.id,
        story_id=row.story_id,
        story_title=title,
        requested_by_id=row.requested_by_id,
        comment=row.comment,
        status=row.status,
        created_at=row.created_at,
        answered_at=row.answered_at,
    )


def request_correction(db: Session, user: User, story_id: uuid.UUID, payload: CorrectionWrite):
    if user.role not in (UserRole.validator, UserRole.admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="La demande de correction est réservée aux validateurs.")
    story = get_story(db, story_id)
    ensure_visible(user, story)
    if story.created_by_id == user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Vous ne pouvez pas demander une correction sur votre propre récit.")
    if story.workflow_status == WorkflowStatus.draft:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Un brouillon ne peut pas recevoir de demande de correction.")
    _remember(db, user, story, "correction_requested")
    from app.services.review_service import record_decision

    record_decision(db, user, story, "correction_requested", payload.comment)
    row = CorrectionRequest(
        story_id=story.id,
        requested_by_id=user.id,
        comment=payload.comment,
        status=CorrectionState.open,
    )
    db.add(row)
    db.commit()
    return serialize_story(get_story(db, story.id), is_favorite(db, user, story.id))


def list_story_corrections(db: Session, user: User, story_id: uuid.UUID) -> list[CorrectionRead]:
    story = get_story(db, story_id)
    ensure_visible(user, story)
    if user.role not in (UserRole.validator, UserRole.admin) and user.id != story.created_by_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Ces demandes ne sont pas accessibles avec votre compte.")
    rows = db.scalars(
        select(CorrectionRequest).where(CorrectionRequest.story_id == story.id).order_by(CorrectionRequest.created_at)
    ).all()
    return [_read(row, story.title) for row in rows]


def list_my_open_corrections(db: Session, user: User) -> list[CorrectionRead]:
    rows = db.execute(
        select(CorrectionRequest, Story.title)
        .join(Story, Story.id == CorrectionRequest.story_id)
        .where(CorrectionRequest.status == CorrectionState.open, Story.created_by_id == user.id)
        .order_by(CorrectionRequest.created_at.desc())
    ).all()
    return [_read(row[0], row[1]) for row in rows]


def list_revisions(db: Session, user: User, story_id: uuid.UUID) -> list[RevisionRead]:
    story = get_story(db, story_id)
    ensure_visible(user, story)
    if user.role not in (UserRole.validator, UserRole.admin) and user.id != story.created_by_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="L'historique n'est pas accessible avec votre compte.")
    rows = db.scalars(
        select(StoryRevision).where(StoryRevision.story_id == story.id).order_by(StoryRevision.version_number)
    ).all()
    results = []
    for row in rows:
        author = db.get(User, row.created_by_id)
        results.append(
            RevisionRead(
                id=row.id,
                story_id=row.story_id,
                version_number=row.version_number,
                snapshot=row.snapshot,
                reason=row.reason,
                created_by_name=author.full_name if author else "",
                created_at=row.created_at,
            )
        )
    return results


def prepare_resubmission(db: Session, user: User, story: Story, submitting: bool) -> None:
    if not submitting:
        return
    open_rows = db.scalars(
        select(CorrectionRequest).where(
            CorrectionRequest.story_id == story.id,
            CorrectionRequest.status == CorrectionState.open,
        )
    ).all()
    if not open_rows and story.validation_status != ValidationStatus.correction_requested:
        return
    _remember(db, user, story, "before_resubmit")
    now = datetime.now(timezone.utc)
    for row in open_rows:
        row.status = CorrectionState.answered
        row.answered_at = now
    story.validation_status = ValidationStatus.pending
    story.validated_by_id = None
    story.validated_at = None


def close_open_requests(db: Session, story: Story) -> None:
    now = datetime.now(timezone.utc)
    rows = db.scalars(
        select(CorrectionRequest).where(
            CorrectionRequest.story_id == story.id,
            CorrectionRequest.status == CorrectionState.open,
        )
    ).all()
    for row in rows:
        row.status = CorrectionState.answered
        row.answered_at = now


def count_open_for_validator(db: Session, user: User) -> int:
    if user.role not in (UserRole.validator, UserRole.admin):
        return 0
    return int(
        db.scalar(
            select(func.count())
            .select_from(CorrectionRequest)
            .where(CorrectionRequest.status == CorrectionState.open, CorrectionRequest.requested_by_id == user.id)
        )
        or 0
    )
