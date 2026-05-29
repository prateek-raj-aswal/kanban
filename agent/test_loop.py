"""
Test plan:
  story_id: AGT-004
  framework: pytest + FastAPI TestClient + unittest.mock
  tests:
    - id: TC-001
      maps_to_ac: "AC-1: LLM returns text (no tool calls) → reply returned in ChatResponse"
      type: acceptance
    - id: TC-002
      maps_to_ac: "AC-2: Ollama API connection error → 502 LLM service unavailable"
      type: acceptance
    - id: TC-003
      maps_to_ac: "AC-2: Ollama API returns 5xx → 502 LLM service unavailable"
      type: acceptance
    - id: TC-005
      maps_to_ac: "Tool call loop: LLM emits tool_call → stub executed → final text returned"
      type: unit
"""

from unittest.mock import MagicMock, patch

import httpx
import openai
import pytest
from fastapi.testclient import TestClient

from main import app

VALID_BODY = {
    "messages": [{"role": "user", "content": "say hello"}],
}
AUTH_HEADERS = {"Authorization": "Bearer valid.token"}


def _ok_backend() -> MagicMock:
    mock = MagicMock(spec=httpx.Response)
    mock.status_code = 200
    mock.json.return_value = []
    mock.content = b"[]"
    return mock


def _llm_text_response(content: str) -> MagicMock:
    msg = MagicMock()
    msg.content = content
    msg.tool_calls = None
    choice = MagicMock()
    choice.message = msg
    choice.finish_reason = "stop"
    resp = MagicMock()
    resp.choices = [choice]
    return resp


def _llm_tool_response(tool_name: str, tool_call_id: str, args: str) -> MagicMock:
    tc = MagicMock()
    tc.id = tool_call_id
    tc.function.name = tool_name
    tc.function.arguments = args
    tc.type = "function"
    msg = MagicMock()
    msg.content = None
    msg.tool_calls = [tc]
    msg.model_dump.return_value = {
        "role": "assistant",
        "content": None,
        "tool_calls": [{"id": tool_call_id, "type": "function",
                        "function": {"name": tool_name, "arguments": args}}],
    }
    choice = MagicMock()
    choice.message = msg
    choice.finish_reason = "tool_calls"
    resp = MagicMock()
    resp.choices = [choice]
    return resp


def test_llm_text_response_returned():
    """TC-001: valid body + Groq returns text → ChatResponse.reply equals LLM content."""
    with patch("main.httpx.get", return_value=_ok_backend()), \
         patch("main._ollama_client.chat.completions.create",
               return_value=_llm_text_response("Hello there!")):
        response = TestClient(app).post("/chat", json=VALID_BODY, headers=AUTH_HEADERS)

    assert response.status_code == 200
    assert response.json()["reply"] == "Hello there!"


def test_groq_connection_error_returns_502():
    """TC-002: APIConnectionError from Groq → 502 LLM service unavailable."""
    with patch("main.httpx.get", return_value=_ok_backend()), \
         patch("main._ollama_client.chat.completions.create",
               side_effect=openai.APIConnectionError(request=MagicMock())):
        response = TestClient(app).post("/chat", json=VALID_BODY, headers=AUTH_HEADERS)

    assert response.status_code == 502
    assert response.json() == {"detail": "LLM service unavailable"}


def test_groq_5xx_returns_502():
    """TC-003: APIStatusError (5xx) from Groq → 502 LLM service unavailable."""
    with patch("main.httpx.get", return_value=_ok_backend()), \
         patch("main._ollama_client.chat.completions.create",
               side_effect=openai.APIStatusError(
                   "server error", response=MagicMock(status_code=503),
                   body=None)):
        response = TestClient(app).post("/chat", json=VALID_BODY, headers=AUTH_HEADERS)

    assert response.status_code == 502
    assert response.json() == {"detail": "LLM service unavailable"}



def test_tool_call_loop_executes_and_returns_final_text():
    """TC-005: LLM emits tool_call → loop executes stub → second call returns text."""
    tool_resp = _llm_tool_response("get_boards", "call-1", "{}")
    text_resp = _llm_text_response("You have 2 boards.")
    with patch("main.httpx.get", return_value=_ok_backend()), \
         patch("main._ollama_client.chat.completions.create",
               side_effect=[tool_resp, text_resp]) as mock_create:
        response = TestClient(app).post("/chat", json=VALID_BODY, headers=AUTH_HEADERS)

    assert response.status_code == 200
    assert response.json()["reply"] == "You have 2 boards."
    assert mock_create.call_count == 2


def test_tool_loop_cap_returns_500():
    """TC-006: LLM keeps emitting tool_calls beyond MAX_TOOL_ROUNDS → 500."""
    tool_resp = _llm_tool_response("get_boards", "call-1", "{}")
    with patch("main.httpx.get", return_value=_ok_backend()), \
         patch("main._ollama_client.chat.completions.create",
               return_value=tool_resp) as mock_create:
        response = TestClient(app).post("/chat", json=VALID_BODY, headers=AUTH_HEADERS)

    assert response.status_code == 500
    assert response.json() == {"detail": "Tool loop exceeded maximum iterations"}
    assert mock_create.call_count == 10
