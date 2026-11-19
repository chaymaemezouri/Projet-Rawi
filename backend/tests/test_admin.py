import uuid

from sqlalchemy import select

from app.core.enums import UserRole
from app.models import Story, User
from tests.helpers import auth_header, register, story_payload


def _category(client) -> str:
    return next(item["id"] for item in client.get("/api/categories").json() if item["slug"] == "masque-visage")


def _admin(client, db_session, email: str):
    account = register(client, email, full_name="Admin Test")
    user = db_session.scalar(select(User).where(User.email == email))
    user.role = UserRole.admin
    db_session.commit()
    return account


def test_admin_space_is_restricted_and_keeps_records(client, db_session):
    owner = register(client, "admin-owner@rawi.test", full_name="Amina Benali")
    other = register(client, "admin-other@rawi.test", full_name="Khadija Amrani")
    admin = _admin(client, db_session, "admin-space@rawi.test")
    headers = auth_header(admin)
    owner_headers = auth_header(owner)
    assert client.get("/api/admin/summary", headers=owner_headers).status_code == 403

    story = client.post(
        "/api/stories",
        json=story_payload(_category(client), title="Récit admin", original_content="secret-admin-prive ne sort pas.", workflow_status="draft", consent=False, publish_authorized=False),
        headers=owner_headers,
    )
    assert story.status_code == 201, story.text
    story_id = story.json()["id"]
    read = client.get(f"/api/stories/{story_id}", headers=headers)
    assert read.status_code == 200
    summary = client.get("/api/admin/summary", headers=headers)
    assert summary.status_code == 200
    body = summary.json()
    assert body["users"] >= 3
    assert body["stories"] >= 1
    assert body["categories"] >= 4
    assert isinstance(body["pending_validations"], int)
    assert isinstance(body["recipes"], int)
    assert isinstance(body["deletions"], int)

    found = client.get("/api/admin/users", params={"q": "khadija"}, headers=headers)
    assert found.status_code == 200
    assert found.json()["items"][0]["email"] == "admin-other@rawi.test"
    assert "hashed_password" not in found.text
    assert client.patch(f"/api/admin/users/{found.json()['items'][0]['id']}/role", json={"role": "admin"}, headers=owner_headers).status_code == 403

    promoted = client.patch(f"/api/admin/users/{found.json()['items'][0]['id']}/role", json={"role": "validator"}, headers=headers)
    assert promoted.status_code == 200
    assert promoted.json()["role"] == "validator"
    validators = client.get("/api/admin/validators", headers=headers).json()["items"]
    assert any(item["email"] == "admin-other@rawi.test" for item in validators)

    alone = client.patch(f"/api/admin/users/{admin.json()['user']['id']}/active", json={"active": False}, headers=headers)
    assert alone.status_code == 409
    demoted = client.patch(f"/api/admin/users/{admin.json()['user']['id']}/role", json={"role": "contributor"}, headers=headers)
    assert demoted.status_code == 409
    second = _admin(client, db_session, "admin-second@rawi.test")
    disabled = client.patch(f"/api/admin/users/{second.json()['user']['id']}/active", json={"active": False}, headers=headers)
    assert disabled.status_code == 200
    assert disabled.json()["is_active"] is False
    assert client.post("/api/auth/login", json={"email": "admin-second@rawi.test", "password": "motdepasse1"}).status_code == 403

    created = client.post(
        "/api/categories",
        json={
            "slug": "soin-admin",
            "name_fr": "Soin admin",
            "name_ar": "عناية",
            "name_ary": "عناية",
            "description_fr": "",
            "description_ar": "",
            "description_ary": "",
        },
        headers=headers,
    )
    assert created.status_code == 201
    category_id = created.json()["id"]
    linked = client.post(
        "/api/stories",
        json=story_payload(category_id, title="Lié à la catégorie", original_content="Texte lié à la catégorie admin."),
        headers=owner_headers,
    )
    assert linked.status_code == 201
    off = client.patch(f"/api/admin/categories/{category_id}/active", json={"active": False}, headers=headers)
    assert off.status_code == 200
    assert off.json()["stories"] == 1
    assert "soin-admin" not in {item["slug"] for item in client.get("/api/categories").json()}
    assert client.get(f"/api/stories/{linked.json()['id']}", headers=owner_headers).status_code == 200
    assert db_session.get(Story, uuid.UUID(linked.json()["id"])).category_id is not None

    request = client.post("/api/me/deletion-requests", json={"scope": "account", "reason": "Conservation seulement."}, headers=owner_headers)
    assert request.status_code == 200
    reviewed = client.patch(f"/api/admin/deletions/{request.json()['id']}", json={"status": "retained"}, headers=headers)
    assert reviewed.status_code == 200
    assert reviewed.json()["kept"] is True
    assert client.get("/api/auth/me", headers=owner_headers).status_code == 200
    assert client.get(f"/api/stories/{story_id}", headers=owner_headers).status_code == 200

    journal = client.get("/api/admin/journal", headers=headers)
    assert journal.status_code == 200
    assert "role_changed" in journal.text
    assert "sensitive_read" in journal.text
    assert "secret-admin-prive" not in journal.text
    moderation = client.get("/api/admin/moderation", headers=headers)
    assert moderation.status_code == 200
    assert "secret-admin-prive" not in moderation.text

    exported = client.get("/api/admin/export", params={"format": "json", "kind": "stories"}, headers=headers)
    assert exported.status_code == 200
    assert b"secret-admin-prive" not in exported.content
    assert b"hashed_password" not in exported.content
    csv_export = client.get("/api/admin/export", params={"format": "csv", "kind": "users"}, headers=headers)
    assert csv_export.status_code == 200
    assert csv_export.headers["content-type"].startswith("text/csv")
    assert b"admin-owner@rawi.test" in csv_export.content
    assert client.get("/api/admin/export", headers=owner_headers).status_code == 403
