import uuid

from app.core.enums import ValidationStatus
from app.models import Story
from tests.helpers import auth_header, register, story_payload


def _category(client) -> str:
    return next(item["id"] for item in client.get("/api/categories").json() if item["slug"] == "masque-visage")


def _story(client, headers, category_id: str, title: str, text: str):
    response = client.post("/api/stories", json=story_payload(category_id, title=title, original_content=text), headers=headers)
    assert response.status_code == 201, response.text
    return response.json()


def _inherit(db_session, story_id: str) -> None:
    story = db_session.get(Story, uuid.UUID(story_id))
    story.validation_status = ValidationStatus.validated
    story.publish_authorized = True
    db_session.commit()


def test_recipe_keeps_sources_and_does_not_invent_values(client, db_session):
    owner = register(client, "recipe-owner@rawi.test")
    other = register(client, "recipe-other@rawi.test")
    headers = auth_header(owner)
    category_id = _category(client)
    first = _story(client, headers, category_id, "Rhassoul trois", "Elle prenait trois cuillères de rhassoul et les mélangeait. Pose de 10 minutes.")
    second = _story(client, headers, category_id, "Rhassoul deux", "Elle prenait deux cuillères de rhassoul et les mélangeait. Pose de 20 minutes.")
    plain = _story(client, headers, category_id, "Rhassoul seul", "Le rhassoul était posé.")
    private = _story(client, headers, category_id, "Privé", "secret-recette-privee dans un récit non publié.")

    compared = client.post("/api/recipes", json={"title": "Fiche rhassoul", "story_ids": [first["id"], second["id"]]}, headers=headers)
    assert compared.status_code == 200, compared.text
    body = compared.json()
    assert body["status"] == "draft"
    passages = {item["passage"] for item in body["body"]["quantities"]}
    assert "trois cuillères" in passages
    assert "deux cuillères" in passages
    assert "2.5" not in compared.text
    assert body["body"]["divergences"]
    assert {item["content_sha256"] for item in body["sources"]}
    assert all(item["revision"] == 0 for item in body["sources"])
    assert "recommandation médicale" in body["notice"]

    missing = client.post("/api/recipes", json={"title": "Fiche incomplète", "story_ids": [plain["id"]]}, headers=headers)
    assert missing.status_code == 200
    assert missing.json()["body"]["quantities"] == []
    assert "quantity" in missing.json()["body"]["missing"]
    assert missing.json()["body"]["comparison_status"] == "insufficient"

    hidden = client.post("/api/recipes", json={"title": "Fiche privée", "story_ids": [private["id"]]}, headers=headers)
    recipe_id = hidden.json()["id"]
    denied = client.get(f"/api/recipes/{recipe_id}", headers=auth_header(other))
    assert denied.status_code == 404
    assert "secret-recette-privee" not in denied.text
    assert "secret-recette-privee" not in client.get("/api/recipes", headers=auth_header(other)).text

    blocked = client.post(f"/api/recipes/{body['id']}/publication", headers=headers)
    assert blocked.status_code == 422
    _inherit(db_session, first["id"])
    _inherit(db_session, second["id"])
    inherited = client.post("/api/recipes", json={"title": "Fiche héritée", "story_ids": [first["id"], second["id"]]}, headers=headers)
    assert inherited.json()["sources"][0]["approval"] == "inherited"
    published = client.post(f"/api/recipes/{inherited.json()['id']}/publication", headers=headers)
    assert published.status_code == 200
    assert published.json()["status"] == "published"

    changed = client.patch(
        f"/api/stories/{first['id']}",
        json=story_payload(category_id, title="Rhassoul trois", original_content="Elle prenait quatre cuillères de rhassoul."),
        headers=headers,
    )
    assert changed.status_code == 200
    stale = client.get(f"/api/recipes/{inherited.json()['id']}", headers=headers)
    assert stale.json()["status"] == "obsolete"
    assert client.get(f"/api/recipes/{inherited.json()['id']}", headers=auth_header(other)).status_code == 404

    corrected = client.post(
        f"/api/recipes/{body['id']}/corrections",
        json={"field": "title", "replacement": "Fiche relue", "note": "Titre choisi par le contributeur."},
        headers=headers,
    )
    assert corrected.json()["title"] == "Fiche relue"
    history = client.get(f"/api/recipes/{body['id']}/revisions", headers=headers)
    assert [item["reason"] for item in history.json()] == ["generated", "correction"]
    assert history.json()[0]["title"] == "Fiche rhassoul"
    assert client.get(f"/api/stories/{first['id']}", headers=headers).json()["original_content"].startswith("Elle prenait quatre")

    exported = client.get(f"/api/recipes/{body['id']}/export", headers=headers)
    assert exported.status_code == 200
    assert exported.content.startswith(b"%PDF")
    assert b"Fiche relue" in exported.content
    assert b"Statut documentaire" in exported.content


