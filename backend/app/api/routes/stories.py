import uuid
from datetime import date

from fastapi import APIRouter, HTTPException, Query, Response, status
from pydantic import BaseModel, Field
from fastapi.responses import FileResponse

from app.api.deps import CurrentUser, DbSession
from app.core.enums import LanguageCode, StorySource, ValidationStatus
from app.schemas.collection import CorrectionRead, CorrectionWrite, RevisionRead
from app.schemas.story import SimilarStory, StoryList, StoryRead, StoryWrite, ValidationUpdate
from app.services import analysis_service, correction_service, media_service, story_service
from app.services.similarity import similar_stories

router = APIRouter(prefix="/stories")


class AnalysisCorrectionBody(BaseModel):
    target_id: str = Field(min_length=1, max_length=40)
    action: str
    replacement: str | None = None
    note: str = Field(min_length=3, max_length=1000)


@router.get("", response_model=StoryList)
def read_stories(
    user: CurrentUser,
    db: DbSession,
    category_id: uuid.UUID | None = None,
    language: LanguageCode | None = None,
    validation_status: ValidationStatus | None = None,
    mine: bool = False,
    q: str | None = Query(default=None, max_length=80),
    origin: str | None = Query(default=None, max_length=80),
    source: StorySource | None = None,
    collected_from: date | None = None,
    collected_to: date | None = None,
    has_audio: bool = False,
    has_document: bool = False,
    sort: str = Query(default="recent", pattern="^(recent|collected|title)$"),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> StoryList:
    if collected_from and collected_to and collected_from > collected_to:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="La période de collecte est invalide.")
    items, total = story_service.list_stories(
        db,
        user,
        category_id=category_id,
        language=language,
        validation_status=validation_status,
        mine=mine,
        limit=limit,
        offset=offset,
        q=q,
        origin=origin,
        source=source,
        collected_from=collected_from,
        collected_to=collected_to,
        has_audio=has_audio,
        has_document=has_document,
        sort=sort,
    )
    return StoryList(items=items, total=total)


@router.post("", response_model=StoryRead, status_code=status.HTTP_201_CREATED)
def create_story(payload: StoryWrite, user: CurrentUser, db: DbSession) -> StoryRead:
    return story_service.create_story(db, user, payload)


@router.get("/{story_id}/cover")
def read_cover(story_id: uuid.UUID, user: CurrentUser, db: DbSession) -> FileResponse:
    item, path = media_service.open_cover(db, user, story_id)
    return FileResponse(
        path,
        media_type=item.content_type,
        filename=item.original_name,
        content_disposition_type="inline",
        headers={"X-Content-Type-Options": "nosniff", "Cache-Control": "private, no-store"},
    )


@router.get("/{story_id}/similar", response_model=list[SimilarStory])
def read_similar(story_id: uuid.UUID, user: CurrentUser, db: DbSession) -> list[SimilarStory]:
    story = story_service.get_story(db, story_id)
    story_service.ensure_visible(user, story)
    return similar_stories(db, user, story)


@router.post("/{story_id}/analysis")
def create_analysis(story_id: uuid.UUID, user: CurrentUser, db: DbSession) -> dict:
    return analysis_service.run_analysis(db, user, story_id)


@router.get("/{story_id}/analysis")
def read_analysis(story_id: uuid.UUID, user: CurrentUser, db: DbSession) -> dict:
    return analysis_service.read_analysis(db, user, story_id)


@router.post("/{story_id}/analysis/corrections")
def add_analysis_correction(story_id: uuid.UUID, payload: AnalysisCorrectionBody, user: CurrentUser, db: DbSession) -> dict:
    return analysis_service.correct_analysis(db, user, story_id, payload.target_id, payload.action, payload.replacement, payload.note)


@router.get("/{story_id}", response_model=StoryRead)
def read_story(story_id: uuid.UUID, user: CurrentUser, db: DbSession) -> StoryRead:
    story = story_service.get_story(db, story_id)
    story_service.ensure_visible(user, story)
    return story_service.serialize_story(story, story_service.is_favorite(db, user, story.id))


@router.patch("/{story_id}", response_model=StoryRead)
def update_story(story_id: uuid.UUID, payload: StoryWrite, user: CurrentUser, db: DbSession) -> StoryRead:
    return story_service.update_story(db, user, story_id, payload)


@router.delete("/{story_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_story(story_id: uuid.UUID, user: CurrentUser, db: DbSession) -> Response:
    story_service.delete_story(db, user, story_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{story_id}/corrections", response_model=StoryRead)
def request_correction(
    story_id: uuid.UUID,
    payload: CorrectionWrite,
    user: CurrentUser,
    db: DbSession,
) -> StoryRead:
    return correction_service.request_correction(db, user, story_id, payload)


@router.get("/{story_id}/corrections", response_model=list[CorrectionRead])
def read_corrections(story_id: uuid.UUID, user: CurrentUser, db: DbSession) -> list[CorrectionRead]:
    return correction_service.list_story_corrections(db, user, story_id)


@router.get("/{story_id}/revisions", response_model=list[RevisionRead])
def read_revisions(story_id: uuid.UUID, user: CurrentUser, db: DbSession) -> list[RevisionRead]:
    return correction_service.list_revisions(db, user, story_id)


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
