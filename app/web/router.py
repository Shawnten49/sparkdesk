from fastapi import APIRouter, Request
from fastapi.responses import FileResponse


router = APIRouter(tags=["web"])


@router.get("/", include_in_schema=False)
def index(request: Request) -> FileResponse:
    settings = request.app.state.settings
    return FileResponse(
        settings.web_root / "index.html",
        media_type="text/html",
    )


@router.get("/api/health")
def health() -> dict:
    return {"status": "ok"}
