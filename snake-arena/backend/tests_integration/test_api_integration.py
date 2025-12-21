import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.append(str(ROOT_DIR))


@pytest.fixture()
def client(tmp_path, monkeypatch):
    db_path = tmp_path / "integration.db"
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_path}")
    if "main" in sys.modules:
        del sys.modules["main"]
    import main

    with TestClient(main.app) as test_client:
        yield test_client


def test_signup_me_and_logout_flow(client):
    signup_response = client.post(
        "/api/auth/signup",
        json={"email": "flow@test.com", "username": "Flow", "password": "pass"},
    )
    assert signup_response.status_code == 200
    signup_body = signup_response.json()
    assert signup_body["success"] is True

    me_response = client.get("/api/auth/me")
    assert me_response.status_code == 200
    me_body = me_response.json()
    assert me_body["success"] is True
    assert me_body["data"]["email"] == "flow@test.com"

    logout_response = client.post("/api/auth/logout")
    assert logout_response.status_code == 200
    logout_body = logout_response.json()
    assert logout_body["success"] is True

    after_logout = client.get("/api/auth/me")
    assert after_logout.status_code == 200
    after_logout_body = after_logout.json()
    assert after_logout_body["success"] is True
    assert after_logout_body["data"] is None


def test_submit_score_persists_in_leaderboard(client):
    login_response = client.post(
        "/api/auth/login",
        json={"email": "player1@test.com", "password": "password123"},
    )
    assert login_response.status_code == 200

    score_value = 999
    submit_response = client.post("/api/scores", json={"score": score_value, "mode": "walls"})
    assert submit_response.status_code == 200
    submit_body = submit_response.json()
    assert submit_body["success"] is True

    leaderboard_response = client.get("/api/leaderboard", params={"mode": "walls"})
    assert leaderboard_response.status_code == 200
    leaderboard_body = leaderboard_response.json()
    assert leaderboard_body["success"] is True
    assert any(entry["score"] == score_value for entry in leaderboard_body["data"])


def test_live_player_lookup_round_trip(client):
    list_response = client.get("/api/live-players")
    assert list_response.status_code == 200
    list_body = list_response.json()
    assert list_body["success"] is True
    assert list_body["data"]

    player_id = list_body["data"][0]["id"]
    player_username = list_body["data"][0]["username"]

    detail_response = client.get(f"/api/live-players/{player_id}")
    assert detail_response.status_code == 200
    detail_body = detail_response.json()
    assert detail_body["success"] is True
    assert detail_body["data"]["username"] == player_username
