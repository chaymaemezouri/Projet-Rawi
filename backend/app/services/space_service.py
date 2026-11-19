"""Espace personnel. Les chiffres et les notifications viennent des données du compte."""

from __future__ import annotations

import uuid

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.enums import CorrectionState, LanguageCode, ValidationStatus, WorkflowStatus
from app.models import (
    CorrectionRequest,
    DeletionRequest,
    NotificationAck,
    Recipe,
    RecipeNote,
    RecipeRevision,
    SafetyReview,
    Story,
    StoryReview,
    User,
)
from app.services.recipe_service import list_recipes, read_recipe
from app.services.story_service import get_story, list_favorites, list_stories

_DECISIONS = {"approved", "rejected", "correction_requested"}
_RECIPE_EVENTS = {"source_changed"}


def _iso(value) -> str:
    if value is None:
        return ""
    return value.isoformat() if hasattr(value, "isoformat") else str(value)


def _count(db: Session, query) -> int:
    return int(db.scalar(query) or 0)


def summary(db: Session, user: User) -> dict:
    own = Story.created_by_id == user.id
    events = _events(db, user)
    return {
        "stories": _count(db, select(func.count()).select_from(Story).where(own)),
        "drafts": _count(db, select(func.count()).select_from(Story).where(own, Story.workflow_status == WorkflowStatus.draft)),
        "submitted": _count(db, select(func.count()).select_from(Story).where(own, Story.workflow_status == WorkflowStatus.submitted)),
        "corrections": _count(
            db,
            select(func.count())
            .select_from(CorrectionRequest)
            .join(Story, Story.id == CorrectionRequest.story_id)
            .where(Story.created_by_id == user.id, CorrectionRequest.status == CorrectionState.open),
        ),
        "recipes": _count(db, select(func.count()).select_from(Recipe).where(Recipe.created_by_id == user.id)),
        "favorites": len(list_favorites(db, user)),
        "notifications": sum(1 for item in events if not item["read"]),
    }


def update_profile(db: Session, user: User, full_name: str, language: str) -> User:
    cleaned = " ".join(full_name.split())
    if len(cleaned) < 2 or len(cleaned) > 120:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Le nom doit contenir entre 2 et 120 caractères.")
    if language not in {item.value for item in LanguageCode}:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Langue inconnue.")
    user.full_name = cleaned
    user.preferred_language = LanguageCode(language)
    db.commit()
    db.refresh(user)
    return user


def _story_rows(db: Session, user: User, q: str | None, validation: str | None) -> list:
    status_filter = ValidationStatus(validation) if validation in {item.value for item in ValidationStatus} else None
    rows, _total = list_stories(
        db,
        user,
        category_id=None,
        language=None,
        validation_status=status_filter,
        mine=True,
        limit=100,
        offset=0,
        q=q or None,
    )
    if validation in {item.value for item in WorkflowStatus}:
        rows = [row for row in rows if row.workflow_status.value == validation]
    return rows


def library(db: Session, user: User, q: str | None, kind: str, validation: str | None) -> dict:
    items = []
    needle = (q or "").strip().lower()
    if kind in {"", "all", "stories"}:
        for row in _story_rows(db, user, q, validation):
            items.append({
                "id": str(row.id),
                "kind": "story",
                "title": row.title,
                "status": row.validation_status.value,
                "workflow": row.workflow_status.value,
                "consent": row.consent,
                "href": f"/stories/{row.id}",
            })
    if kind in {"", "all", "recipes"}:
        for row in list_recipes(db, user, True)["items"]:
            if needle and needle not in row["title"].lower():
                continue
            if validation and row["status"] != validation:
                continue
            items.append({
                "id": row["id"],
                "kind": "recipe",
                "title": row["title"],
                "status": row["status"],
                "workflow": None,
                "consent": None,
                "href": "/modules/recipes",
            })
    if kind in {"", "all", "favorites"}:
        for row in list_favorites(db, user):
            if needle and needle not in row.title.lower():
                continue
            if validation and row.validation_status.value != validation and row.workflow_status.value != validation:
                continue
            items.append({
                "id": str(row.id),
                "kind": "favorite",
                "title": row.title,
                "status": row.validation_status.value,
                "workflow": row.workflow_status.value,
                "consent": row.consent,
                "href": f"/stories/{row.id}",
            })
    return {"items": items}


