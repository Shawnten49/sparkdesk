async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    let message = `请求失败 (${response.status})`;
    try {
      const data = await response.json();
      if (typeof data.detail === "string") message = data.detail;
      if (Array.isArray(data.detail)) {
        message = data.detail.map(item => item.msg).join("；");
      }
    } catch (_) {
      // Keep the status-based fallback when the response has no JSON body.
    }
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}

function jsonBody(payload) {
  return JSON.stringify(payload);
}

export const api = {
  ideas: {
    list({ includeArchived = true } = {}) {
      const query = includeArchived ? "?include_archived=1" : "";
      return request(`/api/ideas${query}`);
    },
    get(id) {
      return request(`/api/ideas/${id}`);
    },
    create(payload) {
      return request("/api/ideas", {
        method: "POST",
        body: jsonBody(payload)
      });
    },
    update(id, payload) {
      return request(`/api/ideas/${id}`, {
        method: "PUT",
        body: jsonBody(payload)
      });
    },
    remove(id) {
      return request(`/api/ideas/${id}`, { method: "DELETE" });
    },
    archive(id) {
      return request(`/api/ideas/${id}/archive`, { method: "POST" });
    },
    restore(id) {
      return request(`/api/ideas/${id}/restore`, { method: "POST" });
    }
  },
  notes: {
    list(ideaId) {
      return request(`/api/ideas/${ideaId}/notes`);
    },
    create(ideaId, payload) {
      return request(`/api/ideas/${ideaId}/notes`, {
        method: "POST",
        body: jsonBody(payload)
      });
    },
    update(id, payload) {
      return request(`/api/notes/${id}`, {
        method: "PUT",
        body: jsonBody(payload)
      });
    },
    remove(id) {
      return request(`/api/notes/${id}`, { method: "DELETE" });
    }
  },
  milestones: {
    list(ideaId) {
      return request(`/api/ideas/${ideaId}/milestones`);
    },
    create(ideaId, payload) {
      return request(`/api/ideas/${ideaId}/milestones`, {
        method: "POST",
        body: jsonBody(payload)
      });
    },
    update(id, payload) {
      return request(`/api/milestones/${id}`, {
        method: "PUT",
        body: jsonBody(payload)
      });
    },
    remove(id) {
      return request(`/api/milestones/${id}`, { method: "DELETE" });
    }
  }
};
