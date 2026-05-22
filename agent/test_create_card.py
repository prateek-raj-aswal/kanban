"""
test_plan:
  story_id: AGT-009
  framework: pytest + unittest.mock
  tests:
    - id: TC-001  maps_to_ac: "201 response returned as JSON string"
    - id: TC-002  maps_to_ac: "passes Authorization header"
    - id: TC-003  maps_to_ac: "sends title in request body"
    - id: TC-004  maps_to_ac: "optional fields (description, dueDate, priority) sent when provided"
    - id: TC-005  maps_to_ac: "optional fields None → null/absent in body"
    - id: TC-006  maps_to_ac: "non-201 response returns JSON error with status code"
    - id: TC-007  edge: "transport error returns {error: Backend unreachable}"
    - id: TC-008  edge: "blank/whitespace title rejected, httpx not called"
    - id: TC-009  edge: "title > 255 chars rejected, httpx not called"
    - id: TC-010  edge: "non-UUID column_id rejected, httpx not called"
    - id: TC-011  edge: "invalid priority rejected, httpx not called"
    - id: TC-012  edge: "CRLF in jwt rejected, httpx not called"
"""

import json
from unittest.mock import MagicMock, patch

import httpx

from tools import create_card

JWT = "test.jwt.token"
COLUMN_ID = "c1d2e3f4-a5b6-7890-cdef-123456789012"

CARD_RESPONSE = {
    "id": "card1111-1111-1111-1111-111111111111",
    "columnId": COLUMN_ID,
    "title": "Fix login bug",
    "description": None,
    "position": 1.0,
    "priority": None,
    "dueDate": None,
}


def _mock_response(status_code: int, json_data=None) -> MagicMock:
    mock = MagicMock(spec=httpx.Response)
    mock.status_code = status_code
    mock.json.return_value = {} if json_data is None else json_data
    return mock


def test_create_card_returns_json_on_201():
    """TC-001: 201 response is returned as JSON string."""
    with patch("tools.httpx.post", return_value=_mock_response(201, CARD_RESPONSE)):
        result = create_card(JWT, COLUMN_ID, "Fix login bug")

    parsed = json.loads(result)
    assert parsed["id"] == CARD_RESPONSE["id"]
    assert parsed["title"] == "Fix login bug"


def test_create_card_passes_auth_header():
    """TC-002: Authorization: Bearer <jwt> is set on the request."""
    with patch("tools.httpx.post", return_value=_mock_response(201, CARD_RESPONSE)) as mock_post:
        create_card(JWT, COLUMN_ID, "Task")

    headers = mock_post.call_args.kwargs["headers"]
    assert headers["Authorization"] == f"Bearer {JWT}"


def test_create_card_sends_title_in_body():
    """TC-003: title appears in the JSON request body."""
    with patch("tools.httpx.post", return_value=_mock_response(201, CARD_RESPONSE)) as mock_post:
        create_card(JWT, COLUMN_ID, "My Task")

    body = mock_post.call_args.kwargs["json"]
    assert body["title"] == "My Task"


def test_create_card_sends_optional_fields_when_provided():
    """TC-004: description, dueDate, priority forwarded when provided."""
    with patch("tools.httpx.post", return_value=_mock_response(201, CARD_RESPONSE)) as mock_post:
        create_card(JWT, COLUMN_ID, "Task", description="desc", due_date="2025-12-31", priority="HIGH")

    body = mock_post.call_args.kwargs["json"]
    assert body["description"] == "desc"
    assert body["dueDate"] == "2025-12-31"
    assert body["priority"] == "HIGH"


def test_create_card_optional_fields_none():
    """TC-005: None optional fields are sent as null in the body (backend ignores nulls)."""
    with patch("tools.httpx.post", return_value=_mock_response(201, CARD_RESPONSE)) as mock_post:
        create_card(JWT, COLUMN_ID, "Task")

    body = mock_post.call_args.kwargs["json"]
    assert body["description"] is None
    assert body["dueDate"] is None
    assert body["priority"] is None


def test_create_card_non_201_returns_error():
    """TC-006: non-201 backend response returns JSON error containing status code."""
    with patch("tools.httpx.post", return_value=_mock_response(400)):
        result = create_card(JWT, COLUMN_ID, "Task")

    parsed = json.loads(result)
    assert "error" in parsed
    assert "400" in parsed["error"]


def test_create_card_transport_error():
    """TC-007: transport error returns JSON error, does not raise."""
    with patch("tools.httpx.post", side_effect=httpx.TransportError("refused")):
        result = create_card(JWT, COLUMN_ID, "Task")

    parsed = json.loads(result)
    assert parsed["error"] == "Backend unreachable"


def test_create_card_blank_title():
    """TC-008: blank/whitespace title rejected before HTTP call."""
    with patch("tools.httpx.post") as mock_post:
        result = create_card(JWT, COLUMN_ID, "   ")

    mock_post.assert_not_called()
    parsed = json.loads(result)
    assert parsed["error"] == "Card title cannot be blank"


def test_create_card_title_too_long():
    """TC-009: title > 255 chars rejected before HTTP call."""
    with patch("tools.httpx.post") as mock_post:
        result = create_card(JWT, COLUMN_ID, "x" * 256)

    mock_post.assert_not_called()
    parsed = json.loads(result)
    assert "error" in parsed


def test_create_card_invalid_column_id():
    """TC-010: non-UUID column_id rejected before HTTP call."""
    with patch("tools.httpx.post") as mock_post:
        result = create_card(JWT, "not-a-uuid", "Task")

    mock_post.assert_not_called()
    parsed = json.loads(result)
    assert "error" in parsed


def test_create_card_invalid_priority():
    """TC-011: priority not in allowed set rejected before HTTP call."""
    with patch("tools.httpx.post") as mock_post:
        result = create_card(JWT, COLUMN_ID, "Task", priority="URGENT")

    mock_post.assert_not_called()
    parsed = json.loads(result)
    assert "error" in parsed


def test_create_card_crlf_jwt():
    """TC-012: CRLF in jwt rejected before HTTP call."""
    with patch("tools.httpx.post") as mock_post:
        result = create_card("token\r\nX-Evil: x", COLUMN_ID, "Task")

    mock_post.assert_not_called()
    parsed = json.loads(result)
    assert parsed["error"] == "JWT contains illegal characters"
