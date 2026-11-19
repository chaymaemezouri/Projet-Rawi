from uuid import UUID

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field

from app.api.deps import CurrentUser, DbSession
from app.schemas import UserPublic
from app.schemas.collection import CorrectionRead
from app.schemas.story import StoryList
from app.services import correction_service, space_service, story_service

router = APIRouter(prefix="/me")


class ProfileUpdate(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    preferred_language: str


class NoteBody(BaseModel):
    body: str = Field(min_length=1, max_length=2000)


class ReadBody(BaseModel):
    key: str = Field(min_length=3, max_length=80)


class DeletionBody(BaseModel):
    scope: str
    reason: str = Field(min_length=3, max_length=2000)
    story_id: UUID | None = None


@router.get("/summary")
def read_summary(user: CurrentUser, db: DbSession) -> dict:
    return space_service.summary(db, user)


@router.patch("", response_model=UserPublic)
def update_profile(payload: ProfileUpdate, user: CurrentUser, db: DbSession) -> UserPublic:
    return space_service.update_profile(db, user, payload.full_name, payload.preferred_language)


@router.get("/library")
def read_library(
    user: CurrentUser,
    db: DbSession,
    q: str = Query(default=""),
    kind: str = Query(default="all"),
    status: str = Query(default=""),
) -> dict:
    return space_service.library(db, user, q, kind, status or None)


@router.get("/history")
def read_history(user: CurrentUser, db: DbSession, q: str = Query(default="")) -> dict:
    return space_service.history(db, user, q)


@router.get("/notifications")
def read_notifications(user: CurrentUser, db: DbSession) -> dict:
    return space_service.notifications(db, user)


@router.post("/notifications/read")
def read_notification(payload: ReadBody, user: CurrentUser, db: DbSession) -> dict:
    return space_service.mark_read(db, user, payload.key)


@router.get("/notes")
def read_notes(user: CurrentUser, db: DbSession) -> dict:
    return space_service.list_notes(db, user)


@router.put("/notes/{recipe_id}")
def write_note(recipe_id: UUID, payload: NoteBody, user: CurrentUser, db: DbSession) -> dict:
    return space_service.save_note(db, user, recipe_id, payload.body)


@router.delete("/notes/{recipe_id}")
def remove_note(recipe_id: UUID, user: CurrentUser, db: DbSession) -> dict:
    return space_service.delete_note(db, user, recipe_id)


@router.get("/consents")
def read_consents(user: CurrentUser, db: DbSession) -> dict:
    return space_service.consents(db, user)


@router.post("/deletion-requests")
def add_deletion_request(payload: DeletionBody, user: CurrentUser, db: DbSession) -> dict:
    return space_service.request_deletion(db, user, payload.scope, payload.reason, payload.story_id)


@router.get("/export")
def export_account(user: CurrentUser, db: DbSession) -> dict:
    return space_service.export_account(db, user)


@router.get("/corrections", response_model=list[CorrectionRead])
def read_my_corrections(user: CurrentUser, db: DbSession) -> list[CorrectionRead]:
    return correction_service.list_my_open_corrections(db, user)


@router.get("/favorites", response_model=StoryList)
def read_favorites(user: CurrentUser, db: DbSession) -> StoryList:
    items = story_service.list_favorites(db, user)
    return StoryList(items=items, total=len(items))
