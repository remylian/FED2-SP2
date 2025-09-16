
/**
 * Get the current session from localStorage.
 * @returns {{ token?:string, apiKey?:string, user?:{name:string,email?:string,avatar?:any,credits?:number} }} 
 */

export function getSession() {
  const token = localStorage.getItem("auth.token") || "";
  const apiKey = localStorage.getItem("auth.apiKey") || "";
  let user = null;
  try { user = JSON.parse(localStorage.getItem("auth.user") || "null"); } catch {}
  return { token, apiKey, user };
}

/** Clear session and related data. */
export function clearSession() {
  localStorage.removeItem("auth.token");
  localStorage.removeItem("auth.apiKey");
  localStorage.removeItem("auth.user");
  localStorage.removeItem("auth.timestamp");
}

/**
 * Save/overwrite the session atomically.
 * @param {{ accessToken:string, name:string, email?:string, avatar?:any, credits?:number, apiKey?:string }} payload
 */

export function saveSession(payload) {
  const { accessToken, name, email = "", avatar = null, credits = 0, apiKey = "" } = payload;
  localStorage.setItem("auth.token", accessToken);
  if (apiKey) localStorage.setItem("auth.apiKey", apiKey);
  localStorage.setItem("auth.user", JSON.stringify({ name, email, avatar, credits }));
  localStorage.setItem("auth.timestamp", new Date().toISOString());
}