def history(db: Session, user: User, q: str | None) -> dict:
    needle = (q or "").strip().lower()
    items = []
    for row in _story_rows(db, user, q, None):
        items.append({
            "id": str(row.id),
            "kind": "story",
            "title": row.title,
            "status": row.validation_status.value,
            "at": _iso(row.updated_at),
            "href": f"/stories/{row.id}",
        })
    recipes = list_recipes(db, user, True)["items"]
    stamps = {
        str(row.id): row.updated_at
        for row in db.scalars(select(Recipe).where(Recipe.created_by_id == user.id)).all()
    }
    for row in recipes:
        if needle and needle not in row["title"].lower():
            continue
        items.append({
            "id": row["id"],
            "kind": "recipe",
            "title": row["title"],
            "status": row["status"],
            "at": _iso(stamps.get(row["id"])),
            "href": "/modules/recipes",
        })
    items.sort(key=lambda item: item["at"], reverse=True)
    return {"items": items}


def _events(db: Session, user: User) -> list[dict]:
    acks = set(
        db.scalars(select(NotificationAck.event_key).where(NotificationAck.user_id == user.id)).all()
    )
    items: list[dict] = []
    corrections = db.execute(
        select(CorrectionRequest, Story.title)
        .join(Story, Story.id == CorrectionRequest.story_id)
        .where(Story.created_by_id == user.id, CorrectionRequest.requested_by_id != user.id)
    ).all()
    for row, title in corrections:
        key = f"correction:{row.id}"
        items.append({
            "key": key,
            "kind": "correction",
            "code": row.status.value,
            "title": title,
            "comment": row.comment,
            "at": _iso(row.created_at),
            "read": key in acks,
            "href": f"/stories/{row.story_id}/edit",
        })
    reviews = db.execute(
        select(StoryReview, Story.title)
        .join(Story, Story.id == StoryReview.story_id)
        .where(Story.created_by_id == user.id, StoryReview.reviewer_id != user.id, StoryReview.decision.in_(_DECISIONS))
    ).all()
    for row, title in reviews:
        key = f"review:{row.id}"
        items.append({
            "key": key,
            "kind": "decision",
            "code": row.decision,
            "title": title,
            "comment": row.comment,
            "at": _iso(row.created_at),
            "read": key in acks,
            "href": f"/stories/{row.story_id}",
        })
    revisions = db.execute(
        select(RecipeRevision, Recipe.title, Recipe.id)
        .join(Recipe, Recipe.id == RecipeRevision.recipe_id)
        .where(Recipe.created_by_id == user.id, RecipeRevision.reason.in_(_RECIPE_EVENTS))
    ).all()
    for row, title, recipe_id in revisions:
        key = f"recipe:{row.id}"
        items.append({
            "key": key,
            "kind": "recipe",
            "code": row.reason,
            "title": title,
            "comment": "",
            "at": _iso(row.created_at),
            "read": key in acks,
            "href": "/modules/recipes",
        })
    safety = db.execute(
        select(SafetyReview, Recipe.title)
        .join(Recipe, Recipe.id == SafetyReview.recipe_id)
        .where(Recipe.created_by_id == user.id, SafetyReview.reviewer_id != user.id)
    ).all()
    for row, title in safety:
        key = f"safety:{row.id}"
        items.append({
            "key": key,
            "kind": "safety",
            "code": row.decision,
            "title": title,
            "comment": "",
            "at": _iso(row.created_at),
            "read": key in acks,
            "href": "/modules/guide",
        })
    items.sort(key=lambda item: item["at"], reverse=True)
    return items


def notifications(db: Session, user: User) -> dict:
    return {"items": _events(db, user)}


def mark_read(db: Session, user: User, key: str) -> dict:
    known = {item["key"] for item in _events(db, user)}
    if key not in known:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification introuvable.")
    if db.get(NotificationAck, {"user_id": user.id, "event_key": key}) is None:
        db.add(NotificationAck(user_id=user.id, event_key=key))
        db.commit()
    return notifications(db, user)


