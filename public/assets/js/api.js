// Simple API client with Bearer token and JSON/Form support
const API = (() => {
  const base = ''; // same origin; prefix with /api when calling

  function authHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  function buildUrl(path, params) {
    const url = new URL(path, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, v);
      });
    }
    return url.toString();
  }

  async function handle(res) {
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const data = await res.json();
        msg = (data.mensagem || data.message || msg) + (data.detail ? `: ${data.detail}` : '');
      } catch {}
      const err = new Error(msg);
      err.status = res.status;
      throw err;
    }
    const text = await res.text();
    try { return text ? JSON.parse(text) : null; } catch { return text; }
  }

  async function getJSON(path, params) {
    const url = buildUrl(path, params);
    const res = await fetch(url, { headers: { ...authHeader() } });
    return handle(res);
  }

  async function postJSON(path, body) {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(body)
    });
    return handle(res);
  }

  async function putJSON(path, body) {
    const res = await fetch(path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(body)
    });
    return handle(res);
  }

  async function postForm(path, formData) {
    const res = await fetch(path, {
      method: 'POST',
      headers: { ...authHeader() },
      body: formData
    });
    return handle(res);
  }

  async function del(path) {
    const res = await fetch(path, {
      method: 'DELETE',
      headers: { ...authHeader() }
    });
    return handle(res);
  }

  return { getJSON, postJSON, putJSON, postForm, del };
})();
