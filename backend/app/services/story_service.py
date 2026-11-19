import logging
import uuid
from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import exists, func, or_, select
from sqlalchemy.orm import Session, joinedload, object_session

from app.core.enums import (
    ContentOrigin,
    LanguageCode,
    MediaKind,
    StorySource,
    UserRole,
    ValidationStatus,
    WorkflowStatus,
)
from app.models import Category, Favorite, Story, StoryMedia, User
from app.schemas.story import StoryRead, StoryWrite

logger = logging.getLogger(__name__)


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


def serialize_story(
    story: Story,
    is_favorite: bool,
    *,
    has_image: bool = False,
    has_audio: bool = False,
    has_document: bool = False,
) -> StoryRead:
    return StoryRead(
        id=story.id,
        title=story.title,
        narrator_name=story.narrator_name,
        narrator_role=story.narrator_role,
        source=story.source,
        language=story.language,
        original_content=story.original_content,
        consent=story.consent,
        origin_place=story.origin_place,
        transmission_note=story.transmission_note,
        collected_on=story.collected_on,
        mentioned_ingredients=story.mentioned_ingredients,
        publish_authorized=story.publish_authorized,
        workflow_status=story.workflow_status,
        validation_status=story.validation_status,
        content_origin=ContentOrigin.collected,
        category_id=story.category_id,
        category=story.category,
        created_by=story.created_by,
        validated_by=story.validated_by,
        validated_at=story.validated_at,
        is_favorite=is_favorite,
        has_image=has_image,
        has_audio=has_audio,
        has_document=has_document,
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


def story_in_catalog(story: Story) -> bool:
    """Un récit du catalogue est soumis et explicitement autorisé à la publication."""
    return story.workflow_status == WorkflowStatus.submitted and bool(story.publish_authorized)


def can_read_story(user: User, story: Story) -> bool:
    """Auteur : tout. Contributeur : catalogue seulement.

    Un validateur lit les récits soumis, pas les brouillons d'autrui.
    Un administrateur lit pour la modération ; l'accès hors catalogue est tracé.
    """
    if user.id == story.created_by_id or story_in_catalog(story):
        return True
    if user.role == UserRole.validator and story.workflow_status == WorkflowStatus.submitted:
        return True
    return user.role == UserRole.admin


def _trace_sensitive_read(user: User, story: Story) -> None:
    if user.role != UserRole.admin or user.id == story.created_by_id or story_in_catalog(story):
        return
    logger.info(
        "sensitive_admin_read user_id=%s story_id=%s workflow=%s publish_authorized=%s",
        user.id,
        story.id,
        story.workflow_status.value,
        story.publish_authorized,
    )
    db = object_session(story)
    if db is None:
        return
    from app.services.audit import add_audit

    add_audit(db, user.id, "sensitive_read", "story", str(story.id), story.workflow_status.value)
    db.commit()


def ensure_visible(user: User, story: Story) -> None:
    if not can_read_story(user, story):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Récit introuvable.")
    _trace_sensitive_read(user, story)


def _ensure_can_edit(user: User, story: Story) -> None:
    if user.role == UserRole.admin or story.created_by_id == user.id:
        return
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Vous ne pouvez pas modifier ce récit.",
    )


def _like(value: str) -> str:
    cleaned = value.replace("\\", "").replace("%", "").replace("_", "").strip().lower()
    return f"%{cleaned}%"


def _media_flags(db: Session, story_ids: list[uuid.UUID]) -> dict[uuid.UUID, tuple[bool, bool, bool]]:
    flags = {story_id: [False, False, False] for story_id in story_ids}
    if not story_ids:
        return {}
    rows = db.execute(
        select(StoryMedia.story_id, StoryMedia.kind).where(StoryMedia.story_id.in_(story_ids))
    ).all()
    for story_id, kind in rows:
        bucket = flags[story_id]
        if kind == MediaKind.image:
            bucket[0] = True
        elif kind == MediaKind.audio:
            bucket[1] = True
        else:
            bucket[2] = True
    return {story_id: (bucket[0], bucket[1], bucket[2]) for story_id, bucket in flags.items()}


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
    q: str | None = None,
    origin: str | None = None,
    source: StorySource | None = None,
    collected_from: date | None = None,
    collected_to: date | None = None,
    has_audio: bool | None = None,
    has_document: bool | None = None,
    sort: str = "recent",
) -> tuple[list[StoryRead], int]:
    filters = []
    if mine:
        filters.append(Story.created_by_id == user.id)
    else:
        filters.append(Story.workflow_status == WorkflowStatus.submitted)
        filters.append(Story.publish_authorized.is_(True))
    if category_id is not None:
        filters.append(Story.category_id == category_id)
    if language is not None:
        filters.append(Story.language == language)
    if validation_status is not None:
        filters.append(Story.validation_status == validation_status)
    if source is not None:
        filters.append(Story.source == source)
    if origin and origin.strip():
        filters.append(func.lower(Story.origin_place).like(_like(origin)))
    if collected_from is not None:
        filters.append(Story.collected_on >= collected_from)
    if collected_to is not None:
        filters.append(Story.collected_on <= collected_to)
    if has_audio:
        filters.append(
            exists().where(StoryMedia.story_id == Story.id, StoryMedia.kind == MediaKind.audio)
        )
    if has_document:
        filters.append(
            exists().where(
                StoryMedia.story_id == Story.id,
                StoryMedia.kind.in_((MediaKind.image, MediaKind.document)),
            )
        )
    if q and q.strip():
        pattern = _like(q)
        filters.append(
            or_(
                func.lower(Story.title).like(pattern),
                func.lower(Story.original_content).like(pattern),
                func.lower(func.coalesce(Story.mentioned_ingredients, "")).like(pattern),
                func.lower(func.coalesce(Story.origin_place, "")).like(pattern),
                func.lower(func.coalesce(Category.name_fr, "")).like(pattern),
                func.lower(func.coalesce(Category.name_ar, "")).like(pattern),
                func.lower(func.coalesce(Category.name_ary, "")).like(pattern),
            )
        )
    if sort == "title":
        order = Story.title.asc()
    elif sort == "collected":
        order = Story.collected_on.desc().nulls_last()
    else:
        order = Story.created_at.desc()

    base = select(Story).outerjoin(Category, Story.category_id == Category.id).where(*filters)
    total = db.scalar(select(func.count()).select_from(base.subquery())) or 0
    stories = list(
        db.scalars(
            base.options(*_load_options()).order_by(order, Story.created_at.desc()).limit(limit).offset(offset)
        )
        .unique()
        .all()
    )
    favorites = _favorite_ids(db, user, [story.id for story in stories])
    media = _media_flags(db, [story.id for story in stories])
    items = []
    for story in stories:
        image, audio, document = media.get(story.id, (False, False, False))
        items.append(
            serialize_story(
                story,
                story.id in favorites,
                has_image=image,
                has_audio=audio,
                has_document=document,
            )
        )
    return items, int(total)


