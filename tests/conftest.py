from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.config import WEB_ROOT, Settings
from app.main import create_app


@pytest.fixture()
def app(tmp_path: Path):
    settings = Settings(
        host="127.0.0.1",
        port=8668,
        open_browser=False,
        database_path=tmp_path / "ideas.db",
        web_root=WEB_ROOT,
        uploads_dir=tmp_path / "uploads",
    )
    return create_app(settings)


@pytest.fixture()
def client(app):
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture()
def idea(client):
    response = client.post(
        "/api/ideas",
        json={
            "title": "局域网视频网站",
            "summary": "把家庭影音资料变成局域网媒体库。",
            "tags": ["开发", "家庭"],
            "status": "头脑风暴",
        },
    )
    assert response.status_code == 201
    return response.json()
