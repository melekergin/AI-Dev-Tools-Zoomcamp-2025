import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.append(str(ROOT_DIR))


@pytest.fixture()
def client(tmp_path, monkeypatch):
    db_path = tmp_path / "test.db"
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_path}")
    if "main" in sys.modules:
        del sys.modules["main"]
    import main

    with TestClient(main.app) as test_client:
        yield test_client


def test_login_success_sets_cookie(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "player1@test.com", "password": "password123"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["user"]["username"] == "SnakeMaster"
    assert "session" in response.cookies


def test_login_failure(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "player1@test.com", "password": "wrong"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is False
    assert body["error"] == "Invalid email or password"


def test_signup_then_me(client):
    response = client.post(
        "/api/auth/signup",
        json={"email": "new@test.com", "username": "NewPlayer", "password": "pass"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    session = response.cookies.get("session")
    assert session

    client.cookies.set("session", session)
    me_response = client.get("/api/auth/me")
    assert me_response.status_code == 200
    me_body = me_response.json()
    assert me_body["success"] is True
    assert me_body["data"]["email"] == "new@test.com"


def test_leaderboard_filter(client):
    response = client.get("/api/leaderboard", params={"mode": "walls"})
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]
    assert all(entry["mode"] == "walls" for entry in body["data"])


def test_submit_score_requires_auth(client):
    response = client.post("/api/scores", json={"score": 100, "mode": "walls"})
    assert response.status_code == 401
    body = response.json()
    assert body["success"] is False
    assert body["error"] == "Must be logged in to submit score"


def test_submit_score_success(client):
    login_response = client.post(
        "/api/auth/login",
        json={"email": "player1@test.com", "password": "password123"},
    )
    session = login_response.cookies.get("session")
    assert session

    client.cookies.set("session", session)
    response = client.post(
        "/api/scores",
        json={"score": 1337, "mode": "walls"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["username"] == "SnakeMaster"
    assert body["data"]["score"] == 1337


def test_live_players(client):
    response = client.get("/api/live-players")
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert len(body["data"]) >= 1


def test_live_player_not_found(client):
    response = client.get("/api/live-players/missing")
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"] is None
