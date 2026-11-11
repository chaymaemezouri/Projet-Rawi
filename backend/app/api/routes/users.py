import uuid

from fastapi import APIRouter

from app.api.deps import AdminUser, DbSession
from app.schemas import UserPublic
from app.schemas.auth import RoleUpdate
from app.services.user_service import list_users, set_user_role

router = APIRouter(prefix="/users")


@router.get("", response_model=list[UserPublic])
def read_users(_admin: AdminUser, db: DbSession) -> list:
    return list_users(db)


@router.patch("/{user_id}/role", response_model=UserPublic)
def update_role(user_id: uuid.UUID, payload: RoleUpdate, admin: AdminUser, db: DbSession):
    return set_user_role(db, admin, user_id, payload.role)
