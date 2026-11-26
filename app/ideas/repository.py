from __future__ import annotations

import json
import sqlite3
from typing import List, Optional, Sequence

from app.ideas.schemas import IdeaCreate, IdeaOut, IdeaStatus, IdeaUpdate
from app.shared.errors import InvalidOperationError, NotFoundError, ValidationError
from app.shared.sql import NOW_SQL


IDEA_QUERY = """
    SELECT
        i.*,
        (SELECT COUNT(*) FROM notes n WHERE n.idea_id = i.id) AS note_count,
        (SELECT COUNT(*) FROM milestones m WHERE m.idea_id = i.id)
            AS milestone_count,
        (SELECT COUNT(*) FROM milestones m
            WHERE m.idea_id = i.id AND m.completed = 1)
            AS completed_milestones
    FROM ideas i
"""


def normalize_tags(tags: Optional[List[str]]) -> List[str]:
    cleaned: List[str] = []
    seen = set()
    for raw_tag in tags or []:
        tag = str(raw_tag).strip().lstrip("#").strip()
        if not tag or tag in seen:
            continue
        cleaned.append(tag[:30])
        seen.add(tag)
        if len(cleaned) == 12:
            break
    return cleaned


def _decode_tags(raw: str) -> List[str]:
    try:
        value = json.loads(raw or "[]")
        if isinstance(value, list):
            return [str(item) for item in value]
    except (json.JSONDecodeError, TypeError):
        pass
    return []


def _serialize(row: sqlite3.Row) -> IdeaOut:
    total = int(row["milestone_count"] or 0)
    completed = int(row["completed_milestones"] or 0)
    return IdeaOut(
        id=row["id"],
        title=row["title"],
        summary=row["summary"],
        tags=_decode_tags(row["tags"]),
        status=row["status"],
        archived=bool(row["archived"]),
        created_at=row["created_at"],
        updated_at=row["updated_at"],
        note_count=int(row["note_count"] or 0),
        milestone_count=total,
        completed_milestones=completed,
        progress=round(completed * 100 / total) if total else 0,
    )


def ensure_idea(conn: sqlite3.Connection, idea_id: int) -> sqlite3.Row:
    row = conn.execute("SELECT * FROM ideas WHERE id = ?", (idea_id,)).fetchone()
    if row is None:
        raise NotFoundError("灵感不存在")
    return row


def touch_idea(conn: sqlite3.Connection, idea_id: int) -> None:
    conn.execute(
        f"UPDATE ideas SET updated_at = {NOW_SQL} WHERE id = ?",
        (idea_id,),
    )


def list_ideas(
    conn: sqlite3.Connection,
    idea_status: Optional[IdeaStatus] = None,
    include_archived: bool = False,
    query: str = "",
) -> List[IdeaOut]:
    where: List[str] = []
    params: List[object] = []
    if idea_status:
        where.append("i.status = ?")
        params.append(idea_status)
    if not include_archived:
        where.append("i.archived = 0")
    if query.strip():
        keyword = f"%{query.strip()}%"
        where.append("(i.title LIKE ? OR i.summary LIKE ? OR i.tags LIKE ?)")
        params.extend([keyword, keyword, keyword])

    sql = IDEA_QUERY
    if where:
        sql += " WHERE " + " AND ".join(where)
    sql += " ORDER BY i.updated_at DESC, i.id DESC"
    return [_serialize(row) for row in conn.execute(sql, params).fetchall()]


def get_idea(conn: sqlite3.Connection, idea_id: int) -> IdeaOut:
    row = conn.execute(IDEA_QUERY + " WHERE i.id = ?", (idea_id,)).fetchone()
    if row is None:
        raise NotFoundError("灵感不存在")
    return _serialize(row)


def create_idea(conn: sqlite3.Connection, payload: IdeaCreate) -> IdeaOut:
    title = payload.title.strip()
    if not title:
        raise ValidationError("标题不能为空")
    with conn:
        cursor = conn.execute(
            """
            INSERT INTO ideas (title, summary, tags, status)
            VALUES (?, ?, ?, ?)
            """,
            (
                title,
                payload.summary.strip(),
                json.dumps(normalize_tags(payload.tags), ensure_ascii=False),
                payload.status,
            ),
        )
    return get_idea(conn, int(cursor.lastrowid))


def update_idea(
    conn: sqlite3.Connection,
    idea_id: int,
    payload: IdeaUpdate,
) -> IdeaOut:
    ensure_idea(conn, idea_id)
    values = payload.model_dump(exclude_unset=True)
    if not values:
        raise InvalidOperationError("没有需要更新的字段")
    if "title" in values:
        values["title"] = (values["title"] or "").strip()
        if not values["title"]:
            raise ValidationError("标题不能为空")
    if "summary" in values:
        values["summary"] = (values["summary"] or "").strip()
    if "tags" in values:
        values["tags"] = json.dumps(
            normalize_tags(values["tags"]),
            ensure_ascii=False,
        )
    if "archived" in values:
        values["archived"] = int(bool(values["archived"]))

    assignments = [f"{field} = ?" for field in values]
    assignments.append(f"updated_at = {NOW_SQL}")
    params: Sequence[object] = [*values.values(), idea_id]
    with conn:
        conn.execute(
            f"UPDATE ideas SET {', '.join(assignments)} WHERE id = ?",
            params,
        )
    return get_idea(conn, idea_id)


def delete_idea(conn: sqlite3.Connection, idea_id: int) -> None:
    ensure_idea(conn, idea_id)
    with conn:
        conn.execute("DELETE FROM ideas WHERE id = ?", (idea_id,))


def set_archived(
    conn: sqlite3.Connection,
    idea_id: int,
    archived: bool,
) -> None:
    ensure_idea(conn, idea_id)
    with conn:
        conn.execute(
            f"UPDATE ideas SET archived = ?, updated_at = {NOW_SQL} WHERE id = ?",
            (int(archived), idea_id),
        )
