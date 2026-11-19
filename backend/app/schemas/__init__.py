import re
import uuid

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.enums import LanguageCode

SLUG_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    full_name: str
    role: str
    preferred_language: LanguageCode
    is_active: bool = True
    created_at: object


class CategoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    name_fr: str
    name_ar: str
    name_ary: str
    description_fr: str
    description_ar: str
    description_ary: str
    is_active: bool = True
    created_at: object


class CategoryWrite(BaseModel):
    slug: str = Field(min_length=2, max_length=80)
    name_fr: str = Field(min_length=2, max_length=120)
    name_ar: str = Field(min_length=2, max_length=120)
    name_ary: str = Field(min_length=2, max_length=120)
    description_fr: str = Field(default="", max_length=2000)
    description_ar: str = Field(default="", max_length=2000)
    description_ary: str = Field(default="", max_length=2000)

    @field_validator("slug")
    @classmethod
    def normalize_slug(cls, value: str) -> str:
        slug = value.strip().lower()
        if not SLUG_PATTERN.match(slug):
            raise ValueError("Le slug doit être en minuscules, avec des tirets (ex. masque-visage).")
        return slug

    @field_validator("name_fr", "name_ar", "name_ary")
    @classmethod
    def clean_name(cls, value: str) -> str:
        return " ".join(value.split())

    @field_validator("description_fr", "description_ar", "description_ary")
    @classmethod
    def clean_description(cls, value: str) -> str:
        return value.strip()
