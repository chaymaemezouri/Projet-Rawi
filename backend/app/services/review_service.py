"""Relecture humaine. Deux comptes distincts doivent approuver la même version.

Une décision est documentaire. Elle ne certifie pas un usage médical.
"""

from __future__ import annotations

import hashlib
import logging
import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.enums import UserRole, ValidationStatus, WorkflowStatus
from app.models import Story, StoryReview, StoryRevision, User
from app.services.story_service import ensure_visible, get_story, is_favorite, serialize_story

logger = logging.getLogger(__name__)

DECISIVE = {"approved", "rejected", "correction_requested"}
NOTICE = "Relecture documentaire. Ce n'est pas une certification médicale."


def _hash(story: Story) -> str:
    return hashlib.sha256(story.original_content.encode()).hexdigest()


def _revision(db: Session, story: Story) -> int:
    return int(
        db.scalar(select(func.max(StoryRevision.version_number)).where(StoryRevision.story_id == story.id)) or 0
    )


def _rows(db: Session, story_id: uuid.UUID) -> list[StoryReview]:
    return list(
        db.scalars(select(StoryReview).where(StoryReview.story_id == story_id).order_by(StoryReview.created_at)).all()
    )


def _guard(user: User, story: Story) -> None:
    if user.role not in (UserRole.validator, UserRole.admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="La relecture est réservée aux validateurs.")
    ensure_visible(user, story)
    if story.created_by_id == user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Vous ne pouvez pas valider votre propre récit.")
    if story.workflow_status == WorkflowStatus.draft:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Un brouillon ne peut pas être relu tant qu'il n'est pas soumis.")


def _clean(comment: str, required: bool) -> str:
    cleaned = " ".join(comment.split())
    if required and len(cleaned) < 3:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Le commentaire est trop court.")
    if cleaned and len(cleaned) < 3:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Le commentaire est trop court.")
    return cleaned


def _settle(db: Session, story: Story, digest: str) -> None:
    rows = [row for row in _rows(db, story.id) if row.content_sha256 == digest and row.decision in DECISIVE]
    if any(row.decision == "correction_requested" for row in rows):
        story.validation_status = ValidationStatus.correction_requested
        story.validated_by_id = None
        story.validated_at = None
        return
    approvals = [row for row in rows if row.decision == "approved"]
    rejections = [row for row in rows if row.decision == "rejected"]
    approvers = {row.reviewer_id for row in approvals}
    rejectors = {row.reviewer_id for row in rejections}
    if len(approvers) >= 2 and not rejectors:
        latest = max(approvals, key=lambda row: row.created_at or datetime.now(timezone.utc))
        story.validation_status = ValidationStatus.validated
        story.validated_by_id = latest.reviewer_id
        story.validated_at = datetime.now(timezone.utc)
        return
    if len(rejectors) >= 2 and not approvers:
        latest = max(rejections, key=lambda row: row.created_at or datetime.now(timezone.utc))
        story.validation_status = ValidationStatus.rejected
        story.validated_by_id = latest.reviewer_id
        story.validated_at = datetime.now(timezone.utc)
        return
    contrary = (story.validation_status == ValidationStatus.validated and bool(rejectors)) or (
        story.validation_status == ValidationStatus.rejected and bool(approvers)
    )
    if (approvers and rejectors) or contrary:
        story.validation_status = ValidationStatus.pending
        story.validated_by_id = None
        story.validated_at = None
        return
    if story.validation_status in (ValidationStatus.validated, ValidationStatus.rejected):
        return
    story.validation_status = ValidationStatus.pending
    story.validated_by_id = None
    story.validated_at = None


def record_decision(db: Session, user: User, story: Story, decision: str, comment: str) -> None:
    _guard(user, story)
    if decision not in DECISIVE | {"comment"}:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Décision inconnue.")
    text = _clean(comment, decision == "comment")
    digest = _hash(story)
    if decision in DECISIVE:
        previous = db.scalar(
            select(StoryReview.id).where(
                StoryReview.story_id == story.id,
                StoryReview.reviewer_id == user.id,
                StoryReview.content_sha256 == digest,
                StoryReview.decision.in_(DECISIVE),
            )
        )
        if previous is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ce compte a déjà enregistré une décision sur cette version.",
            )
    revision = _revision(db, story)
    db.add(
        StoryReview(
            story_id=story.id,
            reviewer_id=user.id,
            decision=decision,
            comment=text,
            content_sha256=digest,
            story_revision=revision,
            created_at=datetime.now(timezone.utc),
        )
    )
    db.flush()
    logger.info(
        "validation_decision user_id=%s story_id=%s decision=%s revision=%s",
        user.id,
        story.id,
        decision,
        revision,
    )
    if decision in DECISIVE:
        _settle(db, story, digest)


