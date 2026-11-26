def test_notes_crud_and_timeline_order(client, idea):
    first = client.post(
        f"/api/ideas/{idea['id']}/notes",
        json={"kind": "text", "content": "### 第一版思路"},
    )
    second = client.post(
        f"/api/ideas/{idea['id']}/notes",
        json={"kind": "revision", "content": "收窄目标人群。"},
    )
    assert first.status_code == second.status_code == 201

    notes = client.get(f"/api/ideas/{idea['id']}/notes").json()
    assert [note["id"] for note in notes] == [
        second.json()["id"],
        first.json()["id"],
    ]

    note_id = first.json()["id"]
    updated = client.put(
        f"/api/notes/{note_id}",
        json={"kind": "link", "content": "https://example.com/reference"},
    )
    assert updated.status_code == 200
    assert updated.json()["kind"] == "link"

    deleted = client.delete(f"/api/notes/{note_id}")
    assert deleted.status_code == 204
    assert client.get(f"/api/notes/{note_id}").status_code == 404
