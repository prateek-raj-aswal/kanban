"""
test_plan:
  story_id: AGT-008
  framework: pytest + unittest.mock
  tests:
    - id: TC-001  maps_to_ac: "returns JSON list of matching cards"
    - id: TC-002  maps_to_ac: "returns empty list when no matches"
    - id: TC-003  maps_to_ac: "passes q param when provided"
    - id: TC-004  maps_to_ac: "passes assignee_id param when provided"
    - id: TC-005  maps_to_ac: "passes priority param when provided"
    - id: TC-006  maps_to_ac: "omits None params from query string"
    - id: TC-007  maps_to_ac: "passes Authorization header"
    - id: TC-008  edge: "non-UUID board_id rejected, httpx not called"
    - id: TC-009  edge: "non-UUID assignee_id rejected, httpx not called"
    - id: TC-010  edge: "invalid priority rejected, httpx not called"
    - id: TC-011  edge: "CRLF in jwt rejected, httpx not called"
    - id: TC-012  edge: "transport error returns JSON error"
    - id: TC-013  edge: "4xx returns JSON error with status code"
"""

import json
from unittest.mock import MagicMock, patch

import httpx

from tools import search_cards

JWT = "test.jwt.token"
BOARD_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
ASSIGNEE_ID = "b2c3d4e5-f6a7-8901-bcde-f12345678901"

CARDS_PAYLOAD = [
    {"id": "card1111-1111-1111-1111-111111111111", "title": "Fix login bug"},
    {"id": "card2222-2222-2222-2222-222222222222", "title": "Write tests"},
]

def _mock_response(status_code: int, json_data=None) -> MagicMock:
    mock = MagicMock(spec=httpx.Response)
    mock.status_code = status_code
    mock.json.return_value = [] if json_data is None else json_data
    return mock


def test_search_cards_returns_list():
    """TC-001: returns JSON list of cards matching the search."""
    with patch("tools.httpx.get", return_value=_mock_response(200, CARDS_PAYLOAD)):
        result = search_cards(JWT, BOARD_ID, q="login")

    parsed = json.loads(result)
    assert isinstance(parsed, list)
    assert len(parsed) == 2
    assert parsed[0]["title"] == "Fix login bug"


def test_search_cards_empty_results():
    """TC-002: returns empty list when backend returns no matches."""
    with patch("tools.httpx.get", return_value=_mock_response(200, [])):
        result = search_cards(JWT, BOARD_ID, q="nonexistent")

    parsed = json.loads(result)
    assert parsed == []


def test_search_cards_passes_q_param():
    """TC-003: q is forwarded as a query parameter."""
    with patch("tools.httpx.get", return_value=_mock_response(200, [])) as mock_get:
        search_cards(JWT, BOARD_ID, q="login bug")

    params = mock_get.call_args.kwargs["params"]
    assert params.get("q") == "login bug"


def test_search_cards_passes_assignee_id_param():
    """TC-004: assignee_id is forwarded as assigneeId query parameter."""
    with patch("tools.httpx.get", return_value=_mock_response(200, [])) as mock_get:
        search_cards(JWT, BOARD_ID, assignee_id=ASSIGNEE_ID)

    params = mock_get.call_args.kwargs["params"]
    assert params.get("assigneeId") == ASSIGNEE_ID


def test_search_cards_passes_priority_param():
    """TC-005: priority is forwarded as a query parameter."""
    with patch("tools.httpx.get", return_value=_mock_response(200, [])) as mock_get:
        search_cards(JWT, BOARD_ID, priority="HIGH")

    params = mock_get.call_args.kwargs["params"]
    assert params.get("priority") == "HIGH"


def test_search_cards_omits_none_params():
    """TC-006: None params are not sent regardless of which params are set."""
    # all None
    with patch("tools.httpx.get", return_value=_mock_response(200, [])) as mock_get:
        search_cards(JWT, BOARD_ID)
    params = mock_get.call_args.kwargs["params"]
    assert "q" not in params
    assert "assigneeId" not in params
    assert "priority" not in params

    # only q set — assigneeId and priority must be absent
    with patch("tools.httpx.get", return_value=_mock_response(200, [])) as mock_get:
        search_cards(JWT, BOARD_ID, q="hello")
    params = mock_get.call_args.kwargs["params"]
    assert "q" in params
    assert "assigneeId" not in params
    assert "priority" not in params

    # only assignee_id set — q and priority must be absent
    with patch("tools.httpx.get", return_value=_mock_response(200, [])) as mock_get:
        search_cards(JWT, BOARD_ID, assignee_id=ASSIGNEE_ID)
    params = mock_get.call_args.kwargs["params"]
    assert "q" not in params
    assert "assigneeId" in params
    assert "priority" not in params


def test_search_cards_passes_auth_header():
    """TC-007: Authorization: Bearer <jwt> is set on the request."""
    with patch("tools.httpx.get", return_value=_mock_response(200, [])) as mock_get:
        search_cards(JWT, BOARD_ID, q="test")

    headers = mock_get.call_args.kwargs["headers"]
    assert headers["Authorization"] == f"Bearer {JWT}"


def test_search_cards_invalid_board_id():
    """TC-008: non-UUID board_id rejected before HTTP call."""
    with patch("tools.httpx.get") as mock_get:
        result = search_cards(JWT, "not-a-uuid")

    mock_get.assert_not_called()
    parsed = json.loads(result)
    assert "error" in parsed


def test_search_cards_invalid_assignee_id():
    """TC-009: non-UUID assignee_id rejected before HTTP call."""
    with patch("tools.httpx.get") as mock_get:
        result = search_cards(JWT, BOARD_ID, assignee_id="not-a-uuid")

    mock_get.assert_not_called()
    parsed = json.loads(result)
    assert "error" in parsed


def test_search_cards_invalid_priority():
    """TC-010: priority not in allowed set rejected before HTTP call."""
    with patch("tools.httpx.get") as mock_get:
        result = search_cards(JWT, BOARD_ID, priority="CRITICAL")

    mock_get.assert_not_called()
    parsed = json.loads(result)
    assert "error" in parsed


def test_search_cards_crlf_jwt():
    """TC-011: CRLF in jwt rejected before HTTP call."""
    with patch("tools.httpx.get") as mock_get:
        result = search_cards("token\r\nX-Evil: x", BOARD_ID)

    mock_get.assert_not_called()
    parsed = json.loads(result)
    assert parsed["error"] == "JWT contains illegal characters"


def test_search_cards_transport_error():
    """TC-012: transport error returns JSON error, does not raise."""
    with patch("tools.httpx.get", side_effect=httpx.TransportError("refused")):
        result = search_cards(JWT, BOARD_ID, q="test")

    parsed = json.loads(result)
    assert parsed["error"] == "Backend unreachable"


def test_search_cards_4xx_returns_error():
    """TC-013: 4xx from backend returns JSON error with status code."""
    with patch("tools.httpx.get", return_value=_mock_response(403)):
        result = search_cards(JWT, BOARD_ID, q="test")

    parsed = json.loads(result)
    assert "error" in parsed
    assert "403" in parsed["error"]
