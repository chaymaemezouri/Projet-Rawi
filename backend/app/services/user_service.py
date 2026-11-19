import uuid

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.enums import UserRole
from app.core.security import hash_password, verify_password
from app.models import User
from app.schemas.auth import LoginRequest, RegisterRequest


def register_user(db: Session, payload: RegisterRequest) -> User:
    existing = db.scalar(select(User).where(User.email == payload.email))
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un compte existe déjà avec cet e-mail.",
        )
    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        role=UserRole.contributor,
        preferred_language=payload.preferred_language,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate(db: Session, payload: LoginRequest) -> User:
    user = db.scalar(select(User).where(User.email == payload.email))
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Identifiants invalides.")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Ce compte est désactivé.")
    return user


def list_users(db: Session) -> list[User]:
    return list(db.scalars(select(User).order_by(User.created_at.asc())).all())


def _other_active_admins(db: Session, user_id: uuid.UUID) -> int:
    return int(
        db.scalar(
            select(func.count())
            .select_from(User)
            .where(User.role == UserRole.admin, User.is_active.is_(True), User.id != user_id)
        )
        or 0
    )


def set_user_role(db: Session, actor: User, user_id: uuid.UUID, role: str) -> User:
    from app.services.audit import add_audit

    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur introuvable.")
    try:
        new_role = UserRole(role)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Rôle inconnu.") from exc
    if user.role == UserRole.admin and new_role != UserRole.admin and _other_active_admins(db, user.id) == 0:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Le dernier administrateur actif ne peut pas être rétrogradé.")
    if actor.id == user.id and new_role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Vous ne pouvez pas retirer votre propre rôle d'administrateur.")
    previous = user.role.value
    user.role = new_role
    add_audit(db, actor.id, "role_changed", "user", str(user.id), f"{previous}->{new_role.value}")
    db.commit()
    db.refresh(user)
    return user


def set_user_active(db: Session, actor: User, user_id: uuid.UUID, active: bool) -> User:
    from app.services.audit import add_audit

    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur introuvable.")
    if user.role == UserRole.admin and user.is_active and not active and _other_active_admins(db, user.id) == 0:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Le dernier administrateur actif ne peut pas être désactivé.")
    user.is_active = active
    add_audit(db, actor.id, "user_activated" if active else "user_deactivated", "user", str(user.id), "")
    db.commit()
    db.refresh(user)
    return user
