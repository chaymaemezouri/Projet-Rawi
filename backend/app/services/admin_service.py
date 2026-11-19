"""Tableaux d'administration. Les listes ne recopient pas le texte des récits."""

from __future__ import annotations

import csv
import io
import uuid

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.enums import CorrectionState, UserRole, ValidationStatus, WorkflowStatus
from app.models import AdminAudit, Category, CorrectionRequest, DeletionRequest, Recipe, Story, StoryReview, User
from app.services.audit import add_audit
from app.services.category_service import list_categories
from app.services.user_service import set_user_active, set_user_role

_KEPT = {"reviewed", "retained"}


def _iso(value) -> str:
    if value is None:
        return ""
    return value.isoformat() if hasattr(value, "isoformat") else str(value)


def summary(db: Session) -> dict:
    def count(query) -> int:
        return int(db.scalar(query) or 0)

    return {
        "users": count(select(func.count()).select_from(User)),
        "active_users": count(select(func.count()).select_from(User).where(User.is_active.is_(True))),
        "stories": count(select(func.count()).select_from(Story)),
        "categories": count(select(func.count()).select_from(Category)),
        "active_categories": count(select(func.count()).select_from(Category).where(Category.is_active.is_(True))),
        "pending_validations": count(
            select(func.count()).select_from(Story).where(
                Story.workflow_status == WorkflowStatus.submitted,
                Story.validation_status == ValidationStatus.pending,
            )
        ),
        "recipes": count(select(func.count()).select_from(Recipe)),
        "deletions": count(select(func.count()).select_from(DeletionRequest)),
        "open_corrections": count(
            select(func.count()).select_from(CorrectionRequest).where(CorrectionRequest.status == CorrectionState.open)
        ),
    }


def users(db: Session, q: str) -> dict:
    needle = q.strip().lower()
    rows = db.scalars(select(User).order_by(User.created_at.asc())).all()
    items = []
    for row in rows:
        if needle and needle not in row.email.lower() and needle not in row.full_name.lower():
            continue
        items.append({
            "id": str(row.id),
            "email": row.email,
            "full_name": row.full_name,
            "role": row.role.value,
            "is_active": row.is_active,
            "preferred_language": row.preferred_language.value,
        })
    return {"items": items}


def change_role(db: Session, actor: User, user_id: uuid.UUID, role: str) -> dict:
    user = set_user_role(db, actor, user_id, role)
    return {"id": str(user.id), "role": user.role.value, "is_active": user.is_active}


def change_active(db: Session, actor: User, user_id: uuid.UUID, active: bool) -> dict:
    user = set_user_active(db, actor, user_id, active)
    return {"id": str(user.id), "role": user.role.value, "is_active": user.is_active}


def validators(db: Session) -> dict:
    rows = db.scalars(select(User).where(User.role == UserRole.validator).order_by(User.full_name.asc())).all()
    items = []
    for row in rows:
        decisions = db.scalars(select(StoryReview).where(StoryReview.reviewer_id == row.id)).all()
        items.append({
            "id": str(row.id),
            "full_name": row.full_name,
            "email": row.email,
            "is_active": row.is_active,
            "decisions": len(decisions),
            "latest": decisions[-1].decision if decisions else "",
        })
    return {"items": items}


def categories(db: Session) -> dict:
    items = []
    for row in list_categories(db, active_only=False):
        used = int(db.scalar(select(func.count()).select_from(Story).where(Story.category_id == row.id)) or 0)
        items.append({
            "id": str(row.id),
            "slug": row.slug,
            "name_fr": row.name_fr,
            "name_ar": row.name_ar,
            "name_ary": row.name_ary,
            "is_active": row.is_active,
            "stories": used,
        })
    return {"items": items}


def set_category_active(db: Session, actor: User, category_id: uuid.UUID, active: bool) -> dict:
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Catégorie introuvable.")
    category.is_active = active
    add_audit(db, actor.id, "category_activated" if active else "category_deactivated", "category", str(category.id), category.slug)
    db.commit()
    return {"id": str(category.id), "is_active": category.is_active, "stories": int(db.scalar(select(func.count()).select_from(Story).where(Story.category_id == category.id)) or 0)}


