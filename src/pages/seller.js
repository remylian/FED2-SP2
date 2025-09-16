// src/pages/seller.js
import { getSession } from "../utils/session.js";
import { getProfile, getProfileListings } from "../api/profile.js";
import { renderSellerHeader } from "../ui/sellerHeader.js";
import { renderMyListingsGrid } from "../ui/myListingsGrid.js";
import { handleError } from "../utils/handleError.js";

/**
 * Require auth for viewing seller profiles (Profiles v2 endpoints are authenticated).
 * Redirects to login with ?next= so we can bounce back after login.
 * @returns {boolean} true if allowed to continue
 */

function guardSellerProfile() {
  const { token, apiKey } = getSession();
  if (!token || !apiKey) {
    const next = `${location.pathname}${location.search}`;
    window.location.assign(`/login.html?next=${encodeURIComponent(next)}`);
    return false;
  }
  return true;
}

/** Read seller ?name= from the URL. */
function getSellerName() {
  const v = new URLSearchParams(window.location.search).get("name");
  return v ? v.trim() : null;
}

/** Entry: auth guard -> load seller profile -> render header -> load listings -> render grid. */
async function initSellerPage() {
  if (!guardSellerProfile()) return;

  const name = getSellerName();
  const feedback = document.getElementById("seller-feedback");

  if (!name) {
    if (feedback) {
      feedback.textContent = "Missing seller name in URL.";
      feedback.classList.add("text-red-600");
    }
    return;
  }

  // Load seller profile
  const [profile, pErr] = await handleError(getProfile(name));
  if (pErr) {
    if (feedback) {
      feedback.textContent = "Failed to load seller profile.";
      feedback.classList.add("text-red-600");
    }
    return;
  }
  renderSellerHeader(profile);

  // Load seller listings
  const [listings, lErr] = await handleError(
    getProfileListings(name, { includeBids: true, includeSeller: true })
  );
  if (lErr) {
    if (feedback) {
      feedback.textContent = "Failed to load seller’s listings.";
      feedback.classList.add("text-red-600");
    }
    renderMyListingsGrid([], { gridId: "seller-listings", emptyId: "seller-listings-empty" });
    return;
  }

  renderMyListingsGrid(listings, {
    gridId: "seller-listings",
    emptyId: "seller-listings-empty",
    showSellerLink: false, // on a seller page we usually hide the seller link on each card
  });
}

initSellerPage();
