from uuid import UUID

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.api.deps import CurrentUser, DbSession
from app.services import guide_service

router = APIRouter(prefix="/guides")


class SafetyBody(BaseModel):
    decision: str = Field(pattern="^(approved|rejected)$")
    note: str = Field(min_length=3, max_length=2000)


class StartBody(BaseModel):
    version: int


@router.get("")
def read_guides(user: CurrentUser, db: DbSession) -> dict:
    return guide_service.list_guides(db, user)


@router.get("/{recipe_id}")
def read_guide(recipe_id: UUID, user: CurrentUser, db: DbSession) -> dict:
    return guide_service.read_guide(db, user, recipe_id)


@router.post("/{recipe_id}/safety")
def review_guide(recipe_id: UUID, payload: SafetyBody, user: CurrentUser, db: DbSession) -> dict:
    return guide_service.review_safety(db, user, recipe_id, payload.decision, payload.note)


@router.post("/{recipe_id}/start")
def start_guide(recipe_id: UUID, payload: StartBody, user: CurrentUser, db: DbSession) -> dict:
    return guide_service.start_guide(db, user, recipe_id, payload.version)
