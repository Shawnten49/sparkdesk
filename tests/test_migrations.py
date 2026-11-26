import sqlite3

from app.db.migrations import init_database


def test_database_is_created_and_migration_is_idempotent(tmp_path):
    database = tmp_path / "migration-test.db"
    init_database(database)
    init_database(database)

    conn = sqlite3.connect(database)
    try:
        tables = {
            row[0]
            for row in conn.execute(
                """
                SELECT name FROM sqlite_master
                WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
                """
            )
        }
        version = conn.execute("PRAGMA user_version").fetchone()[0]
    finally:
        conn.close()

    assert tables == {"ideas", "notes", "milestones"}
    assert version == 1
