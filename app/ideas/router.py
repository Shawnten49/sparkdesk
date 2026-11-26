import sqlite3
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, Response, status

from app.db.connection import get_db
from app.ideas import repository
from app.ideas.schemas import (
    ArchiveOut,
    IdeaCreate,
    IdeaOut,
    IdeaStatus,
    IdeaUpdate,
)


router = APIRouter(tags=["ideas"])


@router.get("/api/ideas", response_model=List[IdeaOut])
def list_ideas(
    idea_status: Optional[IdeaStatus] = Query(default=None, alias="status"),
    include_archived: bool = False,
    q: str = Query(default="", max_length=100),
    conn: sqlite3.Connection = Depends(get_db),
) -> List[IdeaOut]:
    return repository.list_ideas(conn, idea_status, include_archived, q)


@router.post(
    "/api/ideas",
    response_model=IdeaOut,
    status_code=status.HTTP_201_CREATED,
)
def create_idea(
    payload: IdeaCreate,
    conn: sqlite3.Connection = Depends(get_db),
):
    return repository.create_idea(conn, payload)


@router.get("/api/ideas/{idea_id}", response_model=IdeaOut)
def get_idea(idea_id: int, conn: sqlite3.Connection = Depends(get_db)):
    return repository.get_idea(conn, idea_id)


@router.put("/api/ideas/{idea_id}", response_model=IdeaOut)
def update_idea(
    idea_id: int,
    payload: IdeaUpdate,
    conn: sqlite3.Connection = Depends(get_db),
):
    return repository.update_idea(conn, idea_id, payload)


@router.delete("/api/ideas/{idea_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_idea(
    idea_id: int,
    conn: sqlite3.Connection = Depends(get_db),
) -> Response:
    repository.delete_idea(conn, idea_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/api/ideas/{idea_id}/archive", response_model=ArchiveOut)
def archive_idea(idea_id: int, conn: sqlite3.Connection = Depends(get_db)):
    repository.set_archived(conn, idea_id, True)
    return ArchiveOut(id=idea_id, archived=True)


@router.post("/api/ideas/{idea_id}/restore", response_model=ArchiveOut)
def restore_idea(idea_id: int, conn: sqlite3.Connection = Depends(get_db)):
    repository.set_archived(conn, idea_id, False)
    return ArchiveOut(id=idea_id, archived=False)
