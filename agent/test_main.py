"""
Test plan:
  story_id: agent-scaffold
  framework: pytest + FastAPI TestClient
  tests:
    - id: TC-001
      maps_to_ac: "AC-1: GET /health returns HTTP 200"
      type: acceptance
    - id: TC-002
      maps_to_ac: "AC-2: GET /health response body is { 'status': 'ok' }"
      type: acceptance
"""

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_health_returns_200():
    """TC-001 - GET /health returns HTTP 200."""
    response = client.get("/health")
    assert response.status_code == 200


def test_health_body_is_status_ok():
    """TC-002 - GET /health response body is {"status": "ok"}."""
    response = client.get("/health")
    assert response.json() == {"status": "ok"}
