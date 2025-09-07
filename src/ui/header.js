import { getSession, clearSession } from "../utils/session.js";

/**
 * Initialize the shared header UI:
 * - Show credits when logged in.
 * - Update login/logout links.
 */
export function initHeader() {
  const { user } = getSession();

  const creditsBadge = document.getElementById("user-credits-badge");
  const authLinks = document.getElementById("auth-links");

  if (!creditsBadge || !authLinks) return;

  if (user) {
    // Show credits
    creditsBadge.textContent = `${user.credits ?? 0} credits`;
    creditsBadge.classList.remove("hidden");

    // Turn auth link into logout
    authLinks.textContent = "Log out";
    authLinks.href = "#";
    authLinks.addEventListener("click", (e) => {
      e.preventDefault();
      clearSession();
      window.location.assign("/index.html");
    });
  } else {
    // Hide credits
    creditsBadge.classList.add("hidden");

    // Link back to login
    authLinks.textContent = "Log in";
    authLinks.href = "/login.html";
  }
}