def test_stale_recipe_is_refused_before_another_reader_sees_it(client, db_session):
    owner = register(client, "stale-owner@rawi.test")
    other = register(client, "stale-other@rawi.test")
    headers = auth_header(owner)
    other_headers = auth_header(other)
    category_id = _category(client)
    secret = "secret-obsolete-recette ne doit pas sortir."
    story = _story(client, headers, category_id, "Source stable", secret + " Elle mélangeait le rhassoul pendant 10 minutes.")
    _inherit(db_session, story["id"])
    created = client.post("/api/recipes", json={"title": "Fiche stable", "story_ids": [story["id"]]}, headers=headers)
    recipe_id = created.json()["id"]
    assert client.post(f"/api/recipes/{recipe_id}/publication", headers=headers).status_code == 200

    changed = client.patch(
        f"/api/stories/{story['id']}",
        json=story_payload(category_id, title="Source stable", original_content="Elle mélangeait le rhassoul autrement.", publish_authorized=True),
        headers=headers,
    )
    assert changed.status_code == 200
    denied = client.get(f"/api/recipes/{recipe_id}", headers=other_headers)
    assert denied.status_code == 404
    assert secret not in denied.text
    assert client.get(f"/api/recipes/{recipe_id}/export", headers=other_headers).status_code == 404
    assert client.get(f"/api/guides/{recipe_id}", headers=other_headers).status_code == 404
    assert secret not in client.get("/api/recipes", headers=other_headers).text
    owner_view = client.get(f"/api/recipes/{recipe_id}", headers=headers)
    assert owner_view.json()["status"] == "obsolete"
    assert client.get(f"/api/recipes/{recipe_id}/export", headers=headers).status_code == 409
    assert client.post(f"/api/guides/{recipe_id}/start", json={"version": owner_view.json()["version"]}, headers=headers).status_code == 403

    second = _story(client, headers, category_id, "Source retirée", "Elle posait le rhassoul. secret-retrait-publication.")
    _inherit(db_session, second["id"])
    again = client.post("/api/recipes", json={"title": "Fiche retirée", "story_ids": [second["id"]]}, headers=headers)
    again_id = again.json()["id"]
    assert client.post(f"/api/recipes/{again_id}/publication", headers=headers).status_code == 200
    withdrawn = client.patch(
        f"/api/stories/{second['id']}",
        json=story_payload(
            category_id,
            title="Source retirée",
            original_content="Elle posait le rhassoul. secret-retrait-publication.",
            publish_authorized=False,
        ),
        headers=headers,
    )
    assert withdrawn.status_code == 200
    hidden = client.get(f"/api/recipes/{again_id}", headers=other_headers)
    assert hidden.status_code == 404
    assert "secret-retrait-publication" not in hidden.text
    assert client.get(f"/api/recipes/{again_id}", headers=headers).json()["status"] == "obsolete"
