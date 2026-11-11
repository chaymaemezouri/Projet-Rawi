from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession
from app.schemas.story import StoryList
from app.services import story_service

router = APIRouter(prefix="/me")


@router.get("/favorites", response_model=StoryList)
def read_favorites(user: CurrentUser, db: DbSession) -> StoryList:
    items = story_service.list_favorites(db, user)
    return StoryList(items=items, total=len(items))
