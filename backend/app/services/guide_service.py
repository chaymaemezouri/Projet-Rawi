"""Guide de consultation. Le mode pratique exige une revue d'usage encore valable."""

from __future__ import annotations

import hashlib
import logging
import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.enums import UserRole
from app.models import Recipe, SafetyReview, User
from app.services.compare import _minutes
from app.services.recipe_service import list_recipes, read_recipe

logger = logging.getLogger(__name__)
NOTICE = "Consultation documentaire. La validation des récits ne certifie pas un usage sûr."


def _fingerprint(payload: dict) -> str:
    parts = [f"{item['id']}:{item['content_sha256']}" for item in payload["sources"]]
    raw = f"{payload['version']}|{payload['status']}|" + "|".join(sorted(parts))
    return hashlib.sha256(raw.encode()).hexdigest()


def _latest(db: Session, recipe_id: uuid.UUID) -> SafetyReview | None:
    return db.scalar(select(SafetyReview).where(SafetyReview.recipe_id == recipe_id).order_by(SafetyReview.created_at.desc()))


def _practical(payload: dict, review: SafetyReview | None) -> bool:
    if payload["status"] != "published" or payload["stale"] or review is None or review.decision != "approved":
        return False
    return review.recipe_version == payload["version"] and review.source_fingerprint == _fingerprint(payload)


def _durations(body: dict) -> list[dict]:
    rows = []
    for item in body.get("durations") or []:
        parsed = _minutes(item.get("passage") or "")
        rows.append({
            "story_id": item.get("story_id"),
            "title": item.get("title"),
            "revision": item.get("revision"),
            "passage": item.get("passage"),
            "seconds": int(parsed * 60) if parsed is not None else None,
        })
    return rows


def _view(db: Session, payload: dict) -> dict:
    review = _latest(db, uuid.UUID(payload["id"]))
    allowed = _practical(payload, review)
    body = payload["body"]
    return {
        "recipe_id": payload["id"],
        "title": payload["title"],
        "version": payload["version"],
        "status": payload["status"],
        "stale": payload["stale"],
        "mode": "practical" if allowed else "documentary",
        "practical_allowed": allowed,
        "safety": review.decision if review else "absent",
        "notice": NOTICE,
        "category_slug": payload["category_slug"],
        "ingredients": body.get("ingredients") or [],
        "quantities": body.get("quantities") or [],
        "steps": body.get("steps") or [],
        "durations": _durations(body),
        "precautions": body.get("precautions") or [],
        "sources": payload["sources"],
        "missing": body.get("missing") or [],
    }


def list_guides(db: Session, user: User) -> dict:
    published = list_recipes(db, user, False)
    items = []
    for item in published["items"]:
        if item["status"] != "published":
            continue
        view = _view(db, read_recipe(db, user, uuid.UUID(item["id"])))
        items.append({
            "recipe_id": view["recipe_id"],
            "title": view["title"],
            "status": view["status"],
            "stale": view["stale"],
            "safety": view["safety"],
            "practical_allowed": view["practical_allowed"],
        })
    return {"items": items, "notice": NOTICE}


def read_guide(db: Session, user: User, recipe_id: uuid.UUID) -> dict:
    return _view(db, read_recipe(db, user, recipe_id))


def start_guide(db: Session, user: User, recipe_id: uuid.UUID, version: int) -> dict:
    view = read_guide(db, user, recipe_id)
    if view["version"] != version:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="La fiche a changé. Le guide pratique est interrompu.")
    if not view["practical_allowed"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Le mode pratique n'est pas autorisé pour cette fiche.")
    return view


def review_safety(db: Session, user: User, recipe_id: uuid.UUID, decision: str, note: str) -> dict:
    if user.role not in (UserRole.validator, UserRole.admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="La revue de sécurité est réservée aux validateurs.")
    if decision not in {"approved", "rejected"}:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Décision inconnue.")
    comment = " ".join(note.split())
    if len(comment) < 3:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="La note de revue est trop courte.")
    payload = read_recipe(db, user, recipe_id)
    recipe = db.get(Recipe, recipe_id)
    if recipe is None or recipe.created_by_id == user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Vous ne pouvez pas revoir l'usage de votre propre fiche.")
    if payload["status"] != "published" or payload["stale"]:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Une fiche non publiée ou obsolète ne reçoit pas de revue d'usage.")
    db.add(
        SafetyReview(
            recipe_id=recipe_id,
            reviewer_id=user.id,
            decision=decision,
            note=comment,
            recipe_version=payload["version"],
            source_fingerprint=_fingerprint(payload),
        )
    )
    logger.info("safety_review user_id=%s recipe_id=%s decision=%s version=%s", user.id, recipe_id, decision, payload["version"])
    db.commit()
    return read_guide(db, user, recipe_id)
