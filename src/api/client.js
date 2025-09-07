/**
 * Minimal request wrapper
 * - Assumes JSON responses on success
 * - Throws on non-2xx with basic context.
 *
 * @param {string} url - Fully formed URL.
 * @param {RequestInit & { token?: string|null, data?: any }} [options]
 * @returns {Promise<any|null>} - Parsed JSON, or null for 204.
 */

export async function request(url, options = {}) {
  const {
    method = "GET",
    headers = {},
    data,            // optional body; JSON.stringified when not FormData
    token = null,
    ...rest
  } = options;

  const finalHeaders = new Headers(headers);
  if (!finalHeaders.has("Accept")) finalHeaders.set("Accept", "application/json");
  const isJsonBody = data !== undefined && !(data instanceof FormData);
  if (isJsonBody && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }
  if (token) finalHeaders.set("Authorization", `Bearer ${token}`);

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: data === undefined ? undefined : (isJsonBody ? JSON.stringify(data) : data),
    ...rest,
  });

  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} ${res.statusText}`);
    err.status = res.status;
    err.statusText = res.statusText;
    
    try { err.body = await res.json(); } catch { /* ignore */ }
    throw err;
  }

  return res.status === 204 ? null : res.json();
}

/** Tiny convenience helpers to keep call sites clean. */

export const getJSON  = (url, opts = {}) => request(url, { ...opts, method: "GET" });

export const postJSON = (url, data, opts = {}) => request(url, { ...opts, method: "POST", data });

export const putJSON  = (url, data, opts = {}) => request(url, { ...opts, method: "PUT",  data });

export const delJSON  = (url, opts = {}) => request(url, { ...opts, method: "DELETE" });
