import uuid

from fastapi import APIRouter, Response, status

from app.api.deps import AdminUser, DbSession
from app.schemas import CategoryRead, CategoryWrite
from app.services import category_service

router = APIRouter(prefix="/categories")


@router.get("", response_model=list[CategoryRead])
def read_categories(db: DbSession) -> list:
    return category_service.list_categories(db)


@router.post("", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(payload: CategoryWrite, _admin: AdminUser, db: DbSession):
    return category_service.create_category(db, payload)


@router.patch("/{category_id}", response_model=CategoryRead)
def update_category(category_id: uuid.UUID, payload: CategoryWrite, _admin: AdminUser, db: DbSession):
    return category_service.update_category(db, category_id, payload)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_category(category_id: uuid.UUID, _admin: AdminUser, db: DbSession) -> Response:
    category_service.delete_category(db, category_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
