"""
test_plan:
  story_id: AGT-012
  framework: pytest + unittest.mock
  tests:
    - id: TC-001  maps_to_ac: "204 response returns JSON success indicator"
    - id: TC-002  maps_to_ac: "passes Authorization header"
    - id: TC-003  maps_to_ac: "uses DELETE method on correct URL"
    - id: TC-004  maps_to_ac: "non-204 response returns JSON error with status code"
    - id: TC-005  edge: "transport error returns {error: Backend unreachable}"
    - id: TC-006  edge: "non-UUID card_id rejected, httpx not called"
    - id: TC-007  edge: "CRLF in jwt rejected, httpx not called"
"""

import json
from unittest.mock import MagicMock, patch

import httpx

from tools import delete_card

JWT = "test.jwt.token"
CARD_ID = "aaaaaaaa-1111-2222-3333-444444444444"


def _mock_response(status_code: int) -> MagicMock:
    mock = MagicMock(spec=httpx.Response)
    mock.status_code = status_code
    return mock


def test_delete_card_returns_success_on_204():
    """TC-001: 204 response returns a JSON success indicator."""
    with patch("tools.httpx.delete", return_value=_mock_response(204)):
        result = delete_card(JWT, CARD_ID)

    parsed = json.loads(result)
    assert parsed.get("deleted") is True


def test_delete_card_passes_auth_header():
    """TC-002: Authorization: Bearer <jwt> is set on the request."""
    with patch("tools.httpx.delete", return_value=_mock_response(204)) as mock_del:
        delete_card(JWT, CARD_ID)

    headers = mock_del.call_args.kwargs["headers"]
    assert headers["Authorization"] == f"Bearer {JWT}"


def test_delete_card_uses_correct_url():
    """TC-003: DELETE is sent to /api/v1/cards/{card_id}."""
    with patch("tools.httpx.delete", return_value=_mock_response(204)) as mock_del:
        delete_card(JWT, CARD_ID)

    url = mock_del.call_args.args[0]
    assert f"/api/v1/cards/{CARD_ID}" in url


def test_delete_card_non_204_returns_error():
    """TC-004: non-204 backend response returns JSON error containing status code."""
    with patch("tools.httpx.delete", return_value=_mock_response(404)):
        result = delete_card(JWT, CARD_ID)

    parsed = json.loads(result)
    assert "error" in parsed
    assert "404" in parsed["error"]


def test_delete_card_transport_error():
    """TC-005: transport error returns JSON error, does not raise."""
    with patch("tools.httpx.delete", side_effect=httpx.TransportError("refused")):
        result = delete_card(JWT, CARD_ID)

    parsed = json.loads(result)
    assert parsed["error"] == "Backend unreachable"


def test_delete_card_invalid_card_id():
    """TC-006: non-UUID card_id rejected before HTTP call."""
    with patch("tools.httpx.delete") as mock_del:
        result = delete_card(JWT, "not-a-uuid")

    mock_del.assert_not_called()
    parsed = json.loads(result)
    assert "error" in parsed


def test_delete_card_crlf_jwt():
    """TC-007: CRLF in jwt rejected before HTTP call."""
    with patch("tools.httpx.delete") as mock_del:
        result = delete_card("token\r\nX-Evil: x", CARD_ID)

    mock_del.assert_not_called()
    parsed = json.loads(result)
    assert parsed["error"] == "JWT contains illegal characters"
