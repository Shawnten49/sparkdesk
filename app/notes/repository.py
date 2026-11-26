from __future__ import annotations

import sqlite3
from typing import List

from app.ideas.repository import ensure_idea, touch_idea
from app.notes.schemas import NoteCreate, NoteOut, NoteUpdate
from app.shared.errors import InvalidOperationError, NotFoundError, ValidationError
from app.shared.sql import NOW_SQL


def list_notes(conn: sqlite3.Connection, idea_id: int) -> List[NoteOut]:
    ensure_idea(conn, idea_id)
    rows = conn.execute(
        """
        SELECT * FROM notes
        WHERE idea_id = ?
        ORDER BY created_at DESC, id DESC
        """,
        (idea_id,),
    ).fetchall()
    return [NoteOut(**dict(row)) for row in rows]


def get_note(conn: sqlite3.Connection, note_id: int) -> NoteOut:
    row = conn.execute("SELECT * FROM notes WHERE id = ?", (note_id,)).fetchone()
    if row is None:
        raise NotFoundError("笔记不存在")
    return NoteOut(**dict(row))


def create_note(
    conn: sqlite3.Connection,
    idea_id: int,
    payload: NoteCreate,
) -> NoteOut:
    ensure_idea(conn, idea_id)
    content = payload.content.strip()
    if not content:
        raise ValidationError("笔记内容不能为空")
    with conn:
        cursor = conn.execute(
            "INSERT INTO notes (idea_id, kind, content) VALUES (?, ?, ?)",
            (idea_id, payload.kind, content),
        )
        touch_idea(conn, idea_id)
    return get_note(conn, int(cursor.lastrowid))


def update_note(
    conn: sqlite3.Connection,
    note_id: int,
    payload: NoteUpdate,
) -> NoteOut:
    row = conn.execute("SELECT * FROM notes WHERE id = ?", (note_id,)).fetchone()
    if row is None:
        raise NotFoundError("笔记不存在")
    values = payload.model_dump(exclude_unset=True)
    if not values:
        raise InvalidOperationError("没有需要更新的字段")
    if "content" in values:
        values["content"] = (values["content"] or "").strip()
        if not values["content"]:
            raise ValidationError("笔记内容不能为空")

    assignments = [f"{field} = ?" for field in values]
    assignments.append(f"updated_at = {NOW_SQL}")
    with conn:
        conn.execute(
            f"UPDATE notes SET {', '.join(assignments)} WHERE id = ?",
            [*values.values(), note_id],
        )
        touch_idea(conn, row["idea_id"])
    return get_note(conn, note_id)


def delete_note(conn: sqlite3.Connection, note_id: int) -> None:
    row = conn.execute("SELECT * FROM notes WHERE id = ?", (note_id,)).fetchone()
    if row is None:
        raise NotFoundError("笔记不存在")
    with conn:
        conn.execute("DELETE FROM notes WHERE id = ?", (note_id,))
        touch_idea(conn, row["idea_id"])
