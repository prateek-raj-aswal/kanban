"""
test_plan:
  story_id: AGT-013
  framework: pytest + unittest.mock
  tests:
    - id: TC-001  maps_to_ac: "all 9 tool names present in _TOOL_DEFINITIONS"
    - id: TC-002  maps_to_ac: "each definition has type/function/name/description/parameters"
    - id: TC-003  maps_to_ac: "dispatch get_boards calls tools.get_boards with jwt"
    - id: TC-004  maps_to_ac: "dispatch get_board calls tools.get_board with jwt+board_id"
    - id: TC-005  maps_to_ac: "dispatch create_board calls tools.create_board with jwt+name"
    - id: TC-006  maps_to_ac: "dispatch get_cards_in_column calls correct function"
    - id: TC-007  maps_to_ac: "dispatch search_cards calls correct function"
    - id: TC-008  maps_to_ac: "dispatch create_card calls correct function"
    - id: TC-009  maps_to_ac: "dispatch move_card calls correct function"
    - id: TC-010  maps_to_ac: "dispatch update_card calls correct function"
    - id: TC-011  maps_to_ac: "dispatch delete_card calls correct function"
    - id: TC-012  maps_to_ac: "unknown tool name returns JSON error"
    - id: TC-013  maps_to_ac: "tool loop sends actual tool result, not stub placeholder"
    - id: TC-014  maps_to_ac: "LLM receives _TOOL_DEFINITIONS (non-empty) in create call"
"""

import json
from unittest.mock import MagicMock, patch

import httpx
import openai
from fastapi.testclient import TestClient

from main import _TOOL_DEFINITIONS, _dispatch_tool, app

JWT = "test.jwt.token"
BOARD_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
COLUMN_ID = "b2c3d4e5-f6a7-8901-bcde-f12345678901"
CARD_ID = "aaaaaaaa-1111-2222-3333-444444444444"
TARGET_COLUMN_ID = "cccccccc-3333-4444-5555-666666666666"

_EXPECTED_TOOL_NAMES = {
    "get_boards", "get_board", "create_board",
    "get_cards_in_column", "search_cards",
    "create_card", "move_card", "update_card", "delete_card",
}


def _ok_backend() -> MagicMock:
    mock = MagicMock(spec=httpx.Response)
    mock.status_code = 200
    mock.json.return_value = {}
    mock.content = b"{}"
    return mock


# ── TC-001 ─────────────────────────────────────────────────────────────────

def test_all_9_tool_names_registered():
    """TC-001: all 9 expected tool names are present in _TOOL_DEFINITIONS."""
    names = {td["function"]["name"] for td in _TOOL_DEFINITIONS}
    assert names == _EXPECTED_TOOL_NAMES


# ── TC-002 ─────────────────────────────────────────────────────────────────

def test_each_definition_has_required_structure():
    """TC-002: every definition has type='function' plus name/description/parameters."""
    for td in _TOOL_DEFINITIONS:
        assert td["type"] == "function", f"missing type for {td}"
        fn = td["function"]
        assert "name" in fn
        assert "description" in fn
        assert "parameters" in fn
        assert fn["parameters"]["type"] == "object"


# ── TC-003 through TC-011: dispatch routing ────────────────────────────────

def test_dispatch_get_boards():
    """TC-003: get_boards dispatches to tools.get_boards with jwt."""
    with patch("tools.httpx.get", return_value=_ok_backend()) as mock_get:
        _dispatch_tool("get_boards", {}, JWT)
    mock_get.assert_called_once()
    _, kwargs = mock_get.call_args
    assert kwargs["headers"]["Authorization"] == f"Bearer {JWT}"


def test_dispatch_get_board():
    """TC-004: get_board dispatches to tools.get_board with jwt and board_id."""
    with patch("tools.httpx.get", return_value=_ok_backend()) as mock_get:
        _dispatch_tool("get_board", {"board_id": BOARD_ID}, JWT)
    call_url = mock_get.call_args.args[0]
    assert BOARD_ID in call_url