def _kept_for(db: Session, user: User, recipe_id: uuid.UUID, payload: dict) -> bool:
    if payload["status"] == "published":
        return True
    recipe = db.get(Recipe, recipe_id)
    return recipe is not None and recipe.created_by_id == user.id


def list_notes(db: Session, user: User) -> dict:
    rows = db.scalars(select(RecipeNote).where(RecipeNote.user_id == user.id).order_by(RecipeNote.updated_at.desc())).all()
    items = []
    for row in rows:
        try:
            recipe = read_recipe(db, user, row.recipe_id)
        except HTTPException:
            continue
        if not _kept_for(db, user, row.recipe_id, recipe):
            continue
        items.append({
            "recipe_id": str(row.recipe_id),
            "title": recipe["title"],
            "status": recipe["status"],
            "body": row.body,
            "updated_at": _iso(row.updated_at),
        })
    return {"items": items}


def save_note(db: Session, user: User, recipe_id: uuid.UUID, body: str) -> dict:
    recipe = read_recipe(db, user, recipe_id)
    if not _kept_for(db, user, recipe_id, recipe):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fiche introuvable.")
    cleaned = body.strip()
    if not cleaned or len(cleaned) > 2000:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="La note doit contenir entre 1 et 2000 caractères.")
    row = db.scalar(select(RecipeNote).where(RecipeNote.user_id == user.id, RecipeNote.recipe_id == recipe_id))
    if row is None:
        row = RecipeNote(user_id=user.id, recipe_id=recipe_id, body=cleaned)
        db.add(row)
    else:
        row.body = cleaned
    db.commit()
    return list_notes(db, user)


def delete_note(db: Session, user: User, recipe_id: uuid.UUID) -> dict:
    recipe = read_recipe(db, user, recipe_id)
    if not _kept_for(db, user, recipe_id, recipe):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fiche introuvable.")
    row = db.scalar(select(RecipeNote).where(RecipeNote.user_id == user.id, RecipeNote.recipe_id == recipe_id))
    if row is not None:
        db.delete(row)
        db.commit()
    return list_notes(db, user)


def consents(db: Session, user: User) -> dict:
    items = []
    for row in _story_rows(db, user, None, None):
        items.append({
            "id": str(row.id),
            "title": row.title,
            "consent": row.consent,
            "publish_authorized": row.publish_authorized,
            "workflow": row.workflow_status.value,
            "href": f"/stories/{row.id}/edit",
        })
    return {"items": items}


def request_deletion(db: Session, user: User, scope: str, reason: str, story_id: uuid.UUID | None) -> dict:
    if scope not in {"account", "story"}:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Demande inconnue.")
    cleaned = " ".join(reason.split())
    if len(cleaned) < 3:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Le motif est trop court.")
    target = None
    if scope == "story":
        if story_id is None:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Le récit à signaler est requis.")
        story = get_story(db, story_id)
        if story.created_by_id != user.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Récit introuvable.")
        target = story.id
    row = DeletionRequest(user_id=user.id, scope=scope, story_id=target, reason=cleaned)
    db.add(row)
    db.commit()
    db.refresh(row)
    return {"id": str(row.id), "scope": row.scope, "kept": True}


def export_account(db: Session, user: User) -> dict:
    stories = []
    offset = 0
    while True:
        batch, total = list_stories(
            db,
            user,
            category_id=None,
            language=None,
            validation_status=None,
            mine=True,
            limit=100,
            offset=offset,
        )
        for row in batch:
            stories.append({
                "id": str(row.id),
                "title": row.title,
                "status": row.validation_status.value,
                "workflow": row.workflow_status.value,
                "consent": row.consent,
                "publish_authorized": row.publish_authorized,
                "original_content": row.original_content,
            })
        offset += 100
        if offset >= total or not batch:
            break
    return {
        "profile": {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "preferred_language": user.preferred_language.value,
            "role": user.role.value,
        },
        "stories": stories,
        "recipes": list_recipes(db, user, True)["items"],
        "favorites": [{"id": str(row.id), "title": row.title} for row in list_favorites(db, user)],
        "notes": list_notes(db, user)["items"],
    }
