// src/ui/listingCard.js
import { getSession } from "../utils/session.js";
import { normalizeMedia } from "../utils/media.js";

/**
 * Highest bid helper.
 * @param {{amount?:number}[]=} bids
 * @returns {number}
 */
function highestBid(bids = []) {
  if (!Array.isArray(bids) || bids.length === 0) return 0;
  return bids.reduce((m, b) => (Number(b?.amount) > m ? Number(b.amount) : m), 0);
}

/**
 * Build seller name markup:
 * - Logged-in users see a link to the seller page
 * - Guests see a muted label (API requires auth for profiles)
 * @param {string} sellerName
 * @returns {string}
 */
function sellerLinkHTML(sellerName) {
  if (!sellerName) return "";
  const { token, apiKey } = getSession();
  if (token && apiKey) {
    return `<a href="/seller.html?name=${encodeURIComponent(
      sellerName
    )}" class="text-sm text-blue-600 hover:underline">${sellerName}</a>`;
  }
  return `<span class="text-sm text-gray-400" title="Log in to view seller profiles">${sellerName}</span>`;
}

/**
 * Create a listing card element.
 * @param {any} item - listing object with id, title, media, endsAt, seller, bids
 * @param {{ showSellerLink?: boolean }} [opts]
 * @returns {HTMLElement}
 */
export function createListingCard(item, { showSellerLink = true } = {}) {
  const id = item?.id;
  const title = item?.title || "Untitled";
  const sellerName = item?.seller?.name || "";
  const img = normalizeMedia(item?.media)[0] || { url: "", alt: "" };
  const highest = highestBid(item?.bids);
  const endsAt = item?.endsAt; // ISO string (optional)

  const card = document.createElement("article");
  card.className =
    "rounded-xl border overflow-hidden bg-white shadow-sm hover:shadow transition";

  // image
  const imgHTML = img.url
    ? `<img src="${img.url}" alt="${img.alt || ""}" class="h-44 w-full object-cover" />`
    : `<div class="h-44 w-full bg-gray-200"></div>`;

  // meta
  const sellerHTML = showSellerLink ? sellerLinkHTML(sellerName) : "";
  const highestHTML = `<span class="text-sm text-gray-700">Highest: <strong>${highest}</strong></span>`;
  const endsHTML = endsAt
    ? `<span class="countdown-pill inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-gray-100 text-gray-700">
         <span data-countdown data-ends="${endsAt}"></span>
       </span>`
    : "";

  card.innerHTML = `
    <a href="/listing.html?id=${encodeURIComponent(id)}" class="block">
      ${imgHTML}
      <div class="p-3">
        <h3 class="font-medium line-clamp-1">${title}</h3>
        <div class="mt-1 flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            ${highestHTML}
            ${endsHTML}
          </div>
          ${sellerHTML}
        </div>
      </div>
    </a>
  `;

  return card;
}
