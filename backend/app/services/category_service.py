import uuid

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Category, Story
from app.schemas import CategoryWrite


def list_categories(db: Session, *, active_only: bool = True) -> list[Category]:
    query = select(Category).order_by(Category.name_fr.asc())
    if active_only:
        query = query.where(Category.is_active.is_(True))
    return list(db.scalars(query).all())


def get_category(db: Session, category_id: uuid.UUID) -> Category:
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Catégorie introuvable.")
    return category


def create_category(db: Session, payload: CategoryWrite) -> Category:
    existing = db.scalar(select(Category).where(Category.slug == payload.slug))
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ce slug de catégorie existe déjà.")
    category = Category(**payload.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def update_category(db: Session, category_id: uuid.UUID, payload: CategoryWrite) -> Category:
    category = get_category(db, category_id)
    conflict = db.scalar(select(Category).where(Category.slug == payload.slug, Category.id != category.id))
    if conflict is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ce slug de catégorie existe déjà.")
    for key, value in payload.model_dump().items():
        setattr(category, key, value)
    db.commit()
    db.refresh(category)
    return category


def delete_category(db: Session, category_id: uuid.UUID) -> None:
    category = get_category(db, category_id)
    in_use = db.scalar(select(func.count()).select_from(Story).where(Story.category_id == category.id))
    if in_use:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cette catégorie est associée à des récits et ne peut pas être supprimée.",
        )
    db.delete(category)
    db.commit()
