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


def _inherit(db_session, story_id: str) -> None:
    story = db_session.get(Story, uuid.UUID(story_id))
    story.validation_status = ValidationStatus.validated
    story.publish_authorized = True
    db_session.commit()


def test_practical_guide_requires_a_current_safety_review(client, db_session, caplog):
    owner = register(client, "guide-owner@rawi.test")
    other = register(client, "guide-other@rawi.test")
    reviewer = register(client, "guide-reviewer@rawi.test", full_name="Sara Bennani")
    _promote(db_session, "guide-reviewer@rawi.test")
    headers = auth_header(owner)
    category_id = _category(client)
    created = client.post(
        "/api/stories",
        json=story_payload(category_id, title="Rituel rhassoul", original_content="Elle mélangeait le rhassoul. Pose de 10 minutes."),
        headers=headers,
    )
    story_id = created.json()["id"]
    _inherit(db_session, story_id)
    recipe = client.post("/api/recipes", json={"title": "Guide rhassoul", "story_ids": [story_id]}, headers=headers)
    recipe_id = recipe.json()["id"]
    assert client.post(f"/api/recipes/{recipe_id}/publication", headers=headers).status_code == 200

    documentary = client.get(f"/api/guides/{recipe_id}", headers=auth_header(other))
    assert documentary.status_code == 200
    assert documentary.json()["mode"] == "documentary"
    assert documentary.json()["practical_allowed"] is False
    assert documentary.json()["safety"] == "absent"
    assert "usage sûr" in documentary.json()["notice"]
    assert documentary.json()["durations"][0]["seconds"] == 600
    assert documentary.json()["steps"]
    refused = client.post(f"/api/guides/{recipe_id}/start", json={"version": documentary.json()["version"]}, headers=auth_header(other))
    assert refused.status_code == 403
    assert "mélangeait" not in refused.text

    assert client.post(f"/api/guides/{recipe_id}/safety", json={"decision": "approved", "note": "Usage relu pour cette version."}, headers=headers).status_code == 403
    with caplog.at_level("INFO"):
        approved = client.post(
            f"/api/guides/{recipe_id}/safety",
            json={"decision": "approved", "note": "Usage relu pour cette version."},
            headers=auth_header(reviewer),
        )
    assert approved.status_code == 200, approved.text
    assert approved.json()["practical_allowed"] is True
    assert any("safety_review" in message for message in caplog.messages)

    started = client.post(f"/api/guides/{recipe_id}/start", json={"version": approved.json()["version"]}, headers=auth_header(other))
    assert started.status_code == 200
    assert started.json()["mode"] == "practical"
    assert started.json()["steps"][0]["passage"]
    stale_version = client.post(f"/api/guides/{recipe_id}/start", json={"version": 99}, headers=auth_header(other))
    assert stale_version.status_code == 409

    plain = client.post(
        "/api/stories",
        json=story_payload(category_id, title="Sans durée", original_content="Elle mélangeait le rhassoul."),
        headers=headers,
    )
    _inherit(db_session, plain.json()["id"])
    quiet = client.post("/api/recipes", json={"title": "Sans minuteur", "story_ids": [plain.json()["id"]]}, headers=headers)
    assert client.post(f"/api/recipes/{quiet.json()['id']}/publication", headers=headers).status_code == 200
    assert client.post(f"/api/guides/{quiet.json()['id']}/safety", json={"decision": "approved", "note": "Pas de durée écrite."}, headers=auth_header(reviewer)).status_code == 200
    opened = client.get(f"/api/guides/{quiet.json()['id']}", headers=auth_header(other))
    assert opened.json()["durations"] == []
    assert "5 minutes" not in opened.text

    private = client.post(
        "/api/stories",
        json=story_payload(category_id, title="Secret", original_content="secret-guide-prive reste hors du guide.", workflow_status="draft", consent=False),
        headers=headers,
    )
    hidden_recipe = client.post("/api/recipes", json={"title": "Fiche secrete", "story_ids": [private.json()["id"]]}, headers=headers)
    hidden = client.get(f"/api/guides/{hidden_recipe.json()['id']}", headers=auth_header(other))
    assert hidden.status_code == 404
    assert "secret-guide-prive" not in hidden.text
    assert "secret-guide-prive" not in client.get("/api/guides", headers=auth_header(other)).text

    changed = client.patch(
        f"/api/stories/{story_id}",
        json=story_payload(category_id, title="Rituel rhassoul", original_content="Elle mélangeait le rhassoul autrement."),
        headers=headers,
    )
    assert changed.status_code == 200
    blocked = client.post(f"/api/guides/{recipe_id}/start", json={"version": 1}, headers=headers)
    assert blocked.status_code == 409
    owner_view = client.get(f"/api/guides/{recipe_id}", headers=headers)
    assert owner_view.json()["status"] == "obsolete"
    assert owner_view.json()["practical_allowed"] is False
    assert client.post(f"/api/guides/{recipe_id}/start", json={"version": owner_view.json()["version"]}, headers=headers).status_code == 403
    assert client.get(f"/api/guides/{recipe_id}", headers=auth_header(other)).status_code == 404
