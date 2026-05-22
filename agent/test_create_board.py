"""
test_plan:
  story_id: AGT-006
  framework: pytest + unittest.mock
  tests:
    - id: TC-001  maps_to_ac: "AC-1: create_board with valid name returns 201 JSON response"
    - id: TC-002  maps_to_ac: "AC-2: create_board passes Authorization header"
    - id: TC-003  maps_to_ac: "AC-3: create_board sends correct JSON body (name + workspaceId)"
    - id: TC-004  maps_to_ac: "AC-4: create_board with workspace_id sends UUID in body"
    - id: TC-005  maps_to_ac: "AC-5: backend 4xx returns JSON error with status code"
    - id: TC-006  maps_to_ac: "AC-6: transport error returns {error: Backend unreachable}"
    - id: TC-007  maps_to_ac: "AC-7: blank/whitespace name returns JSON error, httpx not called"
    - id: TC-008  maps_to_ac: "AC-8: CRLF in jwt returns JSON error, httpx not called"
    - id: TC-009  maps_to_ac: "AC-9: workspace_id=None sends null workspaceId in body"
    - id: TC-010  maps_to_ac: "AC-5: backend 5xx returns JSON error with status code"
    - id: TC-011  maps_to_ac: "SEC-032: non-UUID workspace_id rejected, httpx not called"
    - id: TC-012  maps_to_ac: "SEC-033: name > 255 chars rejected, httpx not called"
"""

import json
from unittest.mock import MagicMock, patch

import httpx

from tools import create_board

JWT = "test.jwt.token"
BOARD_RESPONSE = {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "My Board",
    "workspaceId": None,
}
WORKSPACE_ID = "deadbeef-dead-beef-dead-beefdeadbeef"


def _mock_response(status_code: int, json_data=None) -> MagicMock:
    mock = MagicMock(spec=httpx.Response)
    mock.status_code = status_code
    mock.json.return_value = {} if json_data is None else json_data
    return mock


# TC-001
def test_create_board_returns_json_on_201():
    """TC-001: create_board with valid name returns the 201 board object as a JSON string."""
    with patch("tools.httpx.post", return_value=_mock_response(201, BOARD_RESPONSE)):
        result = create_board(JWT, "My Board")

    parsed = json.loads(result)
    assert parsed["id"] == BOARD_RESPONSE["id"]
    assert parsed["name"] == "My Board"


# TC-002
def test_create_board_passes_auth_header():
    """TC-002: create_board sets Authorization: Bearer <jwt> on the POST request."""
    with patch("tools.httpx.post", return_value=_mock_response(201, BOARD_RESPONSE)) as mock_post:
        create_board(JWT, "My Board")

    headers = mock_post.call_args.kwargs["headers"]
    assert headers["Authorization"] == f"Bearer {JWT}"


# TC-003
def test_create_board_sends_name_in_body():
    """TC-003: create_board sends {name: ..., workspaceId: ...} as the JSON body."""
    with patch("tools.httpx.post", return_value=_mock_response(201, BOARD_RESPONSE)) as mock_post:
        create_board(JWT, "Sprint Board")

    json_body = mock_post.call_args.kwargs["json"]
    assert json_body["name"] == "Sprint Board"
    assert "workspaceId" in json_body


# TC-004
def test_create_board_sends_workspace_id_when_provided():
    """TC-004: create_board includes the workspace_id UUID in the JSON body."""
    with patch("tools.httpx.post", return_value=_mock_response(201, BOARD_RESPONSE)) as mock_post:
        create_board(JWT, "Team Board", workspace_id=WORKSPACE_ID)

    json_body = mock_post.call_args.kwargs["json"]
    assert json_body["workspaceId"] == WORKSPACE_ID


# TC-005
def test_create_board_4xx_returns_json_error():
    """TC-005: backend 4xx (non-404) returns JSON with error key containing the status code."""
    with patch("tools.httpx.post", return_value=_mock_response(403)):
        result = create_board(JWT, "Forbidden Board")

    parsed = json.loads(result)
    assert "error" in parsed
    assert "403" in parsed["error"]


# TC-006
def test_create_board_transport_error_returns_json_error():
    """TC-006: httpx.TransportError on create_board → returns JSON error, does not raise."""
    with patch("tools.httpx.post", side_effect=httpx.TransportError("connection refused")):
        result = create_board(JWT, "Unreachable Board")

    parsed = json.loads(result)
    assert parsed["error"] == "Backend unreachable"


# TC-007
def test_create_board_blank_name_returns_error_without_http_call():
    """TC-007: name consisting solely of whitespace returns JSON error; httpx.post not called."""
    with patch("tools.httpx.post") as mock_post:
        result = create_board(JWT, "   ")

    mock_post.assert_not_called()
    parsed = json.loads(result)
    assert "error" in parsed
    assert parsed["error"] == "Board name cannot be blank"


# TC-008
def test_create_board_crlf_jwt_returns_error_without_http_call():
    """TC-008: JWT containing CRLF returns JSON error; httpx.post not called."""
    with patch("tools.httpx.post") as mock_post:
        result = create_board("token\r\nX-Injected: evil", "My Board")

    mock_post.assert_not_called()
    parsed = json.loads(result)
    assert "error" in parsed
    assert parsed["error"] == "JWT contains illegal characters"


# TC-010
def test_create_board_5xx_returns_json_error():
    """TC-010: backend 5xx returns JSON with error key containing the status code."""
    with patch("tools.httpx.post", return_value=_mock_response(500)):
        result = create_board(JWT, "Server Error Board")

    parsed = json.loads(result)
    assert "error" in parsed
    assert "500" in parsed["error"]


# TC-011
def test_create_board_invalid_workspace_id_returns_error():
    """TC-011: non-UUID workspace_id rejected before HTTP call (SEC-032)."""
    with patch("tools.httpx.post") as mock_post:
        result = create_board(JWT, "My Board", workspace_id="not-a-uuid")

    mock_post.assert_not_called()
    parsed = json.loads(result)
    assert parsed["error"] == "Invalid workspace_id"


# TC-012
def test_create_board_name_too_long_returns_error():
    """TC-012: name > 255 chars rejected before HTTP call (SEC-033)."""
    long_name = "x" * 256
    with patch("tools.httpx.post") as mock_post:
        result = create_board(JWT, long_name)

    mock_post.assert_not_called()
    parsed = json.loads(result)
    assert "error" in parsed


# TC-009
def test_create_board_none_workspace_id_sends_null_in_body():
    """TC-009: workspace_id=None results in workspaceId present in body with value None/null."""
    with patch("tools.httpx.post", return_value=_mock_response(201, BOARD_RESPONSE)) as mock_post:
        create_board(JWT, "No Workspace Board", workspace_id=None)

    json_body = mock_post.call_args.kwargs["json"]
    # workspaceId key must be present and its value must be None (serialises to JSON null)
    assert "workspaceId" in json_body
    assert json_body["workspaceId"] is None
