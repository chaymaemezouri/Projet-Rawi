"""Écritures du journal. Le détail reste un code, jamais un récit."""

from __future__ import annotations

import uuid

from sqlalchemy.orm import Session

from app.models import AdminAudit


def add_audit(db: Session, actor_id: uuid.UUID, action: str, target_type: str, target_id: str, detail: str = "") -> None:
    db.add(
        AdminAudit(
            actor_id=actor_id,
            action=action,
            target_type=target_type,
            target_id=str(target_id),
            detail=detail[:180],
        )
    )
