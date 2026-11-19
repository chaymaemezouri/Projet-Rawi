from sqlalchemy import select

from app.core.enums import UserRole
from app.models import User
from tests.helpers import auth_header, register, story_payload


def _category_id(client, slug="masque-visage") -> str:
    return next(item["id"] for item in client.get("/api/categories").json() if item["slug"] == slug)


def _create(client, owner, **overrides) -> dict:
    created = client.post(
        "/api/stories",
        json=story_payload(_category_id(client, overrides.pop("slug", "masque-visage")), **overrides),
        headers=auth_header(owner),
    )
    assert created.status_code == 201, created.text
    return created.json()


def test_search_filters_sort_and_hides_private_stories(client):
    owner = register(client, "library-owner@rawi.test")
    other = register(client, "library-other@rawi.test")
    published = _create(
        client,
        owner,
        title="Masque au rhassoul publié",
        mentioned_ingredients="rhassoul, rose",
        origin_place="Marrakech",
        publish_authorized=True,
        collected_on="2024-05-01",
    )
    _create(
        client,
        owner,
        title="Huile privée non publiée",
        slug="huile-massage",
        original_content="Cette huile d'argan reste hors publication pour ce test.",
        mentioned_ingredients="argan",
        publish_authorized=False,
    )
    _create(
        client,
        owner,
        title="Brouillon au rhassoul",
        original_content="Brouillon qui cite le rhassoul et ne doit pas être listé.",
        mentioned_ingredients="rhassoul",
        workflow_status="draft",
        consent=False,
        publish_authorized=False,
    )
    later = _create(
        client,
        other,
        title="Zitoune de Fès",
        slug="huile-massage",
        language="ar",
        original_content="On presse les olives de la région pour le massage.",
        mentioned_ingredients="olive",
        origin_place="Fès",
        publish_authorized=True,
        collected_on="2025-01-15",
    )

    catalog = client.get("/api/stories", headers=auth_header(other))
    assert catalog.status_code == 200
    titles = {item["title"] for item in catalog.json()["items"]}
    assert published["title"] in titles
    assert "Huile privée non publiée" not in titles
    assert "Brouillon au rhassoul" not in titles

    found = client.get("/api/stories?q=rhassoul", headers=auth_header(other))
    assert [item["id"] for item in found.json()["items"]] == [published["id"]]
    assert found.json()["total"] == 1

    mine = client.get("/api/stories?mine=true&q=rhassoul", headers=auth_header(owner))
    assert mine.json()["total"] == 2

    combined = client.get(
        "/api/stories?q=olive&language=ar&origin=Fès&source=oral",
        headers=auth_header(owner),
    )
    assert [item["id"] for item in combined.json()["items"]] == [later["id"]]

    dated = client.get("/api/stories?collected_from=2025-01-01&collected_to=2025-02-01", headers=auth_header(owner))
    assert [item["id"] for item in dated.json()["items"]] == [later["id"]]
    invalid = client.get("/api/stories?collected_from=2025-02-01&collected_to=2024-01-01", headers=auth_header(owner))
    assert invalid.status_code == 422

    ordered = client.get("/api/stories?sort=title", headers=auth_header(owner))
    ordered_titles = [item["title"] for item in ordered.json()["items"]]
    assert ordered_titles == sorted(ordered_titles, key=str.casefold)

    page = client.get("/api/stories?limit=1&offset=0&sort=title", headers=auth_header(owner))
    assert page.json()["total"] == 2
    assert len(page.json()["items"]) == 1
    nxt = client.get("/api/stories?limit=1&offset=1&sort=title", headers=auth_header(owner))
    assert page.json()["items"][0]["id"] != nxt.json()["items"][0]["id"]


def test_similar_stories_explain_overlaps_without_private_rows(client):
    owner = register(client, "similar-owner@rawi.test")
    other = register(client, "similar-other@rawi.test")
    first = _create(
        client,
        owner,
        title="Masque au rhassoul",
        mentioned_ingredients="rhassoul, rose",
        origin_place="Marrakech",
        publish_authorized=True,
    )
    second = _create(
        client,
        other,
        title="Autre masque au rhassoul",
        mentioned_ingredients="rhassoul",
        origin_place="Marrakech",
        publish_authorized=True,
    )
    _create(
        client,
        other,
        title="Masque secret",
        mentioned_ingredients="rhassoul",
        origin_place="Marrakech",
        publish_authorized=False,
    )
    related = client.get(f"/api/stories/{first['id']}/similar", headers=auth_header(owner))
    assert related.status_code == 200, related.text
    body = related.json()
    assert [item["story"]["id"] for item in body] == [second["id"]]
    codes = {reason["code"] for reason in body[0]["reasons"]}
    assert "category" in codes
    assert "ingredient" in codes
    assert "origin" in codes
    assert all(reason["code"] != "semantic" for reason in body[0]["reasons"])


def test_cover_follows_publication_and_revision_names_the_author(client, db_session):
    owner = register(client, "cover-owner@rawi.test")
    other = register(client, "cover-other@rawi.test")
    reviewer = register(client, "cover-reviewer@rawi.test", full_name="Hassan Alami")
    account = db_session.scalar(select(User).where(User.email == "cover-reviewer@rawi.test"))
    account.role = UserRole.validator
    db_session.commit()
    story = _create(client, owner, publish_authorized=False)
    jpeg = b"\xff\xd8\xff\xe0" + b"\x00" * 16
    stored = client.post(
        f"/api/stories/{story['id']}/media",
        files={"file": ("rose.jpg", jpeg, "image/jpeg")},
        data={"consent_to_retain": "true"},
        headers=auth_header(owner),
    )
    assert stored.status_code == 201, stored.text
    hidden = client.get(f"/api/stories/{story['id']}/cover", headers=auth_header(other))
    assert hidden.status_code == 404
    own = client.get(f"/api/stories/{story['id']}/cover", headers=auth_header(owner))
    assert own.status_code == 200
    assert own.content.startswith(b"\xff\xd8\xff")
    listed = client.get("/api/stories?mine=true", headers=auth_header(owner))
    assert listed.json()["items"][0]["has_image"] is True
    public = client.get("/api/stories", headers=auth_header(other))
    assert public.json()["total"] == 0

    asked = client.post(
        f"/api/stories/{story['id']}/corrections",
        json={"comment": "Préciser la rose utilisée."},
        headers=auth_header(reviewer),
    )
    assert asked.status_code == 200
    history = client.get(f"/api/stories/{story['id']}/revisions", headers=auth_header(owner))
    assert history.json()[0]["created_by_name"] == "Hassan Alami"
    assert client.get(f"/api/stories/{story['id']}/revisions", headers=auth_header(other)).status_code == 404
