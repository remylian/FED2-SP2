
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
 * @param {any} item
 * @returns {{ id:string, highest:number, sellerName:string, ended:boolean }}
 */

export function renderListingMeta(item) {
  const { id, title, description, endsAt, seller, bids } = item || {};
  const highest = highestBid(bids);
  const sellerName = seller?.name ?? "";
  const ended = !!endsAt && new Date(endsAt).getTime() <= Date.now();

  const titleEl = document.getElementById("listing-title");
  const subtitleEl = document.getElementById("listing-subtitle");
  if (titleEl) titleEl.textContent = title || "Untitled";
  if (subtitleEl) {
    subtitleEl.textContent = `Seller: ${sellerName || "unknown"} • Highest bid: ${highest} • Ends: ${fmtDate(endsAt)}`;
  }

  const highestEl = document.getElementById("listing-highest");
  const endsEl = document.getElementById("listing-ends");
  const sellerEl = document.getElementById("listing-seller");
  if (highestEl) highestEl.textContent = String(highest);
  if (endsEl) endsEl.textContent = fmtDate(endsAt);
  if (sellerEl) {
    sellerEl.innerHTML = sellerName
      ? `<a href="/seller.html?name=${encodeURIComponent(sellerName)}" class="text-blue-600 hover:underline">${sellerName}</a>`
      : "—";
  }

  const descEl = document.getElementById("listing-description");
  if (descEl) descEl.textContent = description || "No description.";

  return { id, highest, sellerName, ended };
}