def decide(db: Session, user: User, story_id: uuid.UUID, decision: str, comment: str) -> dict:
    story = get_story(db, story_id)
    record_decision(db, user, story, decision, comment)
    db.commit()
    return dossier(db, user, story_id)


def reopen_if_text_changes(db: Session, user: User, story: Story, new_text: str) -> None:
    if story.original_content == new_text:
        return
    reviewed = db.scalar(
        select(StoryReview.id).where(StoryReview.story_id == story.id, StoryReview.decision.in_(DECISIVE))
    )
    if story.validation_status == ValidationStatus.pending and reviewed is None:
        return
    from app.services.correction_service import _remember

    _remember(db, user, story, "text_changed")
    story.validation_status = ValidationStatus.pending
    story.validated_by_id = None
    story.validated_at = None


def _public_review(db: Session, row: StoryReview, current: str) -> dict:
    reviewer = db.get(User, row.reviewer_id)
    return {
        "id": str(row.id),
        "decision": row.decision,
        "comment": row.comment,
        "reviewer_name": reviewer.full_name if reviewer else "",
        "story_revision": row.story_revision,
        "created_at": row.created_at.isoformat(),
        "current": row.content_sha256 == current,
    }


def _counts(rows: list[StoryReview], digest: str) -> dict:
    current = [row for row in rows if row.content_sha256 == digest and row.decision in DECISIVE]
    approvals = len({row.reviewer_id for row in current if row.decision == "approved"})
    rejections = len({row.reviewer_id for row in current if row.decision == "rejected"})
    return {
        "approvals": approvals,
        "rejections": rejections,
        "disagreement": approvals > 0 and rejections > 0,
    }


def queue(db: Session, user: User, validation_status: str | None) -> dict:
    if user.role not in (UserRole.validator, UserRole.admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="La file de relecture est réservée aux validateurs.")
    stories = list(
        db.scalars(
            select(Story)
            .where(Story.workflow_status == WorkflowStatus.submitted)
            .order_by(Story.updated_at.desc())
        ).all()
    )
    counts = {item.value: 0 for item in ValidationStatus}
    items = []
    for story in stories:
        counts[story.validation_status.value] += 1
        if validation_status and story.validation_status.value != validation_status:
            continue
        digest = _hash(story)
        summary = _counts(_rows(db, story.id), digest)
        items.append({
            "id": str(story.id),
            "title": story.title,
            "validation_status": story.validation_status.value,
            "updated_at": story.updated_at.isoformat(),
            **summary,
        })
    return {"items": items, "counts": counts, "notice": NOTICE}


def dossier(db: Session, user: User, story_id: uuid.UUID) -> dict:
    story = get_story(db, story_id)
    _guard(user, story)
    digest = _hash(story)
    rows = _rows(db, story.id)
    summary = _counts(rows, digest)
    from app.services.analysis_service import read_analysis
    from app.services.media_service import list_media

    try:
        analysis = read_analysis(db, user, story.id)
    except HTTPException as exc:
        if exc.status_code != status.HTTP_404_NOT_FOUND:
            raise
        analysis = None
    try:
        media = [item.model_dump(mode="json") for item in list_media(db, user, story.id)]
    except HTTPException as exc:
        if exc.status_code not in {status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND}:
            raise
        media = []
    comparison = _comparison(db, user, story)
    return {
        "story": serialize_story(story, is_favorite(db, user, story.id)).model_dump(mode="json"),
        "media": media,
        "analysis": analysis,
        "comparison": comparison,
        "reviews": [_public_review(db, row, digest) for row in rows],
        "revision": _revision(db, story),
        "notice": NOTICE,
        **summary,
    }


def _comparison(db: Session, user: User, story: Story) -> dict:
    if story.category_id is None:
        return {"status": "insufficient", "reason": "données insuffisantes"}
    peer = db.scalar(
        select(Story).where(
            Story.id != story.id,
            Story.category_id == story.category_id,
            Story.workflow_status == WorkflowStatus.submitted,
        )
    )
    from app.services.story_service import can_read_story

    if peer is None or not can_read_story(user, peer):
        return {"status": "insufficient", "reason": "données insuffisantes"}
    from app.services.compare import compare_stories

    return compare_stories(db, user, [story.id, peer.id])
