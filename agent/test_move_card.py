"""
test_plan:
  story_id: AGT-010
  framework: pytest + unittest.mock
  tests:
    - id: TC-001  maps_to_ac: "200 response returned as JSON string"
    - id: TC-002  maps_to_ac: "passes Authorization header"
    - id: TC-003  maps_to_ac: "sends targetColumnId and position in request body"
    - id: TC-004  maps_to_ac: "position=None sends null in body"
    - id: TC-005  maps_to_ac: "non-200 response returns JSON error with status code"
    - id: TC-006  edge: "transport error returns {error: Backend unreachable}"
    - id: TC-007  edge: "non-UUID card_id rejected, httpx not called"
    - id: TC-008  edge: "non-UUID target_column_id rejected, httpx not called"
    - id: TC-009  edge: "CRLF in jwt rejected, httpx not called"
"""

import json
from unittest.mock import MagicMock, patch

import httpx

from tools import move_card

JWT = "test.jwt.token"
CARD_ID = "aaaaaaaa-1111-2222-3333-444444444444"
TARGET_COLUMN_ID = "bbbbbbbb-5555-6666-7777-888888888888"

CARD_RESPONSE = {
    "id": CARD_ID,
    "columnId": TARGET_COLUMN_ID,
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
    mock.content = b"{}"
    return mock


def test_move_card_returns_json_on_200():
    """TC-001: 200 response is returned as JSON string."""
    with patch("tools.httpx.patch", return_value=_mock_response(200, CARD_RESPONSE)):
        result = move_card(JWT, CARD_ID, TARGET_COLUMN_ID, position=1.0)

    parsed = json.loads(result)
    assert parsed["id"] == CARD_ID
    assert parsed["columnId"] == TARGET_COLUMN_ID


def test_move_card_passes_auth_header():
    """TC-002: Authorization: Bearer <jwt> is set on the request."""
    with patch("tools.httpx.patch", return_value=_mock_response(200, CARD_RESPONSE)) as mock_patch:
        move_card(JWT, CARD_ID, TARGET_COLUMN_ID, position=1.0)

    headers = mock_patch.call_args.kwargs["headers"]
    assert headers["Authorization"] == f"Bearer {JWT}"


def test_move_card_sends_target_column_and_position():
    """TC-003: targetColumnId and position are sent in the JSON body."""
    with patch("tools.httpx.patch", return_value=_mock_response(200, CARD_RESPONSE)) as mock_patch:
        move_card(JWT, CARD_ID, TARGET_COLUMN_ID, position=2.5)

    body = mock_patch.call_args.kwargs["json"]
    assert body["targetColumnId"] == TARGET_COLUMN_ID
    assert body["position"] == 2.5


def test_move_card_position_none_sends_null():
    """TC-004: position=None is sent as null in the body."""
    with patch("tools.httpx.patch", return_value=_mock_response(200, CARD_RESPONSE)) as mock_patch:
        move_card(JWT, CARD_ID, TARGET_COLUMN_ID)

    body = mock_patch.call_args.kwargs["json"]
    assert body["position"] is None


def test_move_card_non_200_returns_error():
    """TC-005: non-200 backend response returns JSON error containing status code."""
    with patch("tools.httpx.patch", return_value=_mock_response(404)):
        result = move_card(JWT, CARD_ID, TARGET_COLUMN_ID, position=1.0)

    parsed = json.loads(result)
    assert "error" in parsed
    assert "404" in parsed["error"]


def test_move_card_transport_error():
    """TC-006: transport error returns JSON error, does not raise."""
    with patch("tools.httpx.patch", side_effect=httpx.TransportError("refused")):
        result = move_card(JWT, CARD_ID, TARGET_COLUMN_ID, position=1.0)

    parsed = json.loads(result)
    assert parsed["error"] == "Backend unreachable"


def test_move_card_invalid_card_id():
    """TC-007: non-UUID card_id rejected before HTTP call."""
    with patch("tools.httpx.patch") as mock_patch:
        result = move_card(JWT, "not-a-uuid", TARGET_COLUMN_ID, position=1.0)

    mock_patch.assert_not_called()
    parsed = json.loads(result)
    assert "error" in parsed


def test_move_card_invalid_target_column_id():
    """TC-008: non-UUID target_column_id rejected before HTTP call."""
    with patch("tools.httpx.patch") as mock_patch:
        result = move_card(JWT, CARD_ID, "not-a-uuid", position=1.0)

    mock_patch.assert_not_called()
    parsed = json.loads(result)
    assert "error" in parsed


def test_move_card_crlf_jwt():
    """TC-009: CRLF in jwt rejected before HTTP call."""
    with patch("tools.httpx.patch") as mock_patch:
        result = move_card("token\r\nX-Evil: x", CARD_ID, TARGET_COLUMN_ID, position=1.0)

    mock_patch.assert_not_called()
    parsed = json.loads(result)
    assert parsed["error"] == "JWT contains illegal characters"
