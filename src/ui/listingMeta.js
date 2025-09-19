
import { fmtDate } from "../utils/dates.js";

/** Safely resolve a bidder's display name from common API shapes. */
function getBidderName(b) {
  if (b?.bidder && typeof b.bidder === "object" && b.bidder.name) return b.bidder.name;
  if (typeof b?.bidder === "string") return b.bidder;
  if (b?.bidderName) return b.bidderName;
  if (b?.user?.name) return b.user.name;
  if (b?.name) return b.name;
  return "";
}

/** Find the highest bid and its bidder name. */
function topBid(bids = []) {
  if (!Array.isArray(bids) || bids.length === 0) return { amount: 0, name: "" };
  let top = { amount: 0, name: "" };
  for (const b of bids) {
    const amt = Number(b?.amount ?? 0);
    if (amt > top.amount) top = { amount: amt, name: getBidderName(b) };
  }
  return top;
}

/**
 * Render listing meta and return a meta summary for the bid form.
 * @param {any} item
 * @returns {{ id:string, highest:number, sellerName:string, ended:boolean, highestBidderName:string }}
 */

export function renderListingMeta(item) {
  const { id, title, description, endsAt, seller, bids } = item || {};
  const sellerName = seller?.name ?? "";
  const { amount: highest, name: highestBidderNameRaw } = topBid(bids);
  const highestBidderName = String(highestBidderNameRaw || "");
  const endMs = endsAt ? new Date(endsAt).getTime() : 0;
  const ended = !!endMs && endMs <= Date.now();

  // Title + subtitle
  const titleEl = document.getElementById("listing-title");
  const subtitleEl = document.getElementById("listing-subtitle");
  if (titleEl) titleEl.textContent = title || "Untitled";
  if (subtitleEl) {
    const endsTxt = endsAt ? fmtDate(endsAt) : "—";
    subtitleEl.textContent = `Seller: ${sellerName || "unknown"} • Highest bid: ${highest} • Ends: ${endsTxt}`;
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

  // Ends: live countdown pill (consumed by the global loop)
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

  // Description
  const descEl = document.getElementById("listing-description");
  if (descEl) descEl.textContent = description || "No description.";

  return { id, highest, sellerName, ended, highestBidderName };
}
