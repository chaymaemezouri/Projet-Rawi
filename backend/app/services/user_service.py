import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
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
    return user


def list_users(db: Session) -> list[User]:
    return list(db.scalars(select(User).order_by(User.created_at.asc())).all())


def set_user_role(db: Session, actor: User, user_id: uuid.UUID, role: str) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur introuvable.")
    new_role = UserRole(role)
    if actor.id == user.id and new_role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous ne pouvez pas retirer votre propre rôle d'administrateur.",
        )
    user.role = new_role
    db.commit()
    db.refresh(user)
    return user
