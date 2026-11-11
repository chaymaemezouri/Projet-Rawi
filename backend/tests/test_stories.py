from sqlalchemy import select

from app.core.enums import UserRole
from app.models import User
from tests.helpers import auth_header, register, story_payload


def _category_id(client) -> str:
    categories = client.get("/api/categories")
    return next(item["id"] for item in categories.json() if item["slug"] == "masque-visage")


def test_story_requires_consent_and_authentication(client):
    owner = register(client)
    category_id = _category_id(client)
    anonymous = client.post("/api/stories", json=story_payload(category_id))
    assert anonymous.status_code == 401

    refused = client.post(
        "/api/stories",
        json=story_payload(category_id, consent=False),
        headers=auth_header(owner),
    )
    assert refused.status_code == 422


def test_create_list_update_and_delete_story(client):
    owner = register(client, "owner@rawi.test")
    other = register(client, "other@rawi.test", full_name="Khadija Amrani")
    category_id = _category_id(client)

    created = client.post(
        "/api/stories",
        json=story_payload(category_id),
        headers=auth_header(owner),
    )
    assert created.status_code == 201
    story = created.json()
    assert story["content_origin"] == "collected"
    assert story["validation_status"] == "pending"
    assert story["category"]["slug"] == "masque-visage"
    assert story["created_by"]["email"] == "owner@rawi.test"
    assert story["consent"] is True
    assert "confidence" not in story
    assert "score" not in story

    listed = client.get("/api/stories?mine=true", headers=auth_header(owner))
    assert listed.status_code == 200
    assert listed.json()["total"] == 1

    hidden = client.get("/api/stories?mine=true", headers=auth_header(other))
    assert hidden.json()["total"] == 0

    visible = client.get(f"/api/stories/{story['id']}", headers=auth_header(other))
    assert visible.status_code == 200

    updated = client.patch(
        f"/api/stories/{story['id']}",
        json=story_payload(category_id, title="Masque revu"),
        headers=auth_header(owner),
    )
    assert updated.status_code == 200
    assert updated.json()["title"] == "Masque revu"

    forbidden = client.delete(f"/api/stories/{story['id']}", headers=auth_header(other))
    assert forbidden.status_code == 403

    removed = client.delete(f"/api/stories/{story['id']}", headers=auth_header(owner))
    assert removed.status_code == 204
    missing = client.get(f"/api/stories/{story['id']}", headers=auth_header(owner))
    assert missing.status_code == 404


def test_human_validation_and_favorites(client, db_session):
    owner = register(client, "owner@rawi.test")
    reviewer = register(client, "reviewer@rawi.test", full_name="Hassan Alami")
    account = db_session.scalar(select(User).where(User.email == "reviewer@rawi.test"))
    account.role = UserRole.validator
    db_session.commit()

    created = client.post(
        "/api/stories",
        json=story_payload(_category_id(client)),
        headers=auth_header(owner),
    )
    story_id = created.json()["id"]

    denied = client.patch(
        f"/api/stories/{story_id}/validation",
        json={"validation_status": "validated"},
        headers=auth_header(owner),
    )
    assert denied.status_code == 403

    accepted = client.patch(
        f"/api/stories/{story_id}/validation",
        json={"validation_status": "validated"},
        headers=auth_header(reviewer),
    )
    assert accepted.status_code == 200
    body = accepted.json()
    assert body["validation_status"] == "validated"
    assert body["validated_by"]["email"] == "reviewer@rawi.test"
    assert body["content_origin"] == "collected"

    favorite = client.post(f"/api/stories/{story_id}/favorite", headers=auth_header(owner))
    assert favorite.status_code == 200
    assert favorite.json()["is_favorite"] is True
    favorites = client.get("/api/me/favorites", headers=auth_header(owner))
    assert favorites.json()["total"] == 1

    client.delete(f"/api/stories/{story_id}/favorite", headers=auth_header(owner))
    assert client.get("/api/me/favorites", headers=auth_header(owner)).json()["total"] == 0
