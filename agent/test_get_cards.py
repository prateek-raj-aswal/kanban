"""
test_plan:
  story_id: AGT-007
  framework: pytest + unittest.mock
  tests:
    - id: TC-001  maps_to_ac: "returns JSON list of cards for matching column"
    - id: TC-002  maps_to_ac: "returns empty list when column has no cards"
    - id: TC-003  maps_to_ac: "returns JSON error when column not found in board"
    - id: TC-004  maps_to_ac: "returns JSON error on board 404"
    - id: TC-005  edge: "passes Authorization header"
    - id: TC-006  edge: "non-UUID board_id rejected, httpx not called"
    - id: TC-007  edge: "non-UUID column_id rejected, httpx not called"
    - id: TC-008  edge: "CRLF in jwt rejected, httpx not called"
    - id: TC-009  edge: "transport error returns JSON error"
"""

import json
from unittest.mock import MagicMock, patch

import httpx

from tools import get_cards_in_column

JWT = "test.jwt.token"
BOARD_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
COLUMN_ID = "b2c3d4e5-f6a7-8901-bcde-f12345678901"
OTHER_COLUMN_ID = "c3d4e5f6-a7b8-9012-cdef-123456789012"

CARDS = [
    {"id": "card1111-1111-1111-1111-111111111111", "title": "Task A", "columnId": COLUMN_ID},
    {"id": "card2222-2222-2222-2222-222222222222", "title": "Task B", "columnId": COLUMN_ID},
]

BOARD_PAYLOAD = {
    "id": BOARD_ID,
    "name": "Sprint",
    "columns": [
        {"id": COLUMN_ID, "name": "To Do", "cards": CARDS},
        {"id": OTHER_COLUMN_ID, "name": "Done", "cards": []},
    ],
}

BOARD_PAYLOAD_EMPTY_COLUMN = {
    "id": BOARD_ID,
    "name": "Sprint",
    "columns": [
        {"id": COLUMN_ID, "name": "To Do", "cards": []},
    ],
}


def _mock_response(status_code: int, json_data=None) -> MagicMock:
    mock = MagicMock(spec=httpx.Response)
    mock.status_code = status_code
    mock.json.return_value = {} if json_data is None else json_data
    return mock


def test_get_cards_in_column_returns_cards():
    """TC-001: returns JSON list of cards for the matching column."""
    with patch("tools.httpx.get", return_value=_mock_response(200, BOARD_PAYLOAD)):
        result = get_cards_in_column(JWT, BOARD_ID, COLUMN_ID)

    parsed = json.loads(result)
    assert isinstance(parsed, list)
    assert len(parsed) == 2
    assert parsed[0]["title"] == "Task A"


def test_get_cards_in_column_empty_column():
    """TC-002: returns empty list when the column has no cards."""
    with patch("tools.httpx.get", return_value=_mock_response(200, BOARD_PAYLOAD_EMPTY_COLUMN)):
        result = get_cards_in_column(JWT, BOARD_ID, COLUMN_ID)

    parsed = json.loads(result)
    assert parsed == []


ABSENT_COLUMN_ID = "ff000000-0000-0000-0000-000000000000"


def test_get_cards_in_column_column_not_found():
    """TC-003: returns Column not found error when column_id is absent from the board."""
    with patch("tools.httpx.get", return_value=_mock_response(200, BOARD_PAYLOAD)):
        result = get_cards_in_column(JWT, BOARD_ID, ABSENT_COLUMN_ID)

    parsed = json.loads(result)
    assert parsed["error"] == "Column not found"


def test_get_cards_in_column_board_404():
    """TC-004: board 404 returns Board not found error."""
    with patch("tools.httpx.get", return_value=_mock_response(404)):
        result = get_cards_in_column(JWT, BOARD_ID, COLUMN_ID)

    parsed = json.loads(result)
    assert parsed["error"] == "Board not found"


def test_get_cards_in_column_passes_auth_header():
    """TC-005: Authorization header is set on the backend request."""
    with patch("tools.httpx.get", return_value=_mock_response(200, BOARD_PAYLOAD)) as mock_get:
        get_cards_in_column(JWT, BOARD_ID, COLUMN_ID)

    headers = mock_get.call_args.kwargs["headers"]
    assert headers["Authorization"] == f"Bearer {JWT}"


def test_get_cards_invalid_board_id():
    """TC-006: non-UUID board_id rejected before HTTP call."""
    with patch("tools.httpx.get") as mock_get:
        result = get_cards_in_column(JWT, "not-a-uuid", COLUMN_ID)

    mock_get.assert_not_called()
    parsed = json.loads(result)
    assert "error" in parsed


def test_get_cards_invalid_column_id():
    """TC-007: non-UUID column_id rejected before HTTP call."""
    with patch("tools.httpx.get") as mock_get:
        result = get_cards_in_column(JWT, BOARD_ID, "../etc/passwd")

    mock_get.assert_not_called()
    parsed = json.loads(result)
    assert "error" in parsed


def test_get_cards_crlf_jwt():
    """TC-008: CRLF in jwt rejected before HTTP call."""
    with patch("tools.httpx.get") as mock_get:
        result = get_cards_in_column("token\r\nX-Evil: x", BOARD_ID, COLUMN_ID)

    mock_get.assert_not_called()
    parsed = json.loads(result)
    assert parsed["error"] == "JWT contains illegal characters"


def test_get_cards_transport_error():
    """TC-009: transport error returns JSON error, does not raise."""
    with patch("tools.httpx.get", side_effect=httpx.TransportError("refused")):
        result = get_cards_in_column(JWT, BOARD_ID, COLUMN_ID)

    parsed = json.loads(result)
    assert parsed["error"] == "Backend unreachable"
