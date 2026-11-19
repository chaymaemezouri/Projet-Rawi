from app.services.lexicon import analyse
from tests.helpers import auth_header, register, story_payload


def _category_id(client) -> str:
    return next(item["id"] for item in client.get("/api/categories").json() if item["slug"] == "masque-visage")


def test_lexicon_reads_three_languages_without_inventing_quantities():
    french = analyse("Elle prenait trois cuillères de rhassoul et les mélangeait.")
    assert french["engine_kind"] == "lexicon"
    assert french["classification"]["category_slug"] == "masque-visage"
    assert french["extractions"]["ingredients"][0]["surface"] == "rhassoul"
    assert french["extractions"]["quantities"][0]["surface"] == "trois"
    assert french["extractions"]["quantities"][0]["unit_surface"].casefold().startswith("cuill")
    assert french["extractions"]["steps"]

    arabic = analyse("تُخلط الحناء بالماء الدافئ.")
    assert any(item["canonical"] == "henné" for item in arabic["extractions"]["ingredients"])
    assert arabic["extractions"]["quantities"] == []
    assert arabic["classification"]["category_slug"] == "soin-cheveux"

    darija = analyse("كيتخلط الغاسول مع الماء دافئ حتى لعجينة.")
    assert any(item["surface"] == "الغاسول" for item in darija["extractions"]["ingredients"])
    assert darija["extractions"]["quantities"] == []
    assert darija["extractions"]["steps"]

    empty = analyse("Aujourd'hui le ciel est clair.")
    assert empty["classification"]["status"] == "uncertain"
    assert empty["classification"]["category_slug"] is None
    assert empty["extractions"]["ingredients"] == []
    assert empty["extractions"]["quantities"] == []
    assert "score" not in empty


def test_analysis_stays_off_the_original_and_private(client):
    author = register(client, "nlp-a@rawi.test")
    other = register(client, "nlp-b@rawi.test")
    created = client.post(
        "/api/stories",
        json=story_payload(
            _category_id(client),
            publish_authorized=False,
            original_content="Elle prenait trois cuillères de rhassoul. Ne pas laisser le masque sécher.",
        ),
        headers=auth_header(author),
    )
    story_id = created.json()["id"]
    original = created.json()["original_content"]
    hidden = client.post(f"/api/stories/{story_id}/analysis", headers=auth_header(other))
    assert hidden.status_code == 404

    analysed = client.post(f"/api/stories/{story_id}/analysis", headers=auth_header(author))
    assert analysed.status_code == 200, analysed.text
    body = analysed.json()
    assert body["engine"] == "rawi-lexicon"
    assert body["extractions"]["precautions"]
    assert body["story_revision"] == 0
    corrected = client.post(
        f"/api/stories/{story_id}/analysis/corrections",
        json={"target_id": body["extractions"]["ingredients"][0]["id"], "action": "reject", "note": "Forme trop large pour ce récit."},
        headers=auth_header(author),
    )
    assert corrected.status_code == 200, corrected.text
    assert corrected.json()["extractions"]["ingredients"] == []
    assert corrected.json()["corrections"][0]["previous_value"]["surface"] == "rhassoul"
    reread = client.get(f"/api/stories/{story_id}", headers=auth_header(author))
    assert reread.json()["original_content"] == original
    assert client.get(f"/api/stories/{story_id}/analysis", headers=auth_header(other)).status_code == 404
