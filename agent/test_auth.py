"""
Test plan:
  story_id: AGT-003
  framework: pytest + FastAPI TestClient + unittest.mock
  tests:
    - id: TC-001
      maps_to_ac: "AC-1: valid JWT → backend called with Authorization header → 200 from /chat"
      type: acceptance
    - id: TC-002
      maps_to_ac: "AC-2: invalid/expired JWT → backend returns 401 → /chat returns 401"
      type: acceptance
    - id: TC-003
      maps_to_ac: "AC-3: backend unreachable → /chat returns 502"
      type: edge-case
"""

from unittest.mock import MagicMock, patch

import httpx
import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)

MESSAGES_BODY = {"messages": [{"role": "user", "content": "hello"}]}
VALID_HEADERS = {"Authorization": "Bearer valid.jwt.token"}
INVALID_HEADERS = {"Authorization": "Bearer expired.jwt.token"}


def _mock_response(status_code: int) -> MagicMock:
    mock = MagicMock(spec=httpx.Response)
    mock.status_code = status_code
    return mock


def _groq_text_response(content: str = "OK") -> MagicMock:
    msg = MagicMock()
    msg.content = content
    msg.tool_calls = None
    choice = MagicMock()
    choice.message = msg
    resp = MagicMock()
    resp.choices = [choice]
    return resp


def test_valid_jwt_proceeds_to_handler():
    """TC-001: valid JWT in Authorization header → backend returns 200 → /chat returns 200."""
    with patch("main.httpx.get", return_value=_mock_response(200)) as mock_get, \
         patch("main._groq_client.chat.completions.create",
               return_value=_groq_text_response()):
        response = client.post("/chat", json=MESSAGES_BODY, headers=VALID_HEADERS)

    assert response.status_code == 200
    assert "reply" in response.json()

    call_args = mock_get.call_args
    assert "/api/v1/boards" in call_args[0][0]
    assert call_args[1]["headers"]["Authorization"] == "Bearer valid.jwt.token"


def test_invalid_jwt_returns_401():
    """TC-002: backend returns 401 → /chat returns 401 with detail Unauthorized."""
    with patch("main.httpx.get", return_value=_mock_response(401)):
        response = client.post("/chat", json=MESSAGES_BODY, headers=INVALID_HEADERS)

    assert response.status_code == 401
    assert response.json() == {"detail": "Unauthorized"}


def test_backend_unreachable_returns_502():
    """TC-003: httpx raises ConnectError → /chat returns 502."""
    with patch("main.httpx.get", side_effect=httpx.ConnectError("unreachable")):
        response = client.post("/chat", json=MESSAGES_BODY, headers=VALID_HEADERS)

    assert response.status_code == 502
    assert response.json() == {"detail": "Backend unreachable"}


def test_backend_timeout_returns_502():
    """TC-004: httpx raises TimeoutException → /chat returns 502."""
    with patch("main.httpx.get", side_effect=httpx.TimeoutException("timeout")):
        response = client.post("/chat", json=MESSAGES_BODY, headers=VALID_HEADERS)

    assert response.status_code == 502
    assert response.json() == {"detail": "Backend unreachable"}


def test_backend_500_returns_502():
    """TC-005: backend returns 500 → /chat returns 502 (not silent pass-through)."""
    with patch("main.httpx.get", return_value=_mock_response(500)):
        response = client.post("/chat", json=MESSAGES_BODY, headers=VALID_HEADERS)

    assert response.status_code == 502
    assert response.json() == {"detail": "Backend unreachable"}


def test_backend_403_returns_502():
    """TC-006: backend returns 403 → /chat returns 502 (not silent pass-through)."""
    with patch("main.httpx.get", return_value=_mock_response(403)):
        response = client.post("/chat", json=MESSAGES_BODY, headers=VALID_HEADERS)

    assert response.status_code == 502
