def register(client, email="amina@rawi.test", password="motdepasse1", full_name="Amina Benali"):
    response = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": full_name,
            "preferred_language": "fr",
        },
    )
    assert response.status_code == 201, response.text
    return response


def auth_header(response) -> dict[str, str]:
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def story_payload(category_id=None, **overrides) -> dict:
    payload = {
        "title": "Masque au rhassoul",
        "narrator_name": "Lalla Fatima",
        "narrator_role": "grandmother",
        "source": "oral",
        "language": "fr",
        "original_content": (
            "Elle prenait trois cuillères de rhassoul et les mélangeait à l'eau de rose tiède."
        ),
        "consent": True,
        "category_id": category_id,
    }
    payload.update(overrides)
    return payload
