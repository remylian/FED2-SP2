// src/ui/myListingsGrid.js
import { createListingCard } from "./listingCard.js";

/**
 * Render a listings grid into configurable container IDs.
 * Defaults work for the Profile page; pass overrides for the Seller page.
 * @param {any[]} items
 * @param {{ gridId?: string, emptyId?: string, showSellerLink?: boolean }} [opts]
 *  - gridId: element that receives cards
 *  - emptyId: "No listings yet." element to toggle
 *  - showSellerLink: whether card should show seller link (default false)
 * @returns {void}
 */

export function renderMyListingsGrid(
  items = [],
  { gridId = "my-listings", emptyId = "my-listings-empty", showSellerLink = false } = {}
) {
  const grid = document.getElementById(gridId);
  const empty = document.getElementById(emptyId);
  if (!grid || !empty) return;

  grid.innerHTML = "";

  if (!Array.isArray(items) || items.length === 0) {
    empty.classList.remove("hidden");
    return;
  }

  empty.classList.add("hidden");
  for (const it of items) {
    grid.appendChild(createListingCard(it, { showSellerLink }));
  }
}
