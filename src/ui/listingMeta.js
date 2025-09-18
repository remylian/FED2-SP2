// src/ui/listingMeta.js
import { fmtDate } from "../utils/dates.js";

/**
 * Compute the highest bid from an array.
 * @param {{amount?:number}[]=} bids
 * @returns {number}
 */
function highestBid(bids = []) {
  if (!Array.isArray(bids) || !bids.length) return 0;
  return bids.reduce((m, b) => (Number(b?.amount) > m ? Number(b.amount) : m), 0);
}

/**
 * Render listing meta: title, subtitle, highest, ends, seller link, description.
 * Also injects a live countdown pill into #listing-ends (no HTML change needed).
 * @param {any} item
 * @returns {{ id:string, highest:number, sellerName:string, ended:boolean }}
 */
export function renderListingMeta(item) {
  const { id, title, description, endsAt, seller, bids } = item || {};
  const highest = highestBid(bids);
  const sellerName = seller?.name ?? "";
  const endMs = endsAt ? new Date(endsAt).getTime() : 0;
  const ended = !!endMs && endMs <= Date.now();

  // Title + subtitle
  const titleEl = document.getElementById("listing-title");
  const subtitleEl = document.getElementById("listing-subtitle");
  if (titleEl) titleEl.textContent = title || "Untitled";
  if (subtitleEl) {
    subtitleEl.textContent = `Seller: ${sellerName || "unknown"} • Highest bid: ${highest} • Ends: ${fmtDate(endsAt)}`;
  }

  // Highest / Seller
  const highestEl = document.getElementById("listing-highest");
  const sellerEl = document.getElementById("listing-seller");
  if (highestEl) highestEl.textContent = String(highest);
  if (sellerEl) {
    sellerEl.innerHTML = sellerName
      ? `<a href="/seller.html?name=${encodeURIComponent(sellerName)}" class="text-blue-600 hover:underline">${sellerName}</a>`
      : "—";
  }

  // Description
  const descEl = document.getElementById("listing-description");
  if (descEl) descEl.textContent = description || "No description.";

  // Ends: inject a countdown pill that the countdown loop can pick up
  const endsEl = document.getElementById("listing-ends");
  if (endsEl) {
    if (endsAt) {
      endsEl.innerHTML = `
        <span class="countdown-pill inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-gray-100 text-gray-700">
          <span data-countdown data-ends="${endsAt}"></span>
        </span>
      `;
    } else {
      endsEl.textContent = "—";
    }
  }

  return { id, highest, sellerName, ended };
}
