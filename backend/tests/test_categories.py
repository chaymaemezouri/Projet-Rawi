from sqlalchemy import select

from app.core.enums import UserRole
from app.models import User
from tests.helpers import auth_header, register, story_payload


def test_categories_are_seeded_and_public(client):
    response = client.get("/api/categories")
    assert response.status_code == 200
    slugs = {item["slug"] for item in response.json()}
    assert {"masque-visage", "gommage-hammam", "soin-cheveux", "huile-massage"} <= slugs


def test_only_admin_manages_categories(client, db_session):
    owner = register(client, "owner@rawi.test")
    admin = register(client, "admin@rawi.test", full_name="Admin RAWI")
    admin_user = db_session.scalar(select(User).where(User.email == "admin@rawi.test"))
    admin_user.role = UserRole.admin
    db_session.commit()

    payload = {
        "slug": "soin-corps",
        "name_fr": "Soin du corps",
        "name_ar": "عناية الجسد",
        "name_ary": "العناية بالجسم",
        "description_fr": "Préparations pour le corps.",
        "description_ar": "تحضيرات للجسد.",
        "description_ary": "تحضيرات للجسم.",
    }
    forbidden = client.post("/api/categories", json=payload, headers=auth_header(owner))
    assert forbidden.status_code == 403

    created = client.post("/api/categories", json=payload, headers=auth_header(admin))
    assert created.status_code == 201
    assert created.json()["slug"] == "soin-corps"

    story = client.post(
        "/api/stories",
        json=story_payload(created.json()["id"]),
        headers=auth_header(owner),
    )
    assert story.status_code == 201
    conflict = client.delete(f"/api/categories/{created.json()['id']}", headers=auth_header(admin))
    assert conflict.status_code == 409
