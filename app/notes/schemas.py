from typing import Literal, Optional

from pydantic import BaseModel, Field


NoteKind = Literal["text", "link", "revision"]


class NoteCreate(BaseModel):
    kind: NoteKind = "text"
    content: str = Field(min_length=1, max_length=20000)


class NoteUpdate(BaseModel):
    kind: Optional[NoteKind] = None
    content: Optional[str] = Field(default=None, max_length=20000)


class NoteOut(BaseModel):
    id: int
    idea_id: int
    kind: str
    content: str
    created_at: str
    updated_at: str
