def test_health_and_security_headers(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "rawi-api"}
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["x-frame-options"] == "DENY"


def test_register_login_and_me(client):
    created = client.post(
        "/api/auth/register",
        json={
            "email": "Amina@Rawi.test",
            "password": "motdepasse1",
            "full_name": "Amina Benali",
            "preferred_language": "fr",
        },
    )
    assert created.status_code == 201
    body = created.json()
    assert body["user"]["email"] == "amina@rawi.test"
    assert body["user"]["role"] == "contributor"
    assert "motdepasse1" not in created.text
    assert "hashed_password" not in created.text

    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {body['access_token']}"})
    assert me.status_code == 200
    assert me.json()["full_name"] == "Amina Benali"

    login = client.post(
        "/api/auth/login",
        json={"email": "amina@rawi.test", "password": "motdepasse1"},
    )
    assert login.status_code == 200
    assert login.json()["user"]["id"] == body["user"]["id"]


def test_register_rejects_duplicate_and_bad_password(client):
    payload = {
        "email": "amina@rawi.test",
        "password": "motdepasse1",
        "full_name": "Amina Benali",
        "preferred_language": "fr",
    }
    assert client.post("/api/auth/register", json=payload).status_code == 201
    assert client.post("/api/auth/register", json=payload).status_code == 409
    payload["email"] = "autre@rawi.test"
    payload["password"] = "court"
    assert client.post("/api/auth/register", json=payload).status_code == 422


def test_login_rejects_unknown_user(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "inconnu@rawi.test", "password": "motdepasse1"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Identifiants invalides."


def test_private_route_requires_token(client):
    assert client.get("/api/auth/me").status_code == 401
    assert client.get("/api/stories").status_code == 401
