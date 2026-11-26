import sqlite3
from typing import List

from fastapi import APIRouter, Depends, Response, status

from app.db.connection import get_db
from app.notes import repository
from app.notes.schemas import NoteCreate, NoteOut, NoteUpdate


router = APIRouter(tags=["notes"])


@router.get("/api/ideas/{idea_id}/notes", response_model=List[NoteOut])
def list_notes(idea_id: int, conn: sqlite3.Connection = Depends(get_db)):
    return repository.list_notes(conn, idea_id)


@router.post(
    "/api/ideas/{idea_id}/notes",
    response_model=NoteOut,
    status_code=status.HTTP_201_CREATED,
)
def create_note(
    idea_id: int,
    payload: NoteCreate,
    conn: sqlite3.Connection = Depends(get_db),
):
    return repository.create_note(conn, idea_id, payload)


@router.get("/api/notes/{note_id}", response_model=NoteOut)
def get_note(note_id: int, conn: sqlite3.Connection = Depends(get_db)):
    return repository.get_note(conn, note_id)


@router.put("/api/notes/{note_id}", response_model=NoteOut)
def update_note(
    note_id: int,
    payload: NoteUpdate,
    conn: sqlite3.Connection = Depends(get_db),
):
    return repository.update_note(conn, note_id, payload)


@router.delete("/api/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: int,
    conn: sqlite3.Connection = Depends(get_db),
) -> Response:
    repository.delete_note(conn, note_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
