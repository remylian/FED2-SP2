import { getSession, clearSession } from "../utils/session.js";

/**
 * Initialize the shared header UI:
 * - Shows credits when logged in
 * - Replaces "Log in" link with "Profile" + adds a "Log out" link
 * - Restores "Log in" when logged out
 *
 * @returns {void}
 */

export function initHeader() {
  const { user } = getSession();

  const creditsBadge = document.getElementById("user-credits-badge");
  const authLinks = document.getElementById("auth-links");
  const container = authLinks?.parentElement; // wrapper <div>

  if (!creditsBadge || !authLinks || !container) return;

  /**
   * Ensure we have a logout link element appended after the auth link.
   * @returns {HTMLAnchorElement} - the logout link element
   */

  const ensureLogoutLink = () => {
    let logout = document.getElementById("logout-link");
    if (!logout) {
      logout = document.createElement("a");
      logout.id = "logout-link";
      logout.className = "text-sm text-gray-600 hover:underline";
      container.appendChild(logout);
    }
    return logout;
  };

  /**
   * Remove the logout link if it exists.
   * @returns {void}
   */
  
  const removeLogoutLink = () => {
    const logout = document.getElementById("logout-link");
    if (logout) logout.remove();
  };

  if (user) {
    // Show credits
    creditsBadge.textContent = `${user.credits ?? 0} credits`;
    creditsBadge.classList.remove("hidden");

    // Replace main link with "Profile"
    authLinks.textContent = "Profile";
    authLinks.href = "/profile.html";

    // Add "Log out" link
    const logout = ensureLogoutLink();
    logout.textContent = "Log out";
    logout.href = "#";
    logout.onclick = (e) => {
      e.preventDefault();
      clearSession();
      window.location.assign("/index.html");
    };
  } else {
    // Hide credits
    creditsBadge.classList.add("hidden");

    // Restore "Log in"
    authLinks.textContent = "Log in";
    authLinks.href = "/login.html";

    // Remove logout if present
    removeLogoutLink();
  }
}
