"""Analyse lexicale rattachée à un récit. Le texte original n'est jamais réécrit."""

from __future__ import annotations

import hashlib
import uuid
from copy import deepcopy

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.enums import UserRole, WorkflowStatus
from app.models import Story, StoryRevision, User
from app.models.analysis import AnalysisCorrection, StoryAnalysis
from app.services.lexicon import analyse
from app.services.story_service import ensure_visible, get_story


def _can_review(user: User, story: Story) -> bool:
    if user.id == story.created_by_id or user.role == UserRole.admin:
        return True
    return user.role == UserRole.validator and story.workflow_status == WorkflowStatus.submitted


def _guard(user: User, story: Story) -> None:
    ensure_visible(user, story)
    if not _can_review(user, story):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Vous ne pouvez pas modifier cette analyse.")


def _latest(db: Session, story_id: uuid.UUID) -> StoryAnalysis | None:
    return db.scalar(
        select(StoryAnalysis).where(StoryAnalysis.story_id == story_id).order_by(StoryAnalysis.created_at.desc())
    )


def _corrections(db: Session, analysis_id: uuid.UUID) -> list[AnalysisCorrection]:
    return list(
        db.scalars(
            select(AnalysisCorrection)
            .where(AnalysisCorrection.analysis_id == analysis_id)
            .order_by(AnalysisCorrection.created_at)
        ).all()
    )


def _apply(result: dict, rows: list[AnalysisCorrection]) -> dict:
    view = deepcopy(result)
    rejected: set[str] = set()
    replaced: dict[str, str] = {}
    for row in rows:
        if row.action == "reject":
            rejected.add(row.target_id)
        elif row.action == "replace" and row.replacement:
            replaced[row.target_id] = row.replacement
    if "classification" in replaced:
        slug = replaced["classification"]
        view["classification"]["category_slug"] = None if slug == "uncertain" else slug
        view["classification"]["status"] = "uncertain" if slug == "uncertain" else "proposed"
        view["classification"]["justification"] += " Correction humaine enregistrée."
    for key in ("ingredients", "quantities", "steps", "durations", "precautions"):
        kept = []
        for item in view["extractions"][key]:
            if item["id"] in rejected:
                continue
            if item["id"] in replaced:
                item["corrected"] = replaced[item["id"]]
            kept.append(item)
        view["extractions"][key] = kept
    return view


def serialize(db: Session, row: StoryAnalysis) -> dict:
    corrections = _corrections(db, row.id)
    view = _apply(row.result, corrections)
    return {
        "id": row.id,
        "engine": row.engine,
        "engine_version": row.engine_version,
        "engine_kind": view["engine_kind"],
        "note": view["note"],
        "content_sha256": row.content_sha256,
        "story_revision": row.story_revision,
        "created_at": row.created_at,
        "classification": view["classification"],
        "extractions": view["extractions"],
        "corrections": [
            {
                "id": item.id,
                "target_id": item.target_id,
                "action": item.action,
                "previous_value": item.previous_value,
                "replacement": item.replacement,
                "note": item.note,
                "created_at": item.created_at,
            }
            for item in corrections
        ],
    }


def run_analysis(db: Session, user: User, story_id: uuid.UUID) -> dict:
    story = get_story(db, story_id)
    _guard(user, story)
    revision = db.scalar(select(func.max(StoryRevision.version_number)).where(StoryRevision.story_id == story.id)) or 0
    result = analyse(story.original_content)
    row = StoryAnalysis(
        story_id=story.id,
        engine=result["engine"],
        engine_version=result["engine_version"],
        content_sha256=hashlib.sha256(story.original_content.encode()).hexdigest(),
        story_revision=int(revision),
        result=result,
        created_by_id=user.id,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return serialize(db, row)


def read_analysis(db: Session, user: User, story_id: uuid.UUID) -> dict:
    story = get_story(db, story_id)
    ensure_visible(user, story)
    row = _latest(db, story.id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aucune analyse enregistrée.")
    return serialize(db, row)


def correct_analysis(db: Session, user: User, story_id: uuid.UUID, target_id: str, action: str, replacement: str | None, note: str) -> dict:
    story = get_story(db, story_id)
    _guard(user, story)
    original = story.original_content
    row = _latest(db, story.id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aucune analyse enregistrée.")
    if action not in {"reject", "replace"}:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Action inconnue.")
    if action == "replace" and not replacement:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="La correction doit contenir un texte.")
    previous = _find(row.result, target_id)
    if previous is None and target_id != "classification":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Élément introuvable dans l'analyse.")
    db.add(
        AnalysisCorrection(
            analysis_id=row.id,
            target_id=target_id,
            action=action,
            previous_value=previous,
            replacement=replacement,
            note=note.strip(),
            created_by_id=user.id,
        )
    )
    db.commit()
    db.refresh(story)
    if story.original_content != original:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Le récit original a été modifié.")
    return serialize(db, row)


def _find(result: dict, target_id: str) -> dict | None:
    if target_id == "classification":
        return result["classification"]
    for items in result["extractions"].values():
        for item in items:
            if item["id"] == target_id:
                return item
    return None
