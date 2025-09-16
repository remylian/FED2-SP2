
import { fmtDate } from "../utils/dates.js";

/**
 * Safely resolve a bidder's display name from common API shapes.
 * Primary shape (with `_bids=true` on listing fetch): b.bidder.name
 * @param {any} b - bid item from the API
 * @returns {string}
 */

function getBidderName(b) {
  if (b?.bidder && typeof b.bidder === "object" && b.bidder.name) return b.bidder.name; // primary
  if (typeof b?.bidder === "string") return b.bidder;           // rare fallback
  if (b?.bidderName) return b.bidderName;                       // older/alt shape
  if (b?.user?.name) return b.user.name;                        // defensive
  if (b?.name) return b.name;                                   // defensive
  return "Anonymous";
}

/**
 * Render bid history list (newest -> oldest).
 * Expects #bid-history (UL/OL/div) and #bid-history-empty elements in the DOM.
 * @param {Array<{amount?:number, created?:string, bidder?:any}>} bids
 * @returns {void}
 */

export function renderBidHistory(bids = []) {
  const list = document.getElementById("bid-history");
  const empty = document.getElementById("bid-history-empty");
  if (!list || !empty) return;

  list.innerHTML = "";
  if (!Array.isArray(bids) || bids.length === 0) {
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  // Newest first
  const sorted = [...bids].sort((a, b) => new Date(b.created) - new Date(a.created));

  for (const b of sorted) {
    const who = getBidderName(b);
    const when = fmtDate(b?.created);
    const amount = Number(b?.amount ?? 0);

    const row = document.createElement("li");
    row.className = "rounded-lg border px-3 py-2 text-sm";
    // textContent to avoid html injection issues
    row.textContent = `${who} bid ${amount} • ${when}`;
    list.appendChild(row);
  }
}
