from uuid import UUID

from fastapi import APIRouter, Query, Response
from pydantic import BaseModel, Field

from app.api.deps import CurrentUser, DbSession
from app.services import recipe_service

router = APIRouter(prefix="/recipes")


class RecipeCreate(BaseModel):
    title: str = Field(min_length=2, max_length=180)
    story_ids: list[UUID] = Field(min_length=1, max_length=6)


class RecipeCorrection(BaseModel):
    field: str
    replacement: str
    note: str


@router.get("")
def read_recipes(user: CurrentUser, db: DbSession, mine: bool = Query(default=False)) -> dict:
    return recipe_service.list_recipes(db, user, mine)


@router.post("")
def add_recipe(payload: RecipeCreate, user: CurrentUser, db: DbSession) -> dict:
    return recipe_service.create_recipe(db, user, payload.title, payload.story_ids)


@router.get("/{recipe_id}")
def read_recipe(recipe_id: UUID, user: CurrentUser, db: DbSession) -> dict:
    return recipe_service.read_recipe(db, user, recipe_id)


@router.get("/{recipe_id}/revisions")
def read_revisions(recipe_id: UUID, user: CurrentUser, db: DbSession) -> list[dict]:
    return recipe_service.revisions(db, user, recipe_id)


@router.post("/{recipe_id}/corrections")
def add_correction(recipe_id: UUID, payload: RecipeCorrection, user: CurrentUser, db: DbSession) -> dict:
    return recipe_service.correct_recipe(db, user, recipe_id, payload.field, payload.replacement, payload.note)


@router.post("/{recipe_id}/publication")
def publish(recipe_id: UUID, user: CurrentUser, db: DbSession) -> dict:
    return recipe_service.publish_recipe(db, user, recipe_id)


@router.get("/{recipe_id}/export")
def export_recipe(recipe_id: UUID, user: CurrentUser, db: DbSession) -> Response:
    return Response(content=recipe_service.export_pdf(db, user, recipe_id), media_type="application/pdf")
