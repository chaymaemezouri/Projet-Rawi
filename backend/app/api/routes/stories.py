import uuid

from fastapi import APIRouter, Query, Response, status

from app.api.deps import CurrentUser, DbSession
from app.core.enums import LanguageCode, ValidationStatus
from app.schemas.story import StoryList, StoryRead, StoryWrite, ValidationUpdate
from app.services import story_service

router = APIRouter(prefix="/stories")


@router.get("", response_model=StoryList)
def read_stories(
    user: CurrentUser,
    db: DbSession,
    category_id: uuid.UUID | None = None,
    language: LanguageCode | None = None,
    validation_status: ValidationStatus | None = None,
    mine: bool = False,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> StoryList:
    items, total = story_service.list_stories(
        db,
        user,
        category_id=category_id,
        language=language,
        validation_status=validation_status,
        mine=mine,
        limit=limit,
        offset=offset,
    )
    return StoryList(items=items, total=total)


@router.post("", response_model=StoryRead, status_code=status.HTTP_201_CREATED)
def create_story(payload: StoryWrite, user: CurrentUser, db: DbSession) -> StoryRead:
    return story_service.create_story(db, user, payload)


@router.get("/{story_id}", response_model=StoryRead)
def read_story(story_id: uuid.UUID, user: CurrentUser, db: DbSession) -> StoryRead:
    story = story_service.get_story(db, story_id)
    return story_service.serialize_story(story, story_service.is_favorite(db, user, story.id))


@router.patch("/{story_id}", response_model=StoryRead)
def update_story(story_id: uuid.UUID, payload: StoryWrite, user: CurrentUser, db: DbSession) -> StoryRead:
    return story_service.update_story(db, user, story_id, payload)


@router.delete("/{story_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_story(story_id: uuid.UUID, user: CurrentUser, db: DbSession) -> Response:
    story_service.delete_story(db, user, story_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch("/{story_id}/validation", response_model=StoryRead)
def validate_story(
    story_id: uuid.UUID,
    payload: ValidationUpdate,
    user: CurrentUser,
    db: DbSession,
) -> StoryRead:
    return story_service.set_validation(db, user, story_id, payload.validation_status)


@router.post("/{story_id}/favorite", response_model=StoryRead)
def add_favorite(story_id: uuid.UUID, user: CurrentUser, db: DbSession) -> StoryRead:
    return story_service.add_favorite(db, user, story_id)


@router.delete("/{story_id}/favorite", status_code=status.HTTP_204_NO_CONTENT)
def remove_favorite(story_id: uuid.UUID, user: CurrentUser, db: DbSession) -> Response:
    story_service.remove_favorite(db, user, story_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
