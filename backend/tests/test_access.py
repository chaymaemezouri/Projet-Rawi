import logging

from sqlalchemy import select

from app.core.enums import UserRole
from app.models import User
from tests.helpers import auth_header, register, story_payload


def _category_id(client) -> str:
    return next(item["id"] for item in client.get("/api/categories").json() if item["slug"] == "masque-visage")


def _promote(db_session, email: str, role: UserRole) -> None:
    account = db_session.scalar(select(User).where(User.email == email))
    account.role = role
    db_session.commit()


def _create(client, owner, **overrides) -> dict:
    created = client.post(
        "/api/stories",
        json=story_payload(_category_id(client), **overrides),
        headers=auth_header(owner),
    )
    assert created.status_code == 201, created.text
    return created.json()


def _wav() -> bytes:
    return b"RIFF$\x00\x00\x00WAVEfmt \x10\x00\x00\x00" + b"\x00" * 16


def test_direct_access_follows_publication_and_roles(client, db_session, caplog):
    author = register(client, "access-a@rawi.test", full_name="Contributrice A")
    other = register(client, "access-b@rawi.test", full_name="Contributeur B")
    reviewer = register(client, "access-validator@rawi.test", full_name="Validateur")
    admin = register(client, "access-admin@rawi.test", full_name="Admin local")
    _promote(db_session, "access-validator@rawi.test", UserRole.validator)
    _promote(db_session, "access-admin@rawi.test", UserRole.admin)

    draft = _create(
        client,
        author,
        title="Brouillon de A",
        workflow_status="draft",
        consent=False,
        publish_authorized=False,
        original_content="Brouillon secret de la contributrice A.",
        mentioned_ingredients="secret-brouillon",
    )
    private = _create(
        client,
        author,
        title="Soumis non publie de A",
        publish_authorized=False,
        original_content="Recit soumis mais non autorise a la publication.",
        mentioned_ingredients="secret-non-publie",
    )
    audio = client.post(
        f"/api/stories/{private['id']}/media",
        files={"file": ("note.wav", _wav(), "audio/wav")},
        data={"consent_to_retain": "true"},
        headers=auth_header(author),
    )
    assert audio.status_code == 201, audio.text
    media_id = audio.json()["id"]

    assert client.get(f"/api/stories/{draft['id']}", headers=auth_header(author)).status_code == 200
    assert client.get(f"/api/stories/{draft['id']}", headers=auth_header(other)).status_code == 404
    assert client.get(f"/api/stories/{private['id']}", headers=auth_header(author)).status_code == 200
    denied = client.get(f"/api/stories/{private['id']}", headers=auth_header(other))
    assert denied.status_code == 404
    assert "non autorise" not in denied.text

    for path in (
        f"/api/stories/{private['id']}/media",
        f"/api/stories/{private['id']}/media/{media_id}/file",
        f"/api/stories/{private['id']}/revisions",
        f"/api/stories/{private['id']}/corrections",
        f"/api/stories/{private['id']}/similar",
        f"/api/stories/{private['id']}/cover",
    ):
        assert client.get(path, headers=auth_header(other)).status_code == 404, path
    transcript = client.post(
        f"/api/stories/{private['id']}/media/{media_id}/transcription",
        headers=auth_header(other),
    )
    assert transcript.status_code == 404
    extracted = client.post(
        f"/api/stories/{private['id']}/media/{media_id}/extraction",
        json={"manuscript": False},
        headers=auth_header(other),
    )
    assert extracted.status_code == 404
    assert client.post(f"/api/stories/{private['id']}/favorite", headers=auth_header(other)).status_code == 404

    published = _create(
        client,
        author,
        title="Recit publie de A",
        publish_authorized=True,
        original_content="Recit autorise dans le catalogue partage.",
        mentioned_ingredients="rhassoul",
    )
    assert client.get(f"/api/stories/{published['id']}", headers=auth_header(other)).status_code == 200
    favorite = client.post(f"/api/stories/{published['id']}/favorite", headers=auth_header(other))
    assert favorite.status_code == 200

    revoked = client.patch(
        f"/api/stories/{published['id']}",
        json=story_payload(_category_id(client), title="Recit publie de A", publish_authorized=False),
        headers=auth_header(author),
    )
    assert revoked.status_code == 200
    assert client.get(f"/api/stories/{published['id']}", headers=auth_header(other)).status_code == 404
    favorites = client.get("/api/me/favorites", headers=auth_header(other))
    assert all(item["id"] != published["id"] for item in favorites.json()["items"])

    assert client.get(f"/api/stories/{private['id']}", headers=auth_header(reviewer)).status_code == 200
    assert client.get(f"/api/stories/{draft['id']}", headers=auth_header(reviewer)).status_code == 404
    review_media = client.get(f"/api/stories/{private['id']}/media", headers=auth_header(reviewer))
    assert review_media.status_code == 200

    with caplog.at_level(logging.INFO, logger="app.services.story_service"):
        admin_read = client.get(f"/api/stories/{draft['id']}", headers=auth_header(admin))
    assert admin_read.status_code == 200
    assert "sensitive_admin_read" in caplog.text
    assert draft["id"] in caplog.text

    catalog = client.get("/api/stories?q=secret-non-publie", headers=auth_header(other))
    assert catalog.json()["total"] == 0
    counted = client.get("/api/stories", headers=auth_header(other))
    assert all(item["id"] not in {draft["id"], private["id"], published["id"]} for item in counted.json()["items"])
    own_private = client.get("/api/stories?mine=true&q=secret-brouillon", headers=auth_header(author))
    assert own_private.json()["total"] == 1
