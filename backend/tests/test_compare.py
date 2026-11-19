from tests.helpers import auth_header, register, story_payload


def _category(client, slug: str) -> str:
    return next(item["id"] for item in client.get("/api/categories").json() if item["slug"] == slug)


def _create(client, headers, category_id: str, title: str, text: str):
    response = client.post("/api/stories", json=story_payload(category_id, title=title, original_content=text), headers=headers)
    assert response.status_code == 201, response.text
    return response.json()


def test_comparison_uses_explicit_values_and_hides_private_stories(client):
    author = register(client, "compare-a@rawi.test")
    other = register(client, "compare-b@rawi.test")
    headers = auth_header(author)
    mask = _category(client, "masque-visage")
    oil = _category(client, "huile-massage")
    first = _create(client, headers, mask, "Rhassoul trois", "Elle prenait trois cuillères de rhassoul et d'eau de rose et les mélangeait. Pose de 10 minutes.")
    second = _create(client, headers, mask, "Rhassoul deux", "Elle prenait deux cuillères de rhassoul et d'eau de rose et les mélangeait. Pose de 20 minutes.")
    third = _create(client, headers, mask, "Rhassoul argan", "Elle mélangeait le rhassoul et l'argan.")
    plain = _create(client, headers, mask, "Rhassoul seul", "Le rhassoul était posé.")
    other_kind = _create(client, headers, oil, "Huile", "Elle appliquait l'huile d'argan.")
    private = _create(client, auth_header(other), mask, "Privé", "secret-compare-marker dans un récit non publié.")

    compared = client.post("/api/comparisons", json={"story_ids": [first["id"], second["id"], third["id"]]}, headers=headers)
    assert compared.status_code == 200, compared.text
    body = compared.json()
    assert body["status"] == "compared"
    assert body["indicators"]["sources"]["value"] == "3"
    assert body["indicators"]["coverage"]["value"] == "3/3"
    assert any(item["canonical"] == "rhassoul" for item in body["common"]["ingredients"])
    assert any(item["cue"] == "melang" for item in body["common"]["steps"])
    assert any(item["kind"] == "atypical" and item["canonical"] == "argan" for item in body["anomalies"])
    assert any(item["kind"] == "missing" and item["canonical"] == "eau de rose" and item["story_id"] == third["id"] for item in body["anomalies"])
    assert any(item["kind"] == "quantity" for item in body["conflicts"])
    assert any(item["rule"] == "quantity_same_unit" for item in body["contradictions"])
    assert any(item["rule"] == "duration_values" for item in body["contradictions"])
    assert "médicale" in body["notice"]
    assert "score" not in compared.text
    assert all(item["content_sha256"] and item["revision"] == 0 for item in body["sources"])
    assert client.get(f"/api/stories/{first['id']}", headers=headers).json()["original_content"] == first["original_content"]

    pair = client.post("/api/comparisons", json={"story_ids": [first["id"], second["id"]]}, headers=headers)
    assert pair.status_code == 200
    assert pair.json()["indicators"]["anomalies"]["detail"] == "données insuffisantes"
    assert not any(item["kind"] in {"atypical", "missing"} for item in pair.json()["anomalies"])

    missing_values = client.post("/api/comparisons", json={"story_ids": [plain["id"], third["id"]]}, headers=headers)
    assert missing_values.status_code == 200
    assert missing_values.json()["conflicts"] == []
    assert missing_values.json()["contradictions"] == []
    assert missing_values.json()["indicators"]["coherence"]["value"] is None
    assert missing_values.json()["indicators"]["coherence"]["detail"] == "données insuffisantes"

    mixed = client.post("/api/comparisons", json={"story_ids": [first["id"], other_kind["id"]]}, headers=headers)
    assert mixed.status_code == 200
    assert mixed.json()["status"] == "insufficient"
    assert mixed.json()["conflicts"] == []

    single = client.post("/api/comparisons", json={"story_ids": [first["id"]]}, headers=headers)
    assert single.status_code == 422

    hidden = client.post("/api/comparisons", json={"story_ids": [first["id"], private["id"]]}, headers=headers)
    assert hidden.status_code == 404
    assert "secret-compare-marker" not in hidden.text
    assert private["id"] not in hidden.text
