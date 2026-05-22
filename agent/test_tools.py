"""
Test plan:
  story_id: AGT-005
  framework: pytest + unittest.mock
  tests:
    - id: TC-001  maps_to_ac: get_boards returns JSON string of boards list
    - id: TC-002  maps_to_ac: get_board returns JSON string of full board
    - id: TC-003  maps_to_ac: get_board returns JSON error on 404
    - id: TC-004  edge: get_boards passes Authorization header correctly
    - id: TC-005  edge: get_board passes Authorization header correctly
    - id: TC-006  edge: backend error on get_boards returns error string
    - id: TC-007  edge: get_board rejects non-UUID board_id (path traversal)
    - id: TC-008  edge: get_board transport error returns JSON error string
    - id: TC-009  security: get_boards rejects JWT with CRLF (header injection)
    - id: TC-010  security: get_board rejects JWT with CRLF (header injection)
    - id: TC-011  edge: get_boards transport error returns JSON error string
"""

import json
from unittest.mock import MagicMock, patch

import httpx

from tools import get_board, get_boards

JWT = "test.jwt.token"
BOARDS_PAYLOAD = [{"id": "b1", "name": "Sprint"}, {"id": "b2", "name": "Backlog"}]
BOARD_PAYLOAD = {
    "id": "b1",
    "name": "Sprint",
    "columns": [{"id": "c1", "name": "To Do", "cards": []}],
}
VALID_BOARD_ID = "b1a2c3d4-e5f6-7890-abcd-ef1234567890"


def _mock_response(status_code: int, json_data=None) -> MagicMock:
    mock = MagicMock(spec=httpx.Response)
    mock.status_code = status_code
    mock.json.return_value = {} if json_data is None else json_data
    return mock


def test_get_boards_returns_json_string():
    """TC-001: get_boards returns a JSON string of the boards list."""
    with patch("tools.httpx.get", return_value=_mock_response(200, BOARDS_PAYLOAD)):
        result = get_boards(JWT)

    parsed = json.loads(result)
    assert parsed == BOARDS_PAYLOAD


def test_get_boards_passes_auth_header():
    """TC-004: get_boards sets Authorization: Bearer <jwt> on the request."""
    with patch("tools.httpx.get", return_value=_mock_response(200, [])) as mock_get:
        get_boards(JWT)

    headers = mock_get.call_args.kwargs["headers"]
    assert headers["Authorization"] == f"Bearer {JWT}"


def test_get_boards_backend_error_returns_error_string():
    """TC-006: non-2xx from backend returns JSON error, does not raise."""
    with patch("tools.httpx.get", return_value=_mock_response(500)):
        result = get_boards(JWT)

    parsed = json.loads(result)
    assert "error" in parsed


def test_get_boards_rejects_crlf_jwt():
    """TC-009: JWT with CRLF in get_boards → JSON error, httpx not called."""
    with patch("tools.httpx.get") as mock_get:
        result = get_boards("token\r\nX-Injected: evil")

    mock_get.assert_not_called()
    parsed = json.loads(result)
    assert "error" in parsed


def test_get_board_returns_json_string():
    """TC-002: get_board returns a JSON string of the full board."""
    with patch("tools.httpx.get", return_value=_mock_response(200, BOARD_PAYLOAD)):
        result = get_board(JWT, VALID_BOARD_ID)

    parsed = json.loads(result)
    assert parsed["id"] == "b1"
    assert "columns" in parsed


def test_get_board_passes_auth_header():
    """TC-005: get_board sets Authorization: Bearer <jwt> on the request."""
    with patch("tools.httpx.get", return_value=_mock_response(200, BOARD_PAYLOAD)) as mock_get:
        get_board(JWT, VALID_BOARD_ID)

    headers = mock_get.call_args.kwargs["headers"]
    assert headers["Authorization"] == f"Bearer {JWT}"


def test_get_board_returns_json_error_on_404():
    """TC-003: 404 from backend → returns JSON error, does not raise."""
    with patch("tools.httpx.get", return_value=_mock_response(404)):
        result = get_board(JWT, VALID_BOARD_ID)

    parsed = json.loads(result)
    assert parsed["error"] == "Board not found"


def test_get_board_rejects_non_uuid_board_id():
    """TC-007: non-UUID board_id is rejected before HTTP call (path traversal guard)."""
    with patch("tools.httpx.get") as mock_get:
        result = get_board(JWT, "../admin")

    mock_get.assert_not_called()
    parsed = json.loads(result)
    assert "error" in parsed


def test_get_board_transport_error_returns_json_error():
    """TC-008: httpx.TransportError on get_board → returns JSON error, does not raise."""
    with patch("tools.httpx.get", side_effect=httpx.TransportError("connection refused")):
        result = get_board(JWT, VALID_BOARD_ID)

    parsed = json.loads(result)
    assert parsed["error"] == "Backend unreachable"


def test_get_board_rejects_crlf_jwt():
    """TC-010: JWT with CRLF in get_board → JSON error, httpx not called."""
    with patch("tools.httpx.get") as mock_get:
        result = get_board("token\r\nX-Injected: evil", VALID_BOARD_ID)

    mock_get.assert_not_called()
    parsed = json.loads(result)
    assert "error" in parsed


def test_get_boards_transport_error_returns_json_error():
    """TC-011: httpx.TransportError on get_boards → returns JSON error, does not raise."""
    with patch("tools.httpx.get", side_effect=httpx.TransportError("connection refused")):
        result = get_boards(JWT)

    parsed = json.loads(result)
    assert parsed["error"] == "Backend unreachable"
