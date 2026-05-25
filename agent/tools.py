import json
import os
import re

import httpx

_backend_url = os.getenv("BACKEND_URL", "http://localhost:8080")
_UUID_RE = re.compile(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", re.IGNORECASE)
_VALID_PRIORITIES = {"NONE", "LOW", "MEDIUM", "HIGH", "URGENT"}


def _auth_headers(jwt: str) -> dict:
    if "\r" in jwt or "\n" in jwt:
        raise ValueError("JWT contains illegal characters")
    return {"Authorization": f"Bearer {jwt}"}


def get_boards(jwt: str) -> str:
    try:
        headers = _auth_headers(jwt)
    except ValueError as exc:
        return json.dumps({"error": str(exc)})
    try:
        response = httpx.get(
            f"{_backend_url}/api/v1/boards",
            headers=headers,
            timeout=5.0,
        )
    except httpx.TransportError:
        return json.dumps({"error": "Backend unreachable"})
    if not (200 <= response.status_code < 300):
        return json.dumps({"error": f"Backend returned {response.status_code}"})
    return json.dumps(response.json())


def create_board(jwt: str, name: str, workspace_id: str | None = None) -> str:
    if not name or not name.strip():
        return json.dumps({"error": "Board name cannot be blank"})
    if len(name.strip()) > 255:
        return json.dumps({"error": "Board name exceeds maximum length"})
    if workspace_id is not None and not _UUID_RE.fullmatch(workspace_id):
        return json.dumps({"error": "Invalid workspace_id"})
    try:
        headers = _auth_headers(jwt)
    except ValueError as exc:
        return json.dumps({"error": str(exc)})
    try:
        response = httpx.post(
            f"{_backend_url}/api/v1/boards",
            headers=headers,
            json={"name": name.strip(), "workspaceId": workspace_id},
            timeout=5.0,
        )
    except httpx.TransportError:
        return json.dumps({"error": "Backend unreachable"})
    if response.status_code != 201:
        return json.dumps({"error": f"Backend returned {response.status_code}"})
    return json.dumps(response.json())


def search_cards(
    jwt: str,
    board_id: str,
    q: str | None = None,
    assignee_id: str | None = None,
    priority: str | None = None,
) -> str:
    if not _UUID_RE.fullmatch(board_id):
        return json.dumps({"error": "Invalid board_id"})
    if assignee_id is not None and not _UUID_RE.fullmatch(assignee_id):
        return json.dumps({"error": "Invalid assignee_id"})
    if priority is not None and priority not in _VALID_PRIORITIES:
        return json.dumps({"error": f"Invalid priority; must be one of {sorted(_VALID_PRIORITIES)}"})
    if q is not None and len(q) > 256:
        return json.dumps({"error": "Search query exceeds maximum length"})
    try:
        headers = _auth_headers(jwt)
    except ValueError as exc:
        return json.dumps({"error": str(exc)})
    params: dict = {}
    if q is not None:
        params["q"] = q
    if assignee_id is not None:
        params["assigneeId"] = assignee_id
    if priority is not None:
        params["priority"] = priority
    try:
        response = httpx.get(
            f"{_backend_url}/api/v1/boards/{board_id}/cards/search",
            headers=headers,
            params=params,
            timeout=5.0,
        )
    except httpx.TransportError:
        return json.dumps({"error": "Backend unreachable"})
    if not (200 <= response.status_code < 300):
        return json.dumps({"error": f"Backend returned {response.status_code}"})
    if len(response.content) > 1_048_576:
        return json.dumps({"error": "Backend response too large"})
    return json.dumps(response.json())


def get_cards_in_column(jwt: str, board_id: str, column_id: str) -> str:
    if not _UUID_RE.fullmatch(board_id):
        return json.dumps({"error": "Invalid board_id"})
    if not _UUID_RE.fullmatch(column_id):
        return json.dumps({"error": "Invalid column_id"})
    try:
        headers = _auth_headers(jwt)
    except ValueError as exc:
        return json.dumps({"error": str(exc)})
    try:
        response = httpx.get(
            f"{_backend_url}/api/v1/boards/{board_id}",
            headers=headers,
            timeout=5.0,
        )
    except httpx.TransportError:
        return json.dumps({"error": "Backend unreachable"})
    if response.status_code == 404:
        return json.dumps({"error": "Board not found"})
    if not (200 <= response.status_code < 300):
        return json.dumps({"error": f"Backend returned {response.status_code}"})
    if len(response.content) > 1_048_576:
        return json.dumps({"error": "Backend response too large"})
    board = response.json()
    _CARD_KEYS = {"id", "title", "position", "columnId"}
    for col in board.get("columns") or []:
        if col.get("id") == column_id:
            cards = [{k: v for k, v in c.items() if k in _CARD_KEYS}
                     for c in col.get("cards") or []]
            return json.dumps(cards)
    return json.dumps({"error": "Column not found"})


def create_card(
    jwt: str,
    column_id: str,
    title: str,
    description: str | None = None,
    due_date: str | None = None,
    priority: str | None = None,
) -> str:
    if not title or not title.strip():
        return json.dumps({"error": "Card title cannot be blank"})
    if len(title) > 255:
        return json.dumps({"error": "Card title exceeds maximum length"})
    if not _UUID_RE.fullmatch(column_id):
        return json.dumps({"error": "Invalid column_id"})
    if priority is not None and priority not in _VALID_PRIORITIES:
        return json.dumps({"error": f"Invalid priority; must be one of {sorted(_VALID_PRIORITIES)}"})
    if description is not None and len(description) > 10_000:
        return json.dumps({"error": "Card description exceeds maximum length"})
    try:
        headers = _auth_headers(jwt)
    except ValueError as exc:
        return json.dumps({"error": str(exc)})
    try:
        response = httpx.post(
            f"{_backend_url}/api/v1/columns/{column_id}/cards",
            headers=headers,
            json={"title": title, "description": description, "dueDate": due_date, "priority": priority},
            timeout=5.0,
        )
    except httpx.TransportError:
        return json.dumps({"error": "Backend unreachable"})
    if response.status_code != 201:
        return json.dumps({"error": f"Backend returned {response.status_code}"})
    if len(response.content) > 1_048_576:
        return json.dumps({"error": "Backend response too large"})
    return json.dumps(response.json())


def move_card(jwt: str, card_id: str, target_column_id: str, position: float | None = None) -> str:
    if not _UUID_RE.fullmatch(card_id):
        return json.dumps({"error": "Invalid card_id"})
    if not _UUID_RE.fullmatch(target_column_id):
        return json.dumps({"error": "Invalid target_column_id"})
    try:
        headers = _auth_headers(jwt)
    except ValueError as exc:
        return json.dumps({"error": str(exc)})
    try:
        response = httpx.patch(
            f"{_backend_url}/api/v1/cards/{card_id}/move",
            headers=headers,
            json={"targetColumnId": target_column_id, "position": position},
            timeout=5.0,
        )
    except httpx.TransportError:
        return json.dumps({"error": "Backend unreachable"})
    if response.status_code != 200:
        return json.dumps({"error": f"Backend returned {response.status_code}"})
    if len(response.content) > 1_048_576:
        return json.dumps({"error": "Backend response too large"})
    return json.dumps(response.json())


def update_card(
    jwt: str,
    card_id: str,
    title: str | None = None,
    description: str | None = None,
    due_date: str | None = None,
    priority: str | None = None,
) -> str:
    if not _UUID_RE.fullmatch(card_id):
        return json.dumps({"error": "Invalid card_id"})
    if title is not None and not title.strip():
        return json.dumps({"error": "Card title cannot be blank"})
    if title is not None and len(title) > 255:
        return json.dumps({"error": "Card title exceeds maximum length"})
    if description is not None and len(description) > 10_000:
        return json.dumps({"error": "Card description exceeds maximum length"})
    if priority is not None and priority not in _VALID_PRIORITIES:
        return json.dumps({"error": f"Invalid priority; must be one of {sorted(_VALID_PRIORITIES)}"})
    try:
        headers = _auth_headers(jwt)
    except ValueError as exc:
        return json.dumps({"error": str(exc)})
    body: dict = {}
    if title is not None:
        body["title"] = title
    if description is not None:
        body["description"] = description
    if due_date is not None:
        body["dueDate"] = due_date
    if priority is not None:
        body["priority"] = priority
    try:
        response = httpx.patch(
            f"{_backend_url}/api/v1/cards/{card_id}",
            headers=headers,
            json=body,
            timeout=5.0,
        )
    except httpx.TransportError:
        return json.dumps({"error": "Backend unreachable"})
    if response.status_code != 200:
        return json.dumps({"error": f"Backend returned {response.status_code}"})
    if len(response.content) > 1_048_576:
        return json.dumps({"error": "Backend response too large"})
    return json.dumps(response.json())


def delete_card(jwt: str, card_id: str) -> str:
    if not _UUID_RE.fullmatch(card_id):
        return json.dumps({"error": "Invalid card_id"})
    try:
        headers = _auth_headers(jwt)
    except ValueError as exc:
        return json.dumps({"error": str(exc)})
    try:
        response = httpx.delete(
            f"{_backend_url}/api/v1/cards/{card_id}",
            headers=headers,
            timeout=5.0,
        )
    except httpx.TransportError:
        return json.dumps({"error": "Backend unreachable"})
    if response.status_code != 204:
        return json.dumps({"error": f"Backend returned {response.status_code}"})
    return json.dumps({"deleted": True})


def get_board(jwt: str, board_id: str) -> str:
    if not _UUID_RE.fullmatch(board_id):
        return json.dumps({"error": "Invalid board_id"})
    try:
        headers = _auth_headers(jwt)
    except ValueError as exc:
        return json.dumps({"error": str(exc)})
    try:
        response = httpx.get(
            f"{_backend_url}/api/v1/boards/{board_id}",
            headers=headers,
            timeout=5.0,
        )
    except httpx.TransportError:
        return json.dumps({"error": "Backend unreachable"})
    if response.status_code == 404:
        return json.dumps({"error": "Board not found"})
    if not (200 <= response.status_code < 300):
        return json.dumps({"error": f"Backend returned {response.status_code}"})
    return json.dumps(response.json())
