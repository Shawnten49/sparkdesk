def test_web_shell_and_static_modules_are_served(client):
    page = client.get("/")
    assert page.status_code == 200
    assert 'type="module" src="/static/js/app.js"' in page.text

    assert client.get("/static/css/app.css").status_code == 200
    assert client.get("/static/js/app.js").status_code == 200
    assert client.get("/api/health").json() == {"status": "ok"}
