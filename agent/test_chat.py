"""
Test plan:
  story_id: AGT-002
  framework: pytest + FastAPI TestClient
  tests:
    - id: TC-001
      maps_to_ac: "AC-1: POST /chat with valid body returns HTTP 200 with { 'reply': <any string> }"
      type: acceptance
    - id: TC-002
      maps_to_ac: "AC-2: POST /chat with missing 'messages' field returns HTTP 422"
      type: negative
    - id: TC-003
      maps_to_ac: "AC-3: POST /chat with missing 'jwt' field returns HTTP 422"
      type: negative
"""

from unittest.mock import MagicMock, patch

import httpx
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)

VALID_BODY = {
    "messages": [{"role": "user", "content": "hello"}],
}
VALID_HEADERS = {"Authorization": "Bearer any"}


def _ok_response() -> MagicMock:
    mock = MagicMock(spec=httpx.Response)
    mock.status_code = 200
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


def test_post_chat_valid_request_returns_200():
    """TC-001 - AC-1: valid body + Authorization header yields HTTP 200 with a 'reply' string."""
    with patch("main.httpx.get", return_value=_ok_response()), \
         patch("main._ollama_client.chat.completions.create",
               return_value=_groq_text_response()):
        response = client.post("/chat", json=VALID_BODY, headers=VALID_HEADERS)
    assert response.status_code == 200
    body = response.json()
    assert "reply" in body
    assert isinstance(body["reply"], str)


def test_post_chat_missing_messages_returns_422():
    """TC-002 - AC-2: omitting 'messages' yields HTTP 422."""
    response = client.post("/chat", json={}, headers=VALID_HEADERS)
    assert response.status_code == 422


def test_post_chat_missing_authorization_returns_422():
    """TC-003 - AC-3: omitting Authorization header yields HTTP 422."""
    response = client.post(
        "/chat",
        json={"messages": [{"role": "user", "content": "hello"}]},
    )
    assert response.status_code == 422
