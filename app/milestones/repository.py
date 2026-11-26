from __future__ import annotations

import sqlite3
from typing import List

from app.ideas.repository import ensure_idea, touch_idea
from app.milestones.schemas import MilestoneCreate, MilestoneOut, MilestoneUpdate
from app.shared.errors import InvalidOperationError, NotFoundError, ValidationError
from app.shared.sql import NOW_SQL


def list_milestones(
    conn: sqlite3.Connection,
    idea_id: int,
) -> List[MilestoneOut]:
    ensure_idea(conn, idea_id)
    rows = conn.execute(
        """
        SELECT * FROM milestones
        WHERE idea_id = ?
        ORDER BY completed ASC, due_date IS NULL, due_date ASC, id ASC
        """,
        (idea_id,),
    ).fetchall()
    return [MilestoneOut(**dict(row)) for row in rows]


def get_milestone(
    conn: sqlite3.Connection,
    milestone_id: int,
) -> MilestoneOut:
    row = conn.execute(
        "SELECT * FROM milestones WHERE id = ?",
        (milestone_id,),
    ).fetchone()
    if row is None:
        raise NotFoundError("里程碑不存在")
    return MilestoneOut(**dict(row))


def create_milestone(
    conn: sqlite3.Connection,
    idea_id: int,
    payload: MilestoneCreate,
) -> MilestoneOut:
    ensure_idea(conn, idea_id)
    name = payload.name.strip()
    if not name:
        raise ValidationError("里程碑名称不能为空")
    with conn:
        cursor = conn.execute(
            """
            INSERT INTO milestones (idea_id, name, due_date, completed)
            VALUES (?, ?, ?, ?)
            """,
            (
                idea_id,
                name,
                payload.due_date.isoformat() if payload.due_date else None,
                int(payload.completed),
            ),
        )
        touch_idea(conn, idea_id)
    return get_milestone(conn, int(cursor.lastrowid))


def update_milestone(
    conn: sqlite3.Connection,
    milestone_id: int,
    payload: MilestoneUpdate,
) -> MilestoneOut:
    row = conn.execute(
        "SELECT * FROM milestones WHERE id = ?",
        (milestone_id,),
    ).fetchone()
    if row is None:
        raise NotFoundError("里程碑不存在")
    values = payload.model_dump(exclude_unset=True)
    if not values:
        raise InvalidOperationError("没有需要更新的字段")
    if "name" in values:
        values["name"] = (values["name"] or "").strip()
        if not values["name"]:
            raise ValidationError("里程碑名称不能为空")
    if values.get("due_date") is not None:
        values["due_date"] = values["due_date"].isoformat()
    if "completed" in values:
        values["completed"] = int(bool(values["completed"]))

    assignments = [f"{field} = ?" for field in values]
    assignments.append(f"updated_at = {NOW_SQL}")
    with conn:
        conn.execute(
            f"UPDATE milestones SET {', '.join(assignments)} WHERE id = ?",
            [*values.values(), milestone_id],
        )
        touch_idea(conn, row["idea_id"])
    return get_milestone(conn, milestone_id)


def delete_milestone(conn: sqlite3.Connection, milestone_id: int) -> None:
    row = conn.execute(
        "SELECT * FROM milestones WHERE id = ?",
        (milestone_id,),
    ).fetchone()
    if row is None:
        raise NotFoundError("里程碑不存在")
    with conn:
        conn.execute("DELETE FROM milestones WHERE id = ?", (milestone_id,))
        touch_idea(conn, row["idea_id"])
