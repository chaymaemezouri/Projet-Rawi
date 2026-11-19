from uuid import UUID

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field

from app.api.deps import CurrentUser, DbSession
from app.services.review_service import decide, dossier, queue

router = APIRouter(prefix="/reviews")


class ReviewBody(BaseModel):
    decision: str = Field(pattern="^(approved|rejected|comment)$")
    comment: str = ""


@router.get("/queue")
def read_queue(
    user: CurrentUser,
    db: DbSession,
    validation_status: str | None = Query(default=None),
) -> dict:
    return queue(db, user, validation_status)


@router.get("/{story_id}")
def read_dossier(story_id: UUID, user: CurrentUser, db: DbSession) -> dict:
    return dossier(db, user, story_id)


@router.post("/{story_id}")
def add_review(story_id: UUID, payload: ReviewBody, user: CurrentUser, db: DbSession) -> dict:
    return decide(db, user, story_id, payload.decision, payload.comment)
