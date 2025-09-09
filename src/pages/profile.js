import { getJSON, putJSON } from "../api/client.js";
import { handleError } from "../utils/handleError.js";
import {
  PROFILE_URL,
  PROFILE_LISTINGS_URL,
  PROFILE_BIDS_URL,
} from "../config/endpoints.js";
import { getSession } from "../utils/session.js";
import { initHeader } from "../ui/header.js";

/* 
small helpers: 
*/

/**
 * Highest bid from an array of bids.
 * @param {{ amount: number }[]} bids
 * @returns {number}
 */

function getHighestBid(bids = []) {
  if (!Array.isArray(bids) || !bids.length) return 0;
  return bids.reduce((m, b) => (b?.amount > m ? b.amount : m), 0);
}

/**
 * Format a date string safely.
 * @param {string} iso
 */

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

/**
 * Format "ends in" label.
 * @param {string} iso
 */

function formatEndsIn(iso) {
  const end = new Date(iso);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  if (!iso || isNaN(end.getTime())) return "Ends unknown";
  if (diff <= 0) return "Ended";
  const mins = Math.floor(diff / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h >= 24) {
    const d = Math.floor(h / 24);
    return `in ${d}d ${h % 24}h`;
  }
  if (h > 0) return `in ${h}h ${m}m`;
  return `in ${m}m`;
}

/**
 * Minimal listing card (local renderer).
 * @param {any} item - listing from API (expects id, title, media, endsAt, bids, seller)
 */

function createListingCard(item) {
  const { id, title, media = [], endsAt, bids = [], seller } = item || {};
  // media can be strings or objects; i need to handle both
  let imgUrl = "", imgAlt = "";
  if (Array.isArray(media) && media.length) {
    const m = media[0];
    imgUrl = typeof m === "string" ? m : (m?.url || "");
    imgAlt = typeof m === "object" ? (m?.alt || "") : "";
  }
  const highest = getHighestBid(bids);
  const sellerName = seller?.name || "unknown";

  const a = document.createElement("a");
  a.href = `/listing.html?id=${encodeURIComponent(id)}`;
  a.className = "group block overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow";

  a.innerHTML = `
    <div class="aspect-[16/10] w-full bg-gray-200 overflow-hidden">
      ${
        imgUrl
          ? `<img src="${imgUrl}" alt="${imgAlt}" class="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]" />`
          : `<div class="h-full w-full grid place-items-center text-gray-500 text-sm">No image</div>`
      }
    </div>
    <div class="p-4">
      <h4 class="mb-1 line-clamp-1 text-base font-semibold">${title ?? "Untitled"}</h4>
      <div class="mb-2 flex items-center justify-between text-sm text-gray-600">
        <span>Highest bid: <span class="font-medium text-gray-900">${highest}</span></span>
        <span>${formatEndsIn(endsAt)}</span>
      </div>
      <div class="text-xs text-gray-500">Seller: ${sellerName}</div>
    </div>
  `;
  return a;
}

/*
Load and render Profile
*/

/**
 * Load profile from API and render header & form.
 * Also sync localStorage for credits/avatar etc., then refresh header badge.
 */

async function loadProfile() {
  const { user } = getSession();
  if (!user?.name) return null;

  // include listings/wins/bids only if you want expansions here; we’ll fetch lists separately
  const url = PROFILE_URL(user.name);
  const [resp, err] = await handleError(getJSON(url));
  if (err) {
    console.error("Failed to load profile:", err);
    document.getElementById("profile-name").textContent = "Failed to load profile";
    return null;
  }

  const p = resp?.data || resp;
  // Normalize avatar/banner (v2 may use objects)
  const avatarUrl = typeof p?.avatar === "string" ? p.avatar : (p?.avatar?.url || "");
  const bannerUrl = typeof p?.banner === "string" ? p.banner : (p?.banner?.url || "");
  const bio = p?.bio || "";

  // Header fields
  document.getElementById("profile-name").textContent = p?.name ?? "User";
  document.getElementById("profile-email").textContent = p?.email ?? "—";
  document.getElementById("profile-avatar").src = avatarUrl || "";
  document.getElementById("profile-banner").style.backgroundImage = bannerUrl ? `url("${bannerUrl}")` : "";
  document.getElementById("profile-credits").textContent = `${p?.credits ?? 0} credits`;

  // Form fields
  document.getElementById("profile-bio").value = bio;
  document.getElementById("profile-avatar-url").value = avatarUrl;
  document.getElementById("profile-banner-url").value = bannerUrl;

  // Sync session (credits/avatar may have changed since login)
  try {
    const stored = JSON.parse(localStorage.getItem("auth.user") || "{}");
    stored.credits = Number(p?.credits ?? stored.credits ?? 0);
    stored.avatar = p?.avatar ?? stored.avatar ?? null;
    localStorage.setItem("auth.user", JSON.stringify(stored));
  } catch { /* ignore */ }

  // Refresh header badge
  initHeader();

  return p;
}

    /*
    Profile: save updates (bio, avatar url, banner url)
    */

function setFormLoading(isLoading) {
  const btn = document.getElementById("profile-save");
  const spin = document.getElementById("profile-spinner");
  if (btn) btn.disabled = !!isLoading;
  if (spin) spin.classList.toggle("hidden", !isLoading);
}

