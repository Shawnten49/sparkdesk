from typing import List, Literal, Optional

from pydantic import BaseModel, Field


IdeaStatus = Literal["头脑风暴", "进行中", "已搁置", "已废弃"]


class IdeaCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    summary: str = Field(default="", max_length=300)
    tags: List[str] = Field(default_factory=list)
    status: IdeaStatus = "头脑风暴"


class IdeaUpdate(BaseModel):
    title: Optional[str] = Field(default=None, max_length=120)
    summary: Optional[str] = Field(default=None, max_length=300)
    tags: Optional[List[str]] = None
    status: Optional[IdeaStatus] = None
    archived: Optional[bool] = None


class IdeaOut(BaseModel):
    id: int
    title: str
    summary: str
    tags: List[str]
    status: str
    archived: bool
    created_at: str
    updated_at: str
    note_count: int = 0
    milestone_count: int = 0
    completed_milestones: int = 0
    progress: int = 0


class ArchiveOut(BaseModel):
    id: int
    archived: bool
