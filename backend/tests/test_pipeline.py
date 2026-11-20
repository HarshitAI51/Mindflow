from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root():
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["service"] == "TruthLens"


def test_verify_pipeline_contract():
    res = client.post(
        "/api/verify",
        json={"answer": "The Edgar Awards are presented by the Mystery Writers of America."},
    )
    assert res.status_code == 200

    data = res.json()
    assert data["answer"] == "The Edgar Awards are presented by the Mystery Writers of America."
    assert len(data["claims"]) >= 1

    node_ids = {"answer"}
    for claim in data["claims"]:
        node_ids.add(claim["id"])
        assert claim["verdict"] in {"SUPPORTED", "CONTRADICTED", "INSUFFICIENT_EVIDENCE"}
        assert len(claim["evidence"]) >= 1
        for ev in claim["evidence"]:
            node_ids.add(ev["id"])

    # Every graph edge must point at a real node, otherwise React Flow renders orphans.
    for edge in data["edges"]:
        assert edge["from_node"] in node_ids
        assert edge["to_node"] in node_ids
