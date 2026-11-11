from fastapi import APIRouter, status

from app.api.deps import CurrentUser, DbSession
from app.core.security import create_access_token
from app.models import User
from app.schemas import UserPublic
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest
from app.services.user_service import authenticate, register_user

router = APIRouter(prefix="/auth")


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: DbSession) -> AuthResponse:
    user = register_user(db, payload)
    token = create_access_token(user.id, user.role.value)
    return AuthResponse(access_token=token, user=UserPublic.model_validate(user))


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: DbSession) -> AuthResponse:
    user = authenticate(db, payload)
    token = create_access_token(user.id, user.role.value)
    return AuthResponse(access_token=token, user=UserPublic.model_validate(user))


@router.get("/me", response_model=UserPublic)
def me(current_user: CurrentUser) -> User:
    return current_user
