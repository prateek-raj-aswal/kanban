from typing import Annotated, Literal

from pydantic import BaseModel, Field


class Message(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: Annotated[str, Field(min_length=1, max_length=8192)]


class ChatRequest(BaseModel):
    messages: Annotated[list[Message], Field(min_length=1, max_length=100)]


class ChatResponse(BaseModel):
    reply: str
