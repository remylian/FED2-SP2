import { getSession } from "../utils/session.js";
import { getProfile, getProfileListings, getProfileBids, getProfileWins } from "../api/profile.js";
import { renderProfileHeader } from "../ui/profileHeader.js";
import { renderBidsList } from "../ui/bidsList.js";
import { renderMyListingsGrid } from "../ui/myListingsGrid.js";
import { handleError } from "../utils/handleError.js";
import { initHeader } from "../ui/header.js";
import { showGridSkeleton } from "../ui/skeletons.js";

/**
 * Keep localStorage auth.user (credits/avatar) in sync with fresh profile.
 * @param {any} p
 */

function syncSessionFromProfile(p) {
  try {
    const stored = JSON.parse(localStorage.getItem("auth.user") || "{}");
    stored.credits = Number(p?.credits ?? stored.credits ?? 0);
    if (p?.avatar) stored.avatar = p.avatar;
    localStorage.setItem("auth.user", JSON.stringify(stored));
  } catch { /* ignore */ }
}

/**
 * Entry: guard -> load profile -> render header -> load listings & bids -> render lists
 * @returns {Promise<void>}
 */

async function initProfilePage() {
  const { user } = getSession();
  if (!user?.name) {
    window.location.assign("/login.html");
    return;
  }

  // Show grid skeletons immediately
  showGridSkeleton({ gridId: "my-listings", emptyId: "my-listings-empty", count: 6 });
  showGridSkeleton({ gridId: "my-wins", emptyId: "my-wins-empty", count: 6 });

  // Load profile
  const [profile, profileErr] = await handleError(getProfile(user.name));
  if (profileErr) {
    console.error("Failed to load profile:", profileErr);
    const nameEl = document.getElementById("profile-name");
    if (nameEl) nameEl.textContent = "Failed to load profile";
    return;
  }

  // Render header + sync session (updates header credits/avatar)
  renderProfileHeader(profile);
  syncSessionFromProfile(profile);
  initHeader();

  // Wins (with seller links)
  const [{ items: wins }, winsErr] = await handleError(
    getProfileWins(user.name, { page: 1, limit: 12, includeBids: true, includeSeller: true })
  );
  if (winsErr) console.warn("Failed to load wins:", winsErr);

  renderMyListingsGrid(wins || [], {
    gridId: "my-wins",
    emptyId: "my-wins-empty",
    showSellerLink: true,
  });

  // Listings & bids in parallel
  const [listings, listingsErr] = await handleError(
    getProfileListings(user.name, { includeBids: true, includeSeller: true })
  );
  const [bids, bidsErr] = await handleError(
    getProfileBids(user.name, { includeListings: true })
  );

  if (listingsErr) console.warn("Failed to load user listings:", listingsErr);
  if (bidsErr) console.warn("Failed to load user bids:", bidsErr);

  renderMyListingsGrid(Array.isArray(listings) ? listings : []);
  renderBidsList(Array.isArray(bids) ? bids : []);
}

initProfilePage();