function setFormFeedback(msg, type = "error") {
  const el = document.getElementById("profile-feedback");
  if (!el) return;
  el.textContent = msg || "";
  el.classList.toggle("text-red-600", type === "error");
  el.classList.toggle("text-emerald-600", type === "success");
}

function wireProfileForm() {
  const form = document.getElementById("profile-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setFormFeedback("");
    setFormLoading(true);

    const { user } = getSession();
    if (!user?.name) {
      setFormFeedback("You must be logged in.");
      setFormLoading(false);
      return;
    }

    const fd = new FormData(form);
    const bio = String(fd.get("bio") || "");
    const avatar = String(fd.get("avatar") || "");
    const banner = String(fd.get("banner") || "");

    // v2 expects objects for avatar/banner (url/alt). Keep it minimal with url only.
    const payload = {
      bio,
      avatar: avatar ? { url: avatar } : null,
      banner: banner ? { url: banner } : null,
    };

    const [resp, err] = await handleError(putJSON(PROFILE_URL(user.name), payload));
    if (err) {
      const msg = err.body?.errors?.[0]?.message || err.body?.message || err.message;
      setFormFeedback(msg || "Failed to save profile.");
      setFormLoading(false);
      return;
    }

    // Update header and local session from fresh server data
    const p = resp?.data || resp;
    try {
      const stored = JSON.parse(localStorage.getItem("auth.user") || "{}");
      stored.avatar = p?.avatar ?? stored.avatar ?? null;
      localStorage.setItem("auth.user", JSON.stringify(stored));
    } catch { /* ignore */ }

    // Update UI (header/avatar/banner/bio)
    document.getElementById("profile-bio").value = p?.bio || bio;
    document.getElementById("profile-avatar").src =
      (typeof p?.avatar === "string" ? p.avatar : p?.avatar?.url) || avatar || "";
    document.getElementById("profile-banner").style.backgroundImage =
      (typeof p?.banner === "string" ? `url("${p.banner}")` : (p?.banner?.url ? `url("${p.banner.url}")` : "")) || (banner ? `url("${banner}")` : "");

    initHeader(); // in case avatar/credits etc. impact header later
    setFormFeedback("Profile updated.", "success");
    setFormLoading(false);
  });
}

/* 
My Listings
*/

function renderMyListings(items = []) {
  const wrap = document.getElementById("my-listings");
  const empty = document.getElementById("my-listings-empty");
  if (!wrap || !empty) return;

  wrap.innerHTML = "";
  if (!Array.isArray(items) || items.length === 0) {
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");
  for (const it of items) wrap.appendChild(createListingCard(it));
}

async function loadMyListings(name) {
  // include bids & seller so cards show data cleanly.
  const url = PROFILE_LISTINGS_URL(name) + "?_bids=true&_seller=true&limit=12&page=1";
  const [resp, err] = await handleError(getJSON(url));
  if (err) {
    console.warn("Failed to load my listings:", err);
    renderMyListings([]);
    return;
  }
  renderMyListings(resp?.data || []);
}

/*
 My Bids
 */

function renderMyBids(items = []) {
  const wrap = document.getElementById("my-bids");
  const empty = document.getElementById("my-bids-empty");
  if (!wrap || !empty) return;

  wrap.innerHTML = "";
  if (!Array.isArray(items) || items.length === 0) {
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  // Most recent first
  const sorted = [...items].sort((a, b) => new Date(b.created) - new Date(a.created));
  for (const b of sorted) {
    const li = document.createElement("div");
    li.className = "rounded-lg border px-3 py-2 text-sm";
    const amount = Number(b?.amount ?? 0);
    const when = fmtDate(b?.created);
    const listingId = b?.listingId || b?.listing?.id || "";
    const title = b?.listing?.title || `Listing ${listingId.slice(0, 6)}`;
    const href = listingId ? `/listing.html?id=${encodeURIComponent(listingId)}` : "#";

    li.innerHTML = `
      <div class="flex items-center justify-between">
        <a href="${href}" class="font-medium text-blue-600 hover:underline line-clamp-1">${title}</a>
        <span class="text-gray-700">${amount}</span>
      </div>
      <div class="text-xs text-gray-500">${when}</div>
    `;
    wrap.appendChild(li);
  }
}

async function loadMyBids(name) {
  // Depending on API, bids may or may not include listing details.
  // Fetch first page; expand with listing data later if needed.
  const url = PROFILE_BIDS_URL(name) + "?limit=20&page=1";
  const [resp, err] = await handleError(getJSON(url));
  if (err) {
    console.warn("Failed to load my bids:", err);
    renderMyBids([]);
    return;
  }
  renderMyBids(resp?.data || []);
}

/*
Entry Point
*/

async function initProfilePage() {
  const { user } = getSession();
  if (!user?.name) {
    // Guard: not logged in -> back to login
    window.location.assign("/login.html");
    return;
  }

  // Load + render profile, then wire form & lists
  await loadProfile();
  wireProfileForm();
  await Promise.all([loadMyListings(user.name), loadMyBids(user.name)]);
}

initProfilePage();
