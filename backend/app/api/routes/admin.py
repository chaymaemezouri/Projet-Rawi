from uuid import UUID

from fastapi import APIRouter, Query, Response
from pydantic import BaseModel

from app.api.deps import AdminUser, DbSession
from app.services import admin_service

router = APIRouter(prefix="/admin")


class RoleBody(BaseModel):
    role: str


class ActiveBody(BaseModel):
    active: bool


class StatusBody(BaseModel):
    status: str


@router.get("/summary")
def read_summary(_admin: AdminUser, db: DbSession) -> dict:
    return admin_service.summary(db)


@router.get("/users")
def read_users(_admin: AdminUser, db: DbSession, q: str = Query(default="")) -> dict:
    return admin_service.users(db, q)


@router.patch("/users/{user_id}/role")
def update_role(user_id: UUID, payload: RoleBody, admin: AdminUser, db: DbSession) -> dict:
    return admin_service.change_role(db, admin, user_id, payload.role)


@router.patch("/users/{user_id}/active")
def update_active(user_id: UUID, payload: ActiveBody, admin: AdminUser, db: DbSession) -> dict:
    return admin_service.change_active(db, admin, user_id, payload.active)


@router.get("/validators")
def read_validators(_admin: AdminUser, db: DbSession) -> dict:
    return admin_service.validators(db)


@router.get("/categories")
def read_categories(_admin: AdminUser, db: DbSession) -> dict:
    return admin_service.categories(db)


@router.patch("/categories/{category_id}/active")
def update_category_active(category_id: UUID, payload: ActiveBody, admin: AdminUser, db: DbSession) -> dict:
    return admin_service.set_category_active(db, admin, category_id, payload.active)


@router.get("/moderation")
def read_moderation(_admin: AdminUser, db: DbSession) -> dict:
    return admin_service.moderation(db)


@router.get("/deletions")
def read_deletions(_admin: AdminUser, db: DbSession) -> dict:
    return admin_service.deletions(db)


@router.patch("/deletions/{request_id}")
def update_deletion(request_id: UUID, payload: StatusBody, admin: AdminUser, db: DbSession) -> dict:
    return admin_service.review_deletion(db, admin, request_id, payload.status)


@router.get("/journal")
def read_journal(_admin: AdminUser, db: DbSession) -> dict:
    return admin_service.journal(db)


@router.get("/export")
def export_admin(
    admin: AdminUser,
    db: DbSession,
    export_format: str = Query(default="json", alias="format"),
    kind: str = Query(default="users"),
) -> Response:
    media, filename, body = admin_service.export_data(db, admin, export_format, kind)
    return Response(content=body, media_type=media, headers={"Content-Disposition": f'attachment; filename="{filename}"'})
