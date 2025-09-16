import { getJSON } from "../api/client.js";
import { handleError } from "./handleError.js";
import { getSession } from "./session.js";
import { PROFILE_URL } from "../config/endpoints.js";

/**
 * Fetch fresh credits from server, update localStorage, and return the value.
 * @returns {Promise<number|null>} - new credits or null on failure
 */

export async function refreshCreditsFromServer() {
  const { token, apiKey, user } = getSession();
  if (!token || !apiKey || !user?.name) return null;

  const [resp, err] = await handleError(
    getJSON(PROFILE_URL(user.name), { token, apiKey })
  );
  if (err) return null;

  const credits = Number(resp?.data?.credits ?? 0);
  try {
    const stored = JSON.parse(localStorage.getItem("auth.user") || "{}");
    stored.credits = credits;
    localStorage.setItem("auth.user", JSON.stringify(stored));
  } catch {
    /* ignore */
  }
  return credits;
}
