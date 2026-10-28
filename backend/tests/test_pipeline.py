from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root():
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["service"] == "TruthLens"


def test_verify_stub_contract():
    res = client.post("/api/verify", json={"answer": "U-Net was introduced in 2015."})
    assert res.status_code == 200

    data = res.json()
    assert data["answer"] == "U-Net was introduced in 2015."
    assert len(data["claims"]) == 2
    assert data["claims"][0]["verdict"] == "SUPPORTED"
    assert data["claims"][1]["verdict"] == "CONTRADICTED"
    assert data["edges"][0] == {"from_node": "answer", "to_node": "c1"}
