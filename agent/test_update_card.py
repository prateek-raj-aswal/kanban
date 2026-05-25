"""
test_plan:
  story_id: AGT-011
  framework: pytest + unittest.mock
  tests:
    - id: TC-001  maps_to_ac: "200 response returned as JSON string"
    - id: TC-002  maps_to_ac: "passes Authorization header"
    - id: TC-003  maps_to_ac: "sends only provided fields in request body (PATCH semantics)"
    - id: TC-004  maps_to_ac: "sends multiple provided fields when given"
    - id: TC-005  maps_to_ac: "omits None fields from request body"
    - id: TC-006  maps_to_ac: "non-200 response returns JSON error with status code"
    - id: TC-007  edge: "transport error returns {error: Backend unreachable}"
    - id: TC-008  edge: "non-UUID card_id rejected, httpx not called"
    - id: TC-009  edge: "invalid priority rejected, httpx not called"
    - id: TC-010  edge: "CRLF in jwt rejected, httpx not called"
    - id: TC-011  edge: "blank title rejected, httpx not called"
    - id: TC-012  edge: "title > 255 chars rejected, httpx not called"
    - id: TC-013  edge: "description > 10000 chars rejected, httpx not called"
    - id: TC-014  edge: "no fields provided sends empty body, request still made"
"""

import json
from unittest.mock import MagicMock, patch

import httpx

from tools import update_card

JWT = "test.jwt.token"
CARD_ID = "aaaaaaaa-1111-2222-3333-444444444444"

CARD_RESPONSE = {
    "id": CARD_ID,
    "columnId": "bbbbbbbb-5555-6666-7777-888888888888",
    "title": "Updated Title",
    "description": "Updated desc",
    "position": 1.0,
    "priority": "HIGH",
    "dueDate": "2025-12-31",
}


def _mock_response(status_code: int, json_data=None) -> MagicMock:
    mock = MagicMock(spec=httpx.Response)
    mock.status_code = status_code
    mock.json.return_value = {} if json_data is None else json_data
    mock.content = b"{}"
    return mock


def test_update_card_returns_json_on_200():
    """TC-001: 200 response is returned as JSON string."""
    with patch("tools.httpx.patch", return_value=_mock_response(200, CARD_RESPONSE)):
        result = update_card(JWT, CARD_ID, title="Updated Title")

    parsed = json.loads(result)
    assert parsed["id"] == CARD_ID
    assert parsed["title"] == "Updated Title"


def test_update_card_passes_auth_header():
    """TC-002: Authorization: Bearer <jwt> is set on the request."""
    with patch("tools.httpx.patch", return_value=_mock_response(200, CARD_RESPONSE)) as mock_patch:
        update_card(JWT, CARD_ID, title="Task")

    headers = mock_patch.call_args.kwargs["headers"]
    assert headers["Authorization"] == f"Bearer {JWT}"


def test_update_card_sends_only_provided_fields():
    """TC-003: only the provided field appears in the request body."""
    with patch("tools.httpx.patch", return_value=_mock_response(200, CARD_RESPONSE)) as mock_patch:
        update_card(JWT, CARD_ID, title="New Title")

    body = mock_patch.call_args.kwargs["json"]
    assert body["title"] == "New Title"
    assert "description" not in body
    assert "dueDate" not in body
    assert "priority" not in body


def test_update_card_sends_multiple_fields():
    """TC-004: all provided fields are present in the request body."""
    with patch("tools.httpx.patch", return_value=_mock_response(200, CARD_RESPONSE)) as mock_patch:
        update_card(JWT, CARD_ID, title="Task", description="desc", due_date="2025-12-31", priority="HIGH")

    body = mock_patch.call_args.kwargs["json"]
    assert body["title"] == "Task"
    assert body["description"] == "desc"
    assert body["dueDate"] == "2025-12-31"
    assert body["priority"] == "HIGH"


def test_update_card_omits_none_fields():
    """TC-005: None fields are absent from the request body (PATCH semantics)."""
    with patch("tools.httpx.patch", return_value=_mock_response(200, CARD_RESPONSE)) as mock_patch:
        update_card(JWT, CARD_ID, priority="LOW")

    body = mock_patch.call_args.kwargs["json"]
    assert "title" not in body
    assert "description" not in body
    assert "dueDate" not in body
    assert body["priority"] == "LOW"


def test_update_card_non_200_returns_error():
    """TC-006: non-200 backend response returns JSON error containing status code."""
    with patch("tools.httpx.patch", return_value=_mock_response(404)):
        result = update_card(JWT, CARD_ID, title="Task")

    parsed = json.loads(result)
    assert "error" in parsed
    assert "404" in parsed["error"]


def test_update_card_transport_error():
    """TC-007: transport error returns JSON error, does not raise."""
    with patch("tools.httpx.patch", side_effect=httpx.TransportError("refused")):
        result = update_card(JWT, CARD_ID, title="Task")

    parsed = json.loads(result)
    assert parsed["error"] == "Backend unreachable"


def test_update_card_invalid_card_id():
    """TC-008: non-UUID card_id rejected before HTTP call."""
    with patch("tools.httpx.patch") as mock_patch:
        result = update_card(JWT, "not-a-uuid", title="Task")

    mock_patch.assert_not_called()
    parsed = json.loads(result)
    assert "error" in parsed


def test_update_card_invalid_priority():
    """TC-009: priority not in allowed set rejected before HTTP call."""
    with patch("tools.httpx.patch") as mock_patch:
        result = update_card(JWT, CARD_ID, priority="CRITICAL")

    mock_patch.assert_not_called()
    parsed = json.loads(result)
    assert "error" in parsed


def test_update_card_crlf_jwt():
    """TC-010: CRLF in jwt rejected before HTTP call."""
    with patch("tools.httpx.patch") as mock_patch:
        result = update_card("token\r\nX-Evil: x", CARD_ID, title="Task")

    mock_patch.assert_not_called()
    parsed = json.loads(result)
    assert parsed["error"] == "JWT contains illegal characters"


def test_update_card_blank_title():
    """TC-011: blank/whitespace title rejected before HTTP call."""
    with patch("tools.httpx.patch") as mock_patch:
        result = update_card(JWT, CARD_ID, title="   ")

    mock_patch.assert_not_called()
    parsed = json.loads(result)
    assert parsed["error"] == "Card title cannot be blank"


def test_update_card_title_too_long():
    """TC-012: title > 255 chars rejected before HTTP call."""
    with patch("tools.httpx.patch") as mock_patch:
        result = update_card(JWT, CARD_ID, title="x" * 256)

    mock_patch.assert_not_called()
    parsed = json.loads(result)
    assert "error" in parsed


def test_update_card_description_too_long():
    """TC-013: description > 10000 chars rejected before HTTP call."""
    with patch("tools.httpx.patch") as mock_patch:
        result = update_card(JWT, CARD_ID, description="x" * 10_001)

    mock_patch.assert_not_called()
    parsed = json.loads(result)
    assert "error" in parsed


def test_update_card_no_fields_sends_empty_body():
    """TC-014: no fields provided sends an empty body; request is still made."""
    with patch("tools.httpx.patch", return_value=_mock_response(200, CARD_RESPONSE)) as mock_patch:
        update_card(JWT, CARD_ID)

    mock_patch.assert_called_once()
    body = mock_patch.call_args.kwargs["json"]
    assert body == {}
