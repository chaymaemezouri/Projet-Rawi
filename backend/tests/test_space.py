import uuid

from sqlalchemy import select

from app.core.enums import UserRole, ValidationStatus
from app.models import Story, User
from tests.helpers import auth_header, register, story_payload


def _category(client) -> str:
    return next(item["id"] for item in client.get("/api/categories").json() if item["slug"] == "masque-visage")


def _promote(db_session, email: str) -> None:
    account = db_session.scalar(select(User).where(User.email == email))
    account.role = UserRole.validator
    db_session.commit()


def test_personal_space_is_private_and_keeps_data(client, db_session):
    owner = register(client, "space-owner@rawi.test", full_name="Amina Benali")
    other = register(client, "space-other@rawi.test", full_name="Khadija Amrani")
    reviewer = register(client, "space-reviewer@rawi.test", full_name="Hassan Alami")
    _promote(db_session, "space-reviewer@rawi.test")
    headers = auth_header(owner)
    other_headers = auth_header(other)
    category_id = _category(client)

    profile = client.patch("/api/me", json={"full_name": "Amina Alami", "preferred_language": "ary"}, headers=headers)
    assert profile.status_code == 200
    assert profile.json()["full_name"] == "Amina Alami"
    assert profile.json()["preferred_language"] == "ary"
    assert "hashed_password" not in profile.text
    assert client.get("/api/auth/me", headers=other_headers).json()["full_name"] == "Khadija Amrani"

    story = client.post(
        "/api/stories",
        json=story_payload(category_id, title="Récit espace", original_content="secret-espace-prive reste dans le compte."),
        headers=headers,
    )
    assert story.status_code == 201, story.text
    story_id = story.json()["id"]
    favorite = client.post(f"/api/stories/{story_id}/favorite", headers=headers)
    assert favorite.status_code == 200
    assert client.get("/api/me/summary", headers=headers).json()["favorites"] == 1
    assert client.get("/api/me/summary", headers=other_headers).json()["favorites"] == 0
    assert client.get("/api/me/summary", headers=headers).json()["stories"] == 1
    assert client.get("/api/me/summary", headers=other_headers).json()["stories"] == 0

    library = client.get("/api/me/library", params={"q": "espace", "kind": "stories"}, headers=headers)
    assert library.status_code == 200
    assert library.json()["items"][0]["title"] == "Récit espace"
    assert "secret-espace-prive" not in library.text
    assert client.get("/api/me/library", params={"q": "espace"}, headers=other_headers).json()["items"] == []
    assert "secret-espace-prive" not in client.get("/api/me/history", headers=other_headers).text
    assert client.get("/api/me/history", headers=headers).json()["items"][0]["title"] == "Récit espace"

    hidden = client.post("/api/recipes", json={"title": "Fiche espace privée", "story_ids": [story_id]}, headers=headers)
    assert hidden.status_code == 200, hidden.text
    denied = client.put(f"/api/me/notes/{hidden.json()['id']}", json={"body": "note secrète"}, headers=other_headers)
    assert denied.status_code == 404
    assert "secret-espace-prive" not in denied.text
    assert client.get(f"/api/recipes/{hidden.json()['id']}/export", headers=other_headers).status_code == 404

    row = db_session.get(Story, uuid.UUID(story_id))
    row.validation_status = ValidationStatus.validated
    row.publish_authorized = True
    db_session.commit()
    published = client.post("/api/recipes", json={"title": "Fiche espace publiée", "story_ids": [story_id]}, headers=headers)
    recipe_id = published.json()["id"]
    assert client.post(f"/api/recipes/{recipe_id}/publication", headers=headers).status_code == 200
    saved = client.put(f"/api/me/notes/{recipe_id}", json={"body": "Ma préparation habituelle."}, headers=other_headers)
    assert saved.status_code == 200
    assert any(item["body"] == "Ma préparation habituelle." for item in saved.json()["items"])
    assert all(item["body"] != "Ma préparation habituelle." for item in client.get("/api/me/notes", headers=headers).json()["items"])
    assert client.get("/api/me/consents", headers=headers).json()["items"][0]["consent"] is True
    assert client.get("/api/me/consents", headers=other_headers).json()["items"] == []
    pdf = client.get(f"/api/recipes/{recipe_id}/export", headers=headers)
    assert pdf.status_code == 200
    assert pdf.content.startswith(b"%PDF")

    changed = client.patch(
        f"/api/stories/{story_id}",
        json=story_payload(category_id, title="Récit espace", original_content="Le texte du récit a changé."),
        headers=headers,
    )
    assert changed.status_code == 200
    hidden_note = client.get("/api/me/notes", headers=other_headers)
    assert "Ma préparation habituelle." not in hidden_note.text
    assert client.put(f"/api/me/notes/{recipe_id}", json={"body": "Encore une note."}, headers=other_headers).status_code == 404

    correction = client.post(
        f"/api/stories/{story_id}/corrections",
        json={"comment": "Préciser la source orale."},
        headers=auth_header(reviewer),
    )
    assert correction.status_code == 200, correction.text
    notices = client.get("/api/me/notifications", headers=headers).json()["items"]
    assert any(item["kind"] == "correction" and item["title"] == "Récit espace" for item in notices)
    assert all(item["title"] != "Récit espace" for item in client.get("/api/me/notifications", headers=other_headers).json()["items"])
    key = next(item["key"] for item in notices if item["kind"] == "correction")
    read = client.post("/api/me/notifications/read", json={"key": key}, headers=headers)
    assert read.status_code == 200
    assert next(item for item in read.json()["items"] if item["key"] == key)["read"] is True
    assert client.post("/api/me/notifications/read", json={"key": key}, headers=other_headers).status_code == 404

    exported = client.get("/api/me/export", headers=headers)
    assert exported.status_code == 200
    assert "Le texte du récit a changé." in exported.text
    assert "hashed_password" not in exported.text
    assert "Le texte du récit a changé." not in client.get("/api/me/export", headers=other_headers).text
    assert "Ma préparation habituelle." not in client.get("/api/me/export", headers=other_headers).text

    request = client.post("/api/me/deletion-requests", json={"scope": "account", "reason": "Je quitte le projet."}, headers=headers)
    assert request.status_code == 200
    assert request.json()["kept"] is True
    assert client.get("/api/auth/me", headers=headers).status_code == 200
    assert client.get(f"/api/stories/{story_id}", headers=headers).status_code == 200
    story_request = client.post(
        "/api/me/deletion-requests",
        json={"scope": "story", "story_id": story_id, "reason": "Retirer ce récit plus tard."},
        headers=headers,
    )
    assert story_request.status_code == 200
    assert client.post(
        "/api/me/deletion-requests",
        json={"scope": "story", "story_id": story_id, "reason": "Récit d'un autre compte."},
        headers=other_headers,
    ).status_code == 404
