import sqlite3
from typing import List

from fastapi import APIRouter, Depends, Response, status

from app.db.connection import get_db
from app.milestones import repository
from app.milestones.schemas import (
    MilestoneCreate,
    MilestoneOut,
    MilestoneUpdate,
)


router = APIRouter(tags=["milestones"])


@router.get(
    "/api/ideas/{idea_id}/milestones",
    response_model=List[MilestoneOut],
)
def list_milestones(
    idea_id: int,
    conn: sqlite3.Connection = Depends(get_db),
):
    return repository.list_milestones(conn, idea_id)


@router.post(
    "/api/ideas/{idea_id}/milestones",
    response_model=MilestoneOut,
    status_code=status.HTTP_201_CREATED,
)
def create_milestone(
    idea_id: int,
    payload: MilestoneCreate,
    conn: sqlite3.Connection = Depends(get_db),
):
    return repository.create_milestone(conn, idea_id, payload)


@router.get("/api/milestones/{milestone_id}", response_model=MilestoneOut)
def get_milestone(
    milestone_id: int,
    conn: sqlite3.Connection = Depends(get_db),
):
    return repository.get_milestone(conn, milestone_id)


@router.put("/api/milestones/{milestone_id}", response_model=MilestoneOut)
def update_milestone(
    milestone_id: int,
    payload: MilestoneUpdate,
    conn: sqlite3.Connection = Depends(get_db),
):
    return repository.update_milestone(conn, milestone_id, payload)


@router.delete(
    "/api/milestones/{milestone_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_milestone(
    milestone_id: int,
    conn: sqlite3.Connection = Depends(get_db),
) -> Response:
    repository.delete_milestone(conn, milestone_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
