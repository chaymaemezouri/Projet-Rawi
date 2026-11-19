from sqlalchemy import select

from app.core.enums import UserRole
from app.models import User
from tests.helpers import auth_header, register, story_payload


def _category(client) -> str:
    return next(item["id"] for item in client.get("/api/categories").json() if item["slug"] == "masque-visage")


def _promote(db_session, email: str) -> None:
    account = db_session.scalar(select(User).where(User.email == email))
    account.role = UserRole.validator
    db_session.commit()


def test_two_independent_reviews_and_private_drafts(client, db_session, caplog):
    owner = register(client, "review-owner@rawi.test")
    first = register(client, "review-one@rawi.test", full_name="Amina Tazi")
    second = register(client, "review-two@rawi.test", full_name="Youssef Amrani")
    stranger = register(client, "review-stranger@rawi.test")
    _promote(db_session, "review-one@rawi.test")
    _promote(db_session, "review-two@rawi.test")
    category_id = _category(client)
    created = client.post("/api/stories", json=story_payload(category_id, title="Relecture rhassoul"), headers=auth_header(owner))
    story_id = created.json()["id"]
    draft = client.post(
        "/api/stories",
        json=story_payload(category_id, title="Brouillon secret", original_content="secret-revue-privee", workflow_status="draft", consent=False),
        headers=auth_header(owner),
    )
    draft_id = draft.json()["id"]

    assert client.get("/api/reviews/queue", headers=auth_header(stranger)).status_code == 403
    hidden = client.get(f"/api/reviews/{draft_id}", headers=auth_header(first))
    assert hidden.status_code == 404
    assert "secret-revue-privee" not in hidden.text
    queue = client.get("/api/reviews/queue", headers=auth_header(first))
    assert queue.status_code == 200
    assert draft_id not in queue.text
    assert "secret-revue-privee" not in queue.text

    own = client.post("/api/reviews/" + story_id, json={"decision": "approved", "comment": ""}, headers=auth_header(owner))
    assert own.status_code == 403
    owner_account = db_session.scalar(select(User).where(User.email == "review-owner@rawi.test"))
    owner_account.role = UserRole.validator
    db_session.commit()
    assert client.post("/api/reviews/" + story_id, json={"decision": "approved", "comment": ""}, headers=auth_header(owner)).status_code == 403

    with caplog.at_level("INFO"):
        once = client.post("/api/reviews/" + story_id, json={"decision": "approved", "comment": "Texte lisible."}, headers=auth_header(first))
    assert once.status_code == 200, once.text
    assert once.json()["story"]["validation_status"] == "pending"
    assert once.json()["approvals"] == 1
    assert once.json()["disagreement"] is False
    assert "certification médicale" in once.json()["notice"]
    assert any("validation_decision" in message for message in caplog.messages)
    repeat = client.post("/api/reviews/" + story_id, json={"decision": "rejected", "comment": ""}, headers=auth_header(first))
    assert repeat.status_code == 409

    clash = client.post("/api/reviews/" + story_id, json={"decision": "rejected", "comment": "La durée manque."}, headers=auth_header(second))
    assert clash.status_code == 200
    body = clash.json()
    assert body["story"]["validation_status"] == "pending"
    assert body["disagreement"] is True
    assert {item["decision"] for item in body["reviews"]} == {"approved", "rejected"}

    agreed = client.post(
        "/api/stories",
        json=story_payload(category_id, title="Double accord", original_content="Elle mélangeait le rhassoul."),
        headers=auth_header(owner),
    )
    agreed_id = agreed.json()["id"]
    assert client.patch(f"/api/stories/{agreed_id}/validation", json={"validation_status": "validated"}, headers=auth_header(first)).json()["validation_status"] == "pending"
    final = client.patch(f"/api/stories/{agreed_id}/validation", json={"validation_status": "validated"}, headers=auth_header(second))
    assert final.json()["validation_status"] == "validated"
    changed = client.patch(
        f"/api/stories/{agreed_id}",
        json=story_payload(category_id, title="Double accord", original_content="Elle mélangeait le rhassoul et l'eau de rose."),
        headers=auth_header(owner),
    )
    assert changed.json()["validation_status"] == "pending"
    dossier = client.get(f"/api/reviews/{agreed_id}", headers=auth_header(first))
    assert dossier.status_code == 200
    assert dossier.json()["approvals"] == 0
    assert any(item["current"] is False and item["decision"] == "approved" for item in dossier.json()["reviews"])
    assert "score" not in dossier.text
