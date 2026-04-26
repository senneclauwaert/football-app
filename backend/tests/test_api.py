"""
Basic smoke tests — verify key endpoints return the right status codes
and response shapes without requiring seeded data.
"""


def test_list_teams_empty(client):
    r = client.get("/api/teams")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_list_competitions_empty(client):
    r = client.get("/api/standings/competitions")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_list_matches_empty(client):
    r = client.get("/api/matches")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_list_standings_empty(client):
    r = client.get("/api/standings")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_login_invalid_credentials(client):
    r = client.post("/api/auth/login", json={"email": "fake@fake.com", "password": "wrong"})
    assert r.status_code == 401


def test_login_missing_fields(client):
    r = client.post("/api/auth/login", json={})
    assert r.status_code == 422


def test_admin_route_requires_auth(client):
    r = client.get("/api/admin/scraper/runs")
    assert r.status_code == 401


def test_team_competitions_not_found(client):
    r = client.get("/api/teams/99999/competitions")
    # Returns empty list for unknown team, not 404
    assert r.status_code == 200
    assert r.json() == []
