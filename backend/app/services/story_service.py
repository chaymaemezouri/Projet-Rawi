import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.core.enums import ContentOrigin, LanguageCode, UserRole, ValidationStatus
from app.models import Category, Favorite, Story, User
from app.schemas.story import StoryRead, StoryWrite


def _load_options():
    return (
        joinedload(Story.category),
        joinedload(Story.created_by),
        joinedload(Story.validated_by),
    )


def _favorite_ids(db: Session, user: User, story_ids: list[uuid.UUID]) -> set[uuid.UUID]:
    if not story_ids:
        return set()
    rows = db.scalars(
        select(Favorite.story_id).where(
            Favorite.user_id == user.id,
            Favorite.story_id.in_(story_ids),
        )
    ).all()
    return set(rows)


def serialize_story(story: Story, is_favorite: bool) -> StoryRead:
    return StoryRead(
        id=story.id,
        title=story.title,
        narrator_name=story.narrator_name,
        narrator_role=story.narrator_role,
        source=story.source,
        language=story.language,
        original_content=story.original_content,
        consent=story.consent,
        validation_status=story.validation_status,
        content_origin=ContentOrigin.collected,
        category_id=story.category_id,
        category=story.category,
        created_by=story.created_by,
        validated_by=story.validated_by,
        validated_at=story.validated_at,
        is_favorite=is_favorite,
        created_at=story.created_at,
        updated_at=story.updated_at,
    )


def get_story(db: Session, story_id: uuid.UUID) -> Story:
    story = db.scalars(
        select(Story).options(*_load_options()).where(Story.id == story_id)
    ).unique().one_or_none()
    if story is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Récit introuvable.")
    return story


def _ensure_category(db: Session, category_id: uuid.UUID | None) -> None:
    if category_id is None:
        return
    if db.get(Category, category_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Catégorie introuvable.")


def _ensure_can_edit(user: User, story: Story) -> None:
    if user.role == UserRole.admin or story.created_by_id == user.id:
        return
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Vous ne pouvez pas modifier ce récit.",
    )


def list_stories(
    db: Session,
    user: User,
    *,
    category_id: uuid.UUID | None,
    language: LanguageCode | None,
    validation_status: ValidationStatus | None,
    mine: bool,
    limit: int,
    offset: int,
) -> tuple[list[StoryRead], int]:
    filters = []
    if category_id is not None:
        filters.append(Story.category_id == category_id)
    if language is not None:
        filters.append(Story.language == language)
    if validation_status is not None:
        filters.append(Story.validation_status == validation_status)
    if mine:
        filters.append(Story.created_by_id == user.id)

    total = db.scalar(select(func.count()).select_from(Story).where(*filters)) or 0
    stories = list(
        db.scalars(
            select(Story)
            .options(*_load_options())
            .where(*filters)
            .order_by(Story.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        .unique()
        .all()
    )
    favorites = _favorite_ids(db, user, [story.id for story in stories])
    return [serialize_story(story, story.id in favorites) for story in stories], int(total)


def create_story(db: Session, user: User, payload: StoryWrite) -> StoryRead:
    _ensure_category(db, payload.category_id)
    story = Story(
        title=payload.title,
        narrator_name=payload.narrator_name,
        narrator_role=payload.narrator_role,
        source=payload.source,
        language=payload.language,
        original_content=payload.original_content,
        consent=True,
        validation_status=ValidationStatus.pending,
        category_id=payload.category_id,
        created_by_id=user.id,
    )
    db.add(story)
    db.commit()
    created = get_story(db, story.id)
    return serialize_story(created, False)


def update_story(db: Session, user: User, story_id: uuid.UUID, payload: StoryWrite) -> StoryRead:
    story = get_story(db, story_id)
    _ensure_can_edit(user, story)
    _ensure_category(db, payload.category_id)
    story.title = payload.title
    story.narrator_name = payload.narrator_name
    story.narrator_role = payload.narrator_role
    story.source = payload.source
    story.language = payload.language
    story.original_content = payload.original_content
    story.consent = True
    story.category_id = payload.category_id
    db.commit()
    updated = get_story(db, story.id)
    return serialize_story(updated, is_favorite(db, user, story.id))


def delete_story(db: Session, user: User, story_id: uuid.UUID) -> None:
    story = get_story(db, story_id)
    _ensure_can_edit(user, story)
    db.delete(story)
    db.commit()


def set_validation(db: Session, user: User, story_id: uuid.UUID, validation_status: ValidationStatus) -> StoryRead:
    if user.role not in (UserRole.validator, UserRole.admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="La validation est réservée aux validateurs.",
        )
    story = get_story(db, story_id)
    story.validation_status = validation_status
    if validation_status == ValidationStatus.pending:
        story.validated_by_id = None
        story.validated_at = None
    else:
        story.validated_by_id = user.id
        story.validated_at = datetime.now(timezone.utc)
    db.commit()
    updated = get_story(db, story.id)
    return serialize_story(updated, is_favorite(db, user, story.id))


def is_favorite(db: Session, user: User, story_id: uuid.UUID) -> bool:
    found = db.scalar(
        select(Favorite.story_id).where(Favorite.user_id == user.id, Favorite.story_id == story_id)
    )
    return found is not None


def add_favorite(db: Session, user: User, story_id: uuid.UUID) -> StoryRead:
    story = get_story(db, story_id)
    if not is_favorite(db, user, story.id):
        db.add(Favorite(user_id=user.id, story_id=story.id))
        db.commit()
    return serialize_story(get_story(db, story.id), True)


def remove_favorite(db: Session, user: User, story_id: uuid.UUID) -> None:
    get_story(db, story_id)
    favorite = db.scalar(
        select(Favorite).where(Favorite.user_id == user.id, Favorite.story_id == story_id)
    )
    if favorite is not None:
        db.delete(favorite)
        db.commit()


def list_favorites(db: Session, user: User) -> list[StoryRead]:
    stories = list(
        db.scalars(
            select(Story)
            .join(Favorite, Favorite.story_id == Story.id)
            .options(*_load_options())
            .where(Favorite.user_id == user.id)
            .order_by(Favorite.created_at.desc())
        )
        .unique()
        .all()
    )
    return [serialize_story(story, True) for story in stories]
