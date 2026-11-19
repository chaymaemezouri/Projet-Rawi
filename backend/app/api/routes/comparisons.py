from uuid import UUID

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.api.deps import CurrentUser, DbSession
from app.services.compare import compare_stories

router = APIRouter(prefix="/comparisons")


class CompareBody(BaseModel):
    story_ids: list[UUID] = Field(min_length=2, max_length=6)


@router.post("")
def create_comparison(payload: CompareBody, user: CurrentUser, db: DbSession) -> dict:
    return compare_stories(db, user, payload.story_ids)