def moderation(db: Session) -> dict:
    corrections = db.execute(
        select(CorrectionRequest, Story.title)
        .join(Story, Story.id == CorrectionRequest.story_id)
        .where(CorrectionRequest.status == CorrectionState.open)
    ).all()
    pending = db.scalars(
        select(Story).where(
            Story.workflow_status == WorkflowStatus.submitted,
            Story.validation_status == ValidationStatus.pending,
        )
    ).all()
    return {
        "corrections": [
            {"id": str(row.id), "story_id": str(row.story_id), "title": title, "status": row.status.value}
            for row, title in corrections
        ],
        "pending": [
            {"id": str(row.id), "title": row.title, "validation_status": row.validation_status.value, "workflow": row.workflow_status.value}
            for row in pending
        ],
        "deletions": deletions(db)["items"],
    }


def deletions(db: Session) -> dict:
    rows = db.scalars(select(DeletionRequest).order_by(DeletionRequest.created_at.desc())).all()
    return {
        "items": [
            {
                "id": str(row.id),
                "scope": row.scope,
                "status": row.status,
                "story_id": str(row.story_id) if row.story_id else None,
                "reason": row.reason,
                "created_at": _iso(row.created_at),
            }
            for row in rows
        ],
        "policy": "Demande conservée. Aucun compte ni récit n'est effacé.",
    }


def review_deletion(db: Session, actor: User, request_id: uuid.UUID, next_status: str) -> dict:
    if next_status not in _KEPT:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Statut de conservation inconnu.")
    row = db.get(DeletionRequest, request_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Demande introuvable.")
    row.status = next_status
    add_audit(db, actor.id, "deletion_reviewed", "deletion", str(row.id), next_status)
    db.commit()
    return {"id": str(row.id), "status": row.status, "kept": True}


def journal(db: Session) -> dict:
    audits = [
        {
            "id": str(row.id),
            "kind": "admin",
            "action": row.action,
            "actor_id": str(row.actor_id),
            "target_id": row.target_id,
            "detail": row.detail,
            "at": _iso(row.created_at),
        }
        for row in db.scalars(select(AdminAudit).order_by(AdminAudit.created_at.desc())).all()
    ]
    reviews = [
        {
            "id": str(row.id),
            "kind": "decision",
            "action": row.decision,
            "actor_id": str(row.reviewer_id),
            "target_id": str(row.story_id),
            "detail": "",
            "at": _iso(row.created_at),
        }
        for row in db.scalars(select(StoryReview).order_by(StoryReview.created_at.desc())).all()
        if row.decision in {"approved", "rejected", "correction_requested"}
    ]
    items = sorted([*audits, *reviews], key=lambda item: item["at"], reverse=True)
    return {"items": items}


def export_data(db: Session, actor: User, export_format: str, kind: str) -> tuple[str, str, bytes]:
    if export_format not in {"json", "csv"} or kind not in {"users", "stories"}:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Export inconnu.")
    add_audit(db, actor.id, "export", "admin", kind, export_format)
    db.commit()
    if kind == "users":
        rows = [
            {"id": str(row.id), "email": row.email, "role": row.role.value, "is_active": row.is_active}
            for row in db.scalars(select(User).order_by(User.email.asc())).all()
        ]
    else:
        rows = [
            {
                "id": str(row.id),
                "title": row.title,
                "workflow": row.workflow_status.value,
                "validation": row.validation_status.value,
                "category_id": str(row.category_id) if row.category_id else "",
            }
            for row in db.scalars(select(Story).order_by(Story.created_at.asc())).all()
        ]
    if export_format == "json":
        import json
        body = json.dumps({"kind": kind, "items": rows}, ensure_ascii=False).encode()
        return "application/json", f"rawi-{kind}.json", body
    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=list(rows[0].keys()) if rows else ["id"])
    writer.writeheader()
    writer.writerows(rows)
    return "text/csv", f"rawi-{kind}.csv", buffer.getvalue().encode()