def test_dispatch_create_board():
    """TC-005: create_board dispatches to tools.create_board with jwt and name."""
    mock_resp = MagicMock(spec=httpx.Response)
    mock_resp.status_code = 201
    mock_resp.json.return_value = {"id": BOARD_ID, "name": "My Board"}
    with patch("tools.httpx.post", return_value=mock_resp) as mock_post:
        _dispatch_tool("create_board", {"name": "My Board"}, JWT)
    body = mock_post.call_args.kwargs["json"]
    assert body["name"] == "My Board"


def test_dispatch_get_cards_in_column():
    """TC-006: get_cards_in_column dispatches with jwt, board_id, column_id."""
    with patch("tools.httpx.get", return_value=_ok_backend()) as mock_get:
        _dispatch_tool("get_cards_in_column", {"board_id": BOARD_ID, "column_id": COLUMN_ID}, JWT)
    call_url = mock_get.call_args.args[0]
    assert BOARD_ID in call_url


def test_dispatch_search_cards():
    """TC-007: search_cards dispatches with jwt and board_id."""
    with patch("tools.httpx.get", return_value=_ok_backend()) as mock_get:
        _dispatch_tool("search_cards", {"board_id": BOARD_ID, "q": "login"}, JWT)
    call_url = mock_get.call_args.args[0]
    assert "search" in call_url


def test_dispatch_create_card():
    """TC-008: create_card dispatches with jwt, column_id, and title."""
    mock_resp = MagicMock(spec=httpx.Response)
    mock_resp.status_code = 201
    mock_resp.json.return_value = {"id": CARD_ID, "title": "Task"}
    mock_resp.content = b"{}"
    with patch("tools.httpx.post", return_value=mock_resp) as mock_post:
        _dispatch_tool("create_card", {"column_id": COLUMN_ID, "title": "Task"}, JWT)
    body = mock_post.call_args.kwargs["json"]
    assert body["title"] == "Task"


def test_dispatch_move_card():
    """TC-009: move_card dispatches with jwt, card_id, and target_column_id."""
    mock_resp = MagicMock(spec=httpx.Response)
    mock_resp.status_code = 200
    mock_resp.json.return_value = {"id": CARD_ID}
    mock_resp.content = b"{}"
    with patch("tools.httpx.patch", return_value=mock_resp) as mock_patch:
        _dispatch_tool("move_card", {"card_id": CARD_ID, "target_column_id": TARGET_COLUMN_ID}, JWT)
    body = mock_patch.call_args.kwargs["json"]
    assert body["targetColumnId"] == TARGET_COLUMN_ID


def test_dispatch_update_card():
    """TC-010: update_card dispatches with jwt, card_id, and provided fields."""
    mock_resp = MagicMock(spec=httpx.Response)
    mock_resp.status_code = 200
    mock_resp.json.return_value = {"id": CARD_ID}
    mock_resp.content = b"{}"
    with patch("tools.httpx.patch", return_value=mock_resp) as mock_patch:
        _dispatch_tool("update_card", {"card_id": CARD_ID, "title": "New"}, JWT)
    body = mock_patch.call_args.kwargs["json"]
    assert body["title"] == "New"


def test_dispatch_delete_card():
    """TC-011: delete_card dispatches with jwt and card_id."""
    mock_resp = MagicMock(spec=httpx.Response)
    mock_resp.status_code = 204
    with patch("tools.httpx.delete", return_value=mock_resp) as mock_del:
        result = _dispatch_tool("delete_card", {"card_id": CARD_ID}, JWT)
    mock_del.assert_called_once()
    assert json.loads(result)["deleted"] is True


def test_dispatch_unknown_tool_returns_error():
    """TC-012: unknown tool name returns JSON error without raising."""
    result = _dispatch_tool("nonexistent_tool", {}, JWT)
    parsed = json.loads(result)
    assert "error" in parsed


# ── TC-013: tool result replaces placeholder ───────────────────────────────