def _ensure_submission(payload: StoryWrite) -> None:
    if payload.workflow_status == WorkflowStatus.submitted and payload.consent is not True:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Le consentement explicite du contributeur est obligatoire.",
        )


def create_story(db: Session, user: User, payload: StoryWrite) -> StoryRead:
    _ensure_submission(payload)
    _ensure_category(db, payload.category_id)
    story = Story(
        title=payload.title,
        narrator_name=payload.narrator_name,
        narrator_role=payload.narrator_role,
        source=payload.source,
        language=payload.language,
        original_content=payload.original_content,
        consent=payload.consent,
        origin_place=payload.origin_place,
        transmission_note=payload.transmission_note,
        collected_on=payload.collected_on,
        mentioned_ingredients=payload.mentioned_ingredients,
        publish_authorized=payload.publish_authorized,
        workflow_status=payload.workflow_status,
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
    ensure_visible(user, story)
    _ensure_can_edit(user, story)
    _ensure_submission(payload)
    _ensure_category(db, payload.category_id)
    from app.services.correction_service import prepare_resubmission

    prepare_resubmission(db, user, story, payload.workflow_status == WorkflowStatus.submitted)
    from app.services.review_service import reopen_if_text_changes

    reopen_if_text_changes(db, user, story, payload.original_content)
    story.title = payload.title
    story.narrator_name = payload.narrator_name
    story.narrator_role = payload.narrator_role
    story.source = payload.source
    story.language = payload.language
    story.original_content = payload.original_content
    story.consent = payload.consent
    story.origin_place = payload.origin_place
    story.transmission_note = payload.transmission_note
    story.collected_on = payload.collected_on
    story.mentioned_ingredients = payload.mentioned_ingredients
    story.publish_authorized = payload.publish_authorized
    story.workflow_status = payload.workflow_status
    story.category_id = payload.category_id
    db.commit()
    updated = get_story(db, story.id)
    return serialize_story(updated, is_favorite(db, user, story.id))


def delete_story(db: Session, user: User, story_id: uuid.UUID) -> None:
    story = get_story(db, story_id)
    ensure_visible(user, story)
    _ensure_can_edit(user, story)
    from app.services.media_service import delete_files_for_story

    delete_files_for_story(db, story.id)
    db.delete(story)
    db.commit()


def set_validation(db: Session, user: User, story_id: uuid.UUID, validation_status: ValidationStatus) -> StoryRead:
    if user.role not in (UserRole.validator, UserRole.admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="La validation est réservée aux validateurs.",
        )
    story = get_story(db, story_id)
    ensure_visible(user, story)
    if story.created_by_id == user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous ne pouvez pas valider votre propre récit.",
        )
    if story.workflow_status == WorkflowStatus.draft:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un brouillon ne peut pas être relu tant qu'il n'est pas soumis.",
        )
    if validation_status == ValidationStatus.correction_requested:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Une demande de correction doit comporter un commentaire.",
        )
    if validation_status == ValidationStatus.pending:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Le retour en attente suit une modification du récit.",
        )
    from app.services.review_service import record_decision

    decision = "approved" if validation_status == ValidationStatus.validated else "rejected"
    record_decision(db, user, story, decision, "")
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
    ensure_visible(user, story)
    if not is_favorite(db, user, story.id):
        db.add(Favorite(user_id=user.id, story_id=story.id))
        db.commit()
    return serialize_story(get_story(db, story.id), True)


def remove_favorite(db: Session, user: User, story_id: uuid.UUID) -> None:
    story = get_story(db, story_id)
    ensure_visible(user, story)
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
    readable = []
    for story in stories:
        if not can_read_story(user, story):
            continue
        _trace_sensitive_read(user, story)
        readable.append(story)
    return [serialize_story(story, True) for story in readable]
