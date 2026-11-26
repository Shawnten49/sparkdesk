from __future__ import annotations

from pathlib import Path
from typing import List, Tuple

from app.db.connection import connect


MIGRATIONS: List[Tuple[int, str]] = [
    (1, "001_initial.sql"),
]
MIGRATIONS_DIR = Path(__file__).resolve().parent / "migrations"


def init_database(database_path: Path) -> None:
    conn = connect(database_path)
    try:
        conn.execute("PRAGMA journal_mode = WAL")
        current_version = int(conn.execute("PRAGMA user_version").fetchone()[0])
        for version, filename in MIGRATIONS:
            if version <= current_version:
                continue
            sql = (MIGRATIONS_DIR / filename).read_text(encoding="utf-8")
            conn.executescript(sql)
            conn.execute(f"PRAGMA user_version = {version}")
            conn.commit()
    finally:
        conn.close()
