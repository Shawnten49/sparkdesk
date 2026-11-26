from __future__ import annotations

import threading
import webbrowser
from contextlib import asynccontextmanager
from typing import Optional

import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import Settings, load_settings
from app.db.migrations import init_database
from app.ideas.router import router as ideas_router
from app.milestones.router import router as milestones_router
from app.notes.router import router as notes_router
from app.shared.errors import (
    InvalidOperationError,
    NotFoundError,
    ValidationError,
)
from app.web.router import router as web_router


def create_app(settings: Optional[Settings] = None) -> FastAPI:
    app_settings = settings or load_settings()

    @asynccontextmanager
    async def lifespan(_: FastAPI):
        app_settings.uploads_dir.mkdir(parents=True, exist_ok=True)
        init_database(app_settings.database_path)
        yield

    application = FastAPI(
        title="Sparkdesk · 个人灵感与项目孵化管理",
        description="本地运行的灵感、笔记与里程碑管理 API。",
        version="1.0.0",
        lifespan=lifespan,
    )
    application.state.settings = app_settings

    @application.exception_handler(NotFoundError)
    async def handle_not_found(
        _: Request,
        exc: NotFoundError,
    ) -> JSONResponse:
        return JSONResponse(status_code=404, content={"detail": str(exc)})

    @application.exception_handler(ValidationError)
    async def handle_validation(
        _: Request,
        exc: ValidationError,
    ) -> JSONResponse:
        return JSONResponse(status_code=422, content={"detail": str(exc)})

    @application.exception_handler(InvalidOperationError)
    async def handle_invalid_operation(
        _: Request,
        exc: InvalidOperationError,
    ) -> JSONResponse:
        return JSONResponse(status_code=400, content={"detail": str(exc)})

    application.include_router(web_router)
    application.include_router(ideas_router)
    application.include_router(notes_router)
    application.include_router(milestones_router)
    application.mount(
        "/static",
        StaticFiles(directory=str(app_settings.web_root / "static")),
        name="static",
    )
    return application


app = create_app()


def run() -> None:
    settings = app.state.settings
    browser_host = "127.0.0.1" if settings.host in {"0.0.0.0", "::"} else settings.host
    local_url = f"http://{browser_host}:{settings.port}"
    if settings.open_browser:
        timer = threading.Timer(1.0, lambda: webbrowser.open(local_url))
        timer.daemon = True
        timer.start()

    print(f"\n✦ Sparkdesk 已启动：{local_url}")
    print(f"  API 文档：{local_url}/docs")
    print("  按 Ctrl+C 停止服务\n")
    uvicorn.run(app, host=settings.host, port=settings.port, log_level="info")
