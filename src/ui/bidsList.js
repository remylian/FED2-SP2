import { fmtDate } from "../utils/dates.js";

/**
 * Extract the associated listing object (API may embed under `listing` or `listings[0]`).
 * @param {any} b
 * @returns {any|null}
 */

function getEmbeddedListing(b) {
  if (b?.listing && typeof b.listing === "object") return b.listing;
  if (Array.isArray(b?.listings) && b.listings.length) return b.listings[0];
  return null;
}

/**
 * Extract a listing id from a bid, regardless of shape.
 * Handles: listing.id, listingId, listing (string/number), listings[0].id
 * @param {any} b
 * @returns {string}
 */

function extractListingIdFromBid(b) {
  const L = getEmbeddedListing(b);
  if (L?.id != null) return String(L.id);

  if (typeof b?.listing === "string" || typeof b?.listing === "number") {
    return String(b.listing);
  }
  return String(b?.listingId ?? b?.listing_id ?? "");
}

/**
 * Render "My Bids" list with working links when an id is present.
 * @param {any[]} items
 * @returns {void}
 */

export function renderBidsList(items = []) {
  const wrap = document.getElementById("my-bids");
  const empty = document.getElementById("my-bids-empty");
  if (!wrap || !empty) return;

  wrap.innerHTML = "";
  if (!Array.isArray(items) || items.length === 0) {
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  const sorted = [...items].sort((a, b) => new Date(b.created) - new Date(a.created));

  for (const b of sorted) {
    const amount = Number(b?.amount ?? 0);
    const when = fmtDate(b?.created);

    const L = getEmbeddedListing(b);
    const listingId = extractListingIdFromBid(b);
    const label = L?.title || "Listing";
    const href = listingId ? `/listing.html?id=${encodeURIComponent(listingId)}` : "#";

    const row = document.createElement("div");
    row.className = "rounded-lg border px-3 py-2 text-sm";
    row.innerHTML = `
      <div class="flex items-center justify-between">
        <a href="${href}" class="font-medium ${listingId ? "text-blue-600 hover:underline" : "text-gray-400 cursor-not-allowed"} line-clamp-1">
          ${label}
        </a>
        <span class="text-gray-700">${amount}</span>
      </div>
      <div class="text-xs text-gray-500">${when}</div>
    `;

    wrap.appendChild(row);
  }
}
