def test_idea_crud_and_archive_flow(client):
    created = client.post(
        "/api/ideas",
        json={
            "title": "小红书起号",
            "summary": "验证内容账号的增长路径。",
            "tags": ["内容", " 内容 ", "副业"],
            "status": "头脑风暴",
        },
    )
    assert created.status_code == 201
    idea = created.json()
    assert idea["tags"] == ["内容", "副业"]
    assert idea["progress"] == 0

    filtered = client.get("/api/ideas", params={"status": "头脑风暴"})
    assert filtered.status_code == 200
    assert [item["id"] for item in filtered.json()] == [idea["id"]]

    updated = client.put(
        f"/api/ideas/{idea['id']}",
        json={"status": "进行中", "summary": "完成定位与发布闭环。"},
    )
    assert updated.status_code == 200
    assert updated.json()["status"] == "进行中"

    archived = client.post(f"/api/ideas/{idea['id']}/archive")
    assert archived.status_code == 200
    assert archived.json()["archived"] is True
    assert client.get("/api/ideas").json() == []
    assert len(client.get("/api/ideas?include_archived=true").json()) == 1

    restored = client.post(f"/api/ideas/{idea['id']}/restore")
    assert restored.status_code == 200
    assert restored.json()["archived"] is False

    deleted = client.delete(f"/api/ideas/{idea['id']}")
    assert deleted.status_code == 204
    assert client.get(f"/api/ideas/{idea['id']}").status_code == 404


def test_idea_validation_and_search(client, idea):
    response = client.post(
        "/api/ideas",
        json={"title": "   ", "tags": [], "status": "头脑风暴"},
    )
    assert response.status_code == 422

    result = client.get("/api/ideas", params={"q": "家庭"}).json()
    assert len(result) == 1
    assert result[0]["id"] == idea["id"]
