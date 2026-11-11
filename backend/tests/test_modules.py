from tests.helpers import auth_header, register


def test_module_status_exposes_no_results(client):
    user = register(client)
    response = client.get("/api/modules/status", headers=auth_header(user))
    assert response.status_code == 200
    payload = response.json()
    assert "médicale" in payload["disclaimer"]
    assert payload["phase"] == "1"
    for name, module in payload["modules"].items():
        assert module["status"] == "not_implemented", name
        assert module["result"] is None
    anonymous = client.get("/api/modules/status")
    assert anonymous.status_code == 401
