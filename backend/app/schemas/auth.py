import re

from pydantic import BaseModel, Field, field_validator

from app.core.enums import LanguageCode
from app.schemas import UserPublic


_EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _normalize_email(value: str) -> str:
    email = value.strip().lower()
    if not _EMAIL.fullmatch(email) or len(email) > 255:
        raise ValueError("Adresse e-mail invalide.")
    return email


class RegisterRequest(BaseModel):
    email: str
    password: str = Field(min_length=8, max_length=72)
    full_name: str = Field(min_length=2, max_length=120)
    preferred_language: LanguageCode = LanguageCode.fr

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return _normalize_email(value)

    @field_validator("full_name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        cleaned = " ".join(value.split())
        if len(cleaned) < 2:
            raise ValueError("Le nom doit contenir au moins 2 caractères.")
        return cleaned

    @field_validator("password")
    @classmethod
    def password_size(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Le mot de passe dépasse la limite de 72 octets.")
        return value


class LoginRequest(BaseModel):
    email: str
    password: str = Field(min_length=1, max_length=72)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return _normalize_email(value)


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class RoleUpdate(BaseModel):
    role: str

    @field_validator("role")
    @classmethod
    def known_role(cls, value: str) -> str:
        allowed = {"contributor", "validator", "admin"}
        if value not in allowed:
            raise ValueError("Rôle inconnu.")
        return value