def test_tool_loop_uses_actual_tool_result():
    """TC-013: tool result from dispatch reaches LLM, not 'Tool not yet implemented'."""
    def _make_tool_resp():
        tc = MagicMock()
        tc.id = "call-x"
        tc.function.name = "get_boards"
        tc.function.arguments = "{}"
        msg = MagicMock()
        msg.content = None
        msg.tool_calls = [tc]
        choice = MagicMock()
        choice.message = msg
        resp = MagicMock()
        resp.choices = [choice]
        return resp

    def _make_text_resp():
        msg = MagicMock()
        msg.content = "Done."
        msg.tool_calls = None
        choice = MagicMock()
        choice.message = msg
        resp = MagicMock()
        resp.choices = [choice]
        return resp

    captured_messages = []

    def _capture_create(**kwargs):
        calls = kwargs.get("messages", [])
        if any(m.get("role") == "tool" for m in calls):
            captured_messages.extend(calls)
            return _make_text_resp()
        return _make_tool_resp()

    tools_get_mock = MagicMock(spec=httpx.Response)
    tools_get_mock.status_code = 200
    tools_get_mock.json.return_value = []

    with patch("main.httpx.get", return_value=_ok_backend()), \
         patch("tools.httpx.get", return_value=tools_get_mock), \
         patch("main._ollama_client.chat.completions.create", side_effect=_capture_create):
        response = TestClient(app).post(
            "/chat", json={"messages": [{"role": "user", "content": "hi"}]},
            headers={"Authorization": f"Bearer {JWT}"}
        )

    assert response.status_code == 200
    tool_messages = [m for m in captured_messages if m.get("role") == "tool"]
    assert len(tool_messages) == 1
    assert tool_messages[0]["content"] != "Tool not yet implemented"


# ── TC-014: LLM receives non-empty tools list ──────────────────────────────

def test_malformed_tool_arguments_returns_error_not_500():
    """TC-015: malformed JSON in tool arguments → tool error message, loop continues, no crash."""
    def _make_tool_resp_bad_args():
        tc = MagicMock()
        tc.id = "call-bad"
        tc.function.name = "get_boards"
        tc.function.arguments = "NOT VALID JSON {{{"
        msg = MagicMock()
        msg.content = None
        msg.tool_calls = [tc]
        choice = MagicMock()
        choice.message = msg
        resp = MagicMock()
        resp.choices = [choice]
        return resp

    def _make_text_resp():
        msg = MagicMock()
        msg.content = "Sorry, there was an error."
        msg.tool_calls = None
        choice = MagicMock()
        choice.message = msg
        resp = MagicMock()
        resp.choices = [choice]
        return resp

    captured = []

    def _capture(**kwargs):
        msgs = kwargs.get("messages", [])
        if any(m.get("role") == "tool" for m in msgs):
            captured.extend(msgs)
            return _make_text_resp()
        return _make_tool_resp_bad_args()

    with patch("main.httpx.get", return_value=_ok_backend()), \
         patch("main._ollama_client.chat.completions.create", side_effect=_capture):
        response = TestClient(app).post(
            "/chat", json={"messages": [{"role": "user", "content": "hi"}]},
            headers={"Authorization": f"Bearer {JWT}"}
        )

    assert response.status_code == 200
    tool_msgs = [m for m in captured if m.get("role") == "tool"]
    assert len(tool_msgs) == 1
    assert "error" in json.loads(tool_msgs[0]["content"])


def test_llm_receives_non_empty_tools_list():
    """TC-014: _ollama_client.chat.completions.create is called with non-empty tools."""
    msg = MagicMock()
    msg.content = "Hi"
    msg.tool_calls = None
    choice = MagicMock()
    choice.message = msg
    resp = MagicMock()
    resp.choices = [choice]

    with patch("main.httpx.get", return_value=_ok_backend()), \
         patch("main._ollama_client.chat.completions.create", return_value=resp) as mock_create:
        TestClient(app).post(
            "/chat", json={"messages": [{"role": "user", "content": "hi"}]},
            headers={"Authorization": f"Bearer {JWT}"}
        )

    call_kwargs = mock_create.call_args.kwargs
    assert "tools" in call_kwargs
    assert len(call_kwargs["tools"]) == 9
