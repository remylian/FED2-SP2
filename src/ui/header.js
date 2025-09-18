// src/ui/header.js
import { getSession, clearSession } from "../utils/session.js";

/**
 * Initialize the shared header UI:
 * - Desktop: shows credits, switches "Log in" <-> "Profile", adds/removes a desktop "Log out" link.
 * - Mobile (<details> menu): mirrors auth state into #m-auth / #m-logout and handles logout.
 *
 * Safe on pages missing some header pieces; checks each element before touching it.
 * Call this on every page load and after any auth/credits change.
 *
 * @returns {void}
 */
export function initHeader() {
  const { user } = getSession();

  // --- Desktop header elements ---
  const creditsBadge = document.getElementById("user-credits-badge");
  const authLinks = document.getElementById("auth-links");
  const container = authLinks?.parentElement; // wrapper <div> that holds auth links

  // Helpers for the desktop "Log out" link (sits next to #auth-links)
  const ensureLogoutLink = () => {
    if (!container) return null;
    let logout = document.getElementById("logout-link");
    if (!logout) {
      logout = document.createElement("a");
      logout.id = "logout-link";
      logout.className = "text-sm text-gray-600 hover:underline";
      container.appendChild(logout);
    }
    return logout;
  };

  const removeLogoutLink = () => {
    const logout = document.getElementById("logout-link");
    if (logout) logout.remove();
  };

  // --- Desktop: render auth state ---
  if (user) {
    if (creditsBadge) {
      creditsBadge.textContent = `${user.credits ?? 0} credits`;
      creditsBadge.classList.remove("hidden");
    }
    if (authLinks) {
      authLinks.textContent = "Profile";
      authLinks.href = "/profile.html";
    }
    const logout = ensureLogoutLink();
    if (logout) {
      logout.textContent = "Log out";
      logout.href = "#";
      logout.onclick = (e) => {
        e.preventDefault();
        clearSession();
        window.location.assign("/index.html");
      };
    }
  } else {
    if (creditsBadge) creditsBadge.classList.add("hidden");
    if (authLinks) {
      authLinks.textContent = "Log in";
      authLinks.href = "/login.html";
    }
    removeLogoutLink();
  }

  // --- Mobile <details> menu (no JS toggle; just mirror auth + handle logout) ---
  const mAuth = document.getElementById("m-auth");     // <a> in mobile menu
  const mLogout = document.getElementById("m-logout"); // <a> in mobile menu
  
  const mDetails = document.getElementById("mobile-nav"); // <details> wrapper

  if (mAuth) {
    if (user) {
      mAuth.textContent = "Profile";
      mAuth.href = "/profile.html";
      if (mLogout) {
        mLogout.classList.remove("hidden");
        mLogout.onclick = (e) => {
          e.preventDefault();
          clearSession();
          // Close the <details> if it’s open, then navigate
          if (mDetails?.open) mDetails.open = false;
          window.location.assign("/index.html");
        };
      }
    } else {
      mAuth.textContent = "Log in";
      mAuth.href = "/login.html";
      if (mLogout) mLogout.classList.add("hidden");
    }
  }
}
