def test_milestones_and_progress(client, idea):
    first = client.post(
        f"/api/ideas/{idea['id']}/milestones",
        json={
            "name": "完成定位",
            "due_date": "2026-12-01",
            "completed": False,
        },
    )
    second = client.post(
        f"/api/ideas/{idea['id']}/milestones",
        json={"name": "完成首轮复盘", "completed": False},
    )
    assert first.status_code == second.status_code == 201

    client.put(
        f"/api/milestones/{first.json()['id']}",
        json={"completed": True},
    )
    overview = client.get(f"/api/ideas/{idea['id']}").json()
    assert overview["milestone_count"] == 2
    assert overview["completed_milestones"] == 1
    assert overview["progress"] == 50

    deleted = client.delete(f"/api/milestones/{second.json()['id']}")
    assert deleted.status_code == 204
    assert client.get(f"/api/milestones/{second.json()['id']}").status_code == 404


def test_deleting_idea_cascades_children(client, idea):
    client.post(
        f"/api/ideas/{idea['id']}/notes",
        json={"kind": "text", "content": "会随灵感一起删除"},
    )
    milestone = client.post(
        f"/api/ideas/{idea['id']}/milestones",
        json={"name": "会随灵感一起删除"},
    ).json()

    assert client.delete(f"/api/ideas/{idea['id']}").status_code == 204
    assert client.get(f"/api/milestones/{milestone['id']}").status_code == 404
