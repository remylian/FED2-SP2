/**
 * Minimal request wrapper
 * - Attaches JWT Bearer token and X-Noroff-API-Key automatically from localStorage.
 * - Assumes JSON responses on success
 * - Throws on non-2xx with basic context.
 *
 * @param {string} url - Fully formed URL.
 * @param {RequestInit & { token?: string|null, apiKey?: string|null, data?: any }} [options]
 * @returns {Promise<any|null>} - Parsed JSON, or null for 204.
 */

export async function request(url, options = {}) {
  const {
    method = "GET",
    headers = {},
    data,            // optional body; JSON.stringified when not FormData
    token = null,
    apiKey = null,
    ...rest
  } = options;

  const finalHeaders = new Headers(headers);

  if (!finalHeaders.has("Accept")) finalHeaders.set("Accept", "application/json");
  
    // Block bodies for GET/HEAD (avoids undefined server behavior)
  const upperMethod = method.toUpperCase();
  const allowBody = !(upperMethod === "GET" || upperMethod === "HEAD");
  
  const isJsonBody = data !== undefined && !(data instanceof FormData);
  if (isJsonBody && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }

  //Attach authorization + API key
  const storedToken = localStorage.getItem("auth.token");
  const storedApiKey = localStorage.getItem("auth.apiKey");

  if (token || storedToken) {
    finalHeaders.set("Authorization", `Bearer ${token || storedToken}`);
  }

  if (apiKey || storedApiKey) {
    finalHeaders.set("X-Noroff-API-Key", apiKey || storedApiKey);
  }

  const res = await fetch(url, {
    method: upperMethod,
    headers: finalHeaders,
    ...rest,
    body: allowBody
    ? (data === undefined ? undefined : (isJsonBody ? JSON.stringify(data) : data))
    : undefined,
  });

  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} ${res.statusText}`);
    err.status = res.status;
    err.statusText = res.statusText;
    
    try { err.body = await res.json(); } catch { /* ignore non-JSON error */ }
    throw err;
  }

 // 204: No Content
  if (res.status === 204) return null;

  const ct = res.headers.get("Content-Type") || "";
  if (ct.includes("application/json")) {
    return res.json();
  }

  //For non-JSON success, return null to keep contract simple.
  return null;
}

/** Tiny convenience helpers to keep call sites clean. */

export const getJSON  = (url, opts = {}) => request(url, { ...opts, method: "GET" });

export const postJSON = (url, data, opts = {}) => request(url, { ...opts, method: "POST", data });

export const putJSON  = (url, data, opts = {}) => request(url, { ...opts, method: "PUT",  data });

export const delJSON  = (url, opts = {}) => request(url, { ...opts, method: "DELETE" });
