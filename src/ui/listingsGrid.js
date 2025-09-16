
import { createListingCard } from "./listingCard.js";

/**
 * Render listings grid for the home page (shows seller link).
 * @param {any[]} items
 * @param {{ gridId?:string, emptyId?:string }} [opts]
 */

export function renderListingsGrid(items = [], { gridId = "listings-grid", emptyId = "listings-empty" } = {}) {
  const grid = document.getElementById(gridId);
  const empty = document.getElementById(emptyId);
  if (!grid || !empty) return;

  grid.innerHTML = "";
  if (!Array.isArray(items) || items.length === 0) {
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");
  for (const it of items) grid.appendChild(createListingCard(it, { showSellerLink: true }));
}
