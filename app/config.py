from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent.parent
WEB_ROOT = PROJECT_ROOT / "web"
DATA_ROOT = PROJECT_ROOT / "data"


def _env_bool(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() not in {"0", "false", "no", "off"}


@dataclass(frozen=True)
class Settings:
    host: str
    port: int
    open_browser: bool
    database_path: Path
    web_root: Path
    uploads_dir: Path
    max_upload_mb: int = 10


def load_settings() -> Settings:
    database_path = Path(
        os.getenv("IDEAS_DB_PATH", str(DATA_ROOT / "ideas.db"))
    ).expanduser()
    return Settings(
        host=os.getenv("APP_HOST", os.getenv("HOST", "127.0.0.1")),
        port=int(os.getenv("APP_PORT", os.getenv("PORT", "8668"))),
        open_browser=_env_bool("OPEN_BROWSER", not _env_bool("NO_BROWSER", False)),
        database_path=database_path,
        web_root=WEB_ROOT,
        uploads_dir=Path(
            os.getenv("UPLOADS_DIR", str(DATA_ROOT / "uploads"))
        ).expanduser(),
        max_upload_mb=int(os.getenv("MAX_UPLOAD_MB", "10")),
    )
