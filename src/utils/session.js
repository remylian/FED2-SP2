/**
 * Get the current auth session from localStorage.
 *
 * @returns {{
 *   token: string|null,
 *   apiKey: string|null,
 *   user: { name?: string, email?: string, avatar?: any, credits?: number }|null
 * }}
 */

export function getSession() {
  const token = localStorage.getItem("auth.token");
  const apiKey = localStorage.getItem("auth.apiKey");

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("auth.user"));
  } catch {
    user = null; // if JSON is missing or corrupted
  }

  return { token, apiKey, user };
}

/**
 * Clear the current session from localStorage.
 * Useful for logout flows.
 */

export function clearSession() {
  localStorage.removeItem("auth.token");
  localStorage.removeItem("auth.apiKey");
  localStorage.removeItem("auth.user");
  localStorage.removeItem("auth.timestamp");
}
