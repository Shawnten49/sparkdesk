from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


class MilestoneCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    due_date: Optional[date] = None
    completed: bool = False


class MilestoneUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=120)
    due_date: Optional[date] = None
    completed: Optional[bool] = None


class MilestoneOut(BaseModel):
    id: int
    idea_id: int
    name: str
    due_date: Optional[date]
    completed: bool
    created_at: str
    updated_at: str
