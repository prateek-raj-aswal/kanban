import json
import os

import httpx
import openai
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import tools
from models import ChatRequest, ChatResponse

_debug = os.getenv("DEBUG", "false").lower() == "true"
_backend_url = os.getenv("BACKEND_URL", "http://localhost:8080")

_ollama_base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
_ollama_client = openai.OpenAI(base_url=f"{_ollama_base_url}/v1", api_key="ollama")
_OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:3b")

_TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "get_boards",
            "description": "List all boards the current user has access to.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_board",
            "description": "Get full details of a single board including its columns and cards.",
            "parameters": {
                "type": "object",
                "properties": {
                    "board_id": {"type": "string", "description": "UUID of the board"},
                },
                "required": ["board_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "create_board",
            "description": "Create a new board.",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Board name (max 255 chars)"},
                    "workspace_id": {"type": "string", "description": "Optional UUID of workspace"},
                },
                "required": ["name"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_cards_in_column",
            "description": "List all cards in a specific column of a board.",
            "parameters": {
                "type": "object",
                "properties": {
                    "board_id": {"type": "string", "description": "UUID of the board"},
                    "column_id": {"type": "string", "description": "UUID of the column"},
                },
                "required": ["board_id", "column_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search_cards",
            "description": "Search for cards across a board by text, assignee, or priority.",
            "parameters": {
                "type": "object",
                "properties": {
                    "board_id": {"type": "string", "description": "UUID of the board"},
                    "q": {"type": "string", "description": "Search text"},
                    "assignee_id": {"type": "string", "description": "UUID of assignee to filter by"},
                    "priority": {
                        "type": "string",
                        "enum": ["NONE", "LOW", "MEDIUM", "HIGH", "URGENT"],
                        "description": "Priority filter",
                    },
                },
                "required": ["board_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "create_card",
            "description": "Create a new card in a column.",
            "parameters": {
                "type": "object",
                "properties": {
                    "column_id": {"type": "string", "description": "UUID of the column"},
                    "title": {"type": "string", "description": "Card title (max 255 chars)"},
                    "description": {"type": "string", "description": "Optional description (max 10000 chars)"},
                    "due_date": {"type": "string", "description": "Optional due date YYYY-MM-DD"},
                    "priority": {
                        "type": "string",
                        "enum": ["NONE", "LOW", "MEDIUM", "HIGH", "URGENT"],
                        "description": "Optional priority",
                    },
                },
                "required": ["column_id", "title"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "move_card",
            "description": "Move a card to a different column. Use position=65536 to append to end.",
            "parameters": {
                "type": "object",
                "properties": {
                    "card_id": {"type": "string", "description": "UUID of the card"},
                    "target_column_id": {"type": "string", "description": "UUID of destination column"},
                    "position": {"type": "number", "description": "Position in column (65536 = append to end)"},
                },
                "required": ["card_id", "target_column_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "update_card",
            "description": "Update one or more fields of a card. Only provide fields you want to change.",
            "parameters": {
                "type": "object",
                "properties": {
                    "card_id": {"type": "string", "description": "UUID of the card"},
                    "title": {"type": "string", "description": "New title (max 255 chars)"},
                    "description": {"type": "string", "description": "New description (max 10000 chars)"},
                    "due_date": {"type": "string", "description": "New due date YYYY-MM-DD"},
                    "priority": {
                        "type": "string",
                        "enum": ["NONE", "LOW", "MEDIUM", "HIGH", "URGENT"],
                        "description": "New priority",
                    },
                },
                "required": ["card_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "delete_card",
            "description": "Permanently delete a card. This action cannot be undone.",
            "parameters": {
                "type": "object",
                "properties": {
                    "card_id": {"type": "string", "description": "UUID of the card to delete"},
                },
                "required": ["card_id"],
            },
        },
    },
]


def _dispatch_tool(name: str, args: dict, jwt: str) -> str:
    if name == "get_boards":
        return tools.get_boards(jwt)
    if name == "get_board":
        return tools.get_board(jwt, args["board_id"])
    if name == "create_board":
        return tools.create_board(jwt, args["name"], args.get("workspace_id"))
    if name == "get_cards_in_column":
        return tools.get_cards_in_column(jwt, args["board_id"], args["column_id"])
    if name == "search_cards":
        return tools.search_cards(
            jwt, args["board_id"],
            args.get("q"), args.get("assignee_id"), args.get("priority"),
        )
    if name == "create_card":
        return tools.create_card(
            jwt, args["column_id"], args["title"],
            args.get("description"), args.get("due_date"), args.get("priority"),
        )
    if name == "move_card":
        return tools.move_card(
            jwt, args["card_id"], args["target_column_id"], args.get("position"),
        )
    if name == "update_card":
        return tools.update_card(
            jwt, args["card_id"],
            args.get("title"), args.get("description"),
            args.get("due_date"), args.get("priority"),
        )
    if name == "delete_card":
        return tools.delete_card(jwt, args["card_id"])
    return json.dumps({"error": f"Unknown tool: {name}"})


_cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app = FastAPI(
    docs_url="/docs" if _debug else None,
    redoc_url="/redoc" if _debug else None,
    openapi_url="/openapi.json" if _debug else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


def _validate_jwt(jwt: str) -> None:
    try:
        response = httpx.get(
            f"{_backend_url}/api/v1/boards",
            headers={"Authorization": f"Bearer {jwt}"},
            timeout=5.0,
        )
    except httpx.TransportError:
        raise HTTPException(status_code=502, detail="Backend unreachable")
    if response.status_code == 401:
        raise HTTPException(status_code=401, detail="Unauthorized")
    if not (200 <= response.status_code < 300):
        raise HTTPException(status_code=502, detail="Backend unreachable")


_MAX_TOOL_ROUNDS = 10


def _run_tool_loop(messages: list[dict], jwt: str) -> str:
    conversation = list(messages)
    for _ in range(_MAX_TOOL_ROUNDS):
        try:
            completion = _ollama_client.chat.completions.create(
                model=_OLLAMA_MODEL,
                messages=conversation,
                tools=_TOOL_DEFINITIONS,
            )
        except openai.APIError as exc:
            raise HTTPException(status_code=502, detail="LLM service unavailable") from exc

        message = completion.choices[0].message

        if not message.tool_calls:
            return message.content or ""

        conversation.append({
            "role": "assistant",
            "content": message.content,
            "tool_calls": [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {"name": tc.function.name, "arguments": tc.function.arguments},
                }
                for tc in message.tool_calls
            ],
        })
        for tc in message.tool_calls:
            try:
                args = json.loads(tc.function.arguments)
            except json.JSONDecodeError:
                args = None
            if args is None:
                result = json.dumps({"error": "Malformed tool arguments"})
            else:
                result = _dispatch_tool(tc.function.name, args, jwt)
            conversation.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": result,
            })

    raise HTTPException(status_code=500, detail="Tool loop exceeded maximum iterations")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    authorization: str = Header(alias="Authorization"),
) -> ChatResponse:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    jwt = authorization[7:]
    _validate_jwt(jwt)
    messages = [m.model_dump() for m in request.messages]
    reply = _run_tool_loop(messages, jwt)
    return ChatResponse(reply=reply)
