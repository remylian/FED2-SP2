
function createSkeletonCard() {
  const card = document.createElement("article");
  card.className = "rounded-xl border overflow-hidden bg-white shadow-sm dark:bg-gray-900 dark:border-gray-800";

  card.innerHTML = `
    <div class="h-44 w-full bg-gray-200 dark:bg-gray-800 shimmer"></div>
    <div class="p-3 space-y-2">
      <div class="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded shimmer"></div>
      <div class="mt-1 flex items-center justify-between">
        <div class="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded shimmer"></div>
        <div class="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded shimmer"></div>
      </div>
    </div>
  `;
  return card;
}

/**
 * Show N skeleton cards in a specific grid.
 * @param {{ gridId?: string, emptyId?: string, count?: number }} opts
 */
export function showGridSkeleton({ gridId = "listings-grid", emptyId = "listings-empty", count = 8 } = {}) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  const empty = emptyId ? document.getElementById(emptyId) : null;
  if (empty) empty.classList.add("hidden");

  grid.innerHTML = "";
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) frag.appendChild(createSkeletonCard());
  grid.appendChild(frag);
}

/** Try common grids and show skeletons wherever present. */
export function showAnyListingsSkeleton(count = 8) {
  const pairs = [
    ["listings-grid", "listings-empty"],             // home
    ["my-listings-grid", "my-listings-empty"],       // profile
    ["seller-listings-grid", "seller-listings-empty"]// seller
  ];
  for (const [gridId, emptyId] of pairs) {
    const grid = document.getElementById(gridId);
    if (grid) showGridSkeleton({ gridId, emptyId, count });
  }
}

/**
 * Render skeleton placeholders into the listing detail page:
 * - title, subtitle, highest, seller, ends pill, description
 * - gallery: N shimmer tiles
 * Normal renderers will overwrite these.
 * @param {{ galleryCount?: number }} [opts]
 */
export function showListingDetailSkeleton({ galleryCount = 6 } = {}) {
  // Meta placeholders
  const title = document.getElementById("listing-title");
  const subtitle = document.getElementById("listing-subtitle");
  const highest = document.getElementById("listing-highest");
  const seller = document.getElementById("listing-seller");
  const ends = document.getElementById("listing-ends");
  const desc = document.getElementById("listing-description");

  if (title) title.innerHTML = `<div class="h-5 w-2/3 bg-gray-200 dark:bg-gray-800 rounded shimmer"></div>`;
  if (subtitle) subtitle.innerHTML = `<div class="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded shimmer"></div>`;
  if (highest) highest.innerHTML = `<span class="inline-block h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded shimmer"></span>`;
  if (seller) seller.innerHTML = `<span class="inline-block h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded shimmer"></span>`;
  if (ends) {
    ends.innerHTML = `
      <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 shimmer">
        &nbsp;
      </span>
    `;
  }
  if (desc) {
    desc.innerHTML = `
      <div class="space-y-2">
        <div class="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded shimmer"></div>
        <div class="h-3 w-11/12 bg-gray-200 dark:bg-gray-800 rounded shimmer"></div>
        <div class="h-3 w-10/12 bg-gray-200 dark:bg-gray-800 rounded shimmer"></div>
      </div>
    `;
  }

  // Gallery placeholders
  const gallery =
    document.getElementById("listing-gallery") ||
    document.getElementById("gallery") ||
    document.getElementById("listing-images");

  if (gallery) {
    gallery.innerHTML = "";
    const frag = document.createDocumentFragment();
    for (let i = 0; i < galleryCount; i++) {
      const tile = document.createElement("div");
      tile.className = "aspect-square w-full bg-gray-200 dark:bg-gray-800 rounded shimmer";
      frag.appendChild(tile);
    }
    gallery.appendChild(frag);
  }
}

/**
 * Ensure a promise takes at least `ms` before resolving.
 * Great for keeping skeletons visible long enough to avoid flash.
 * @template T
 * @param {Promise<T>} promise
 * @param {number} ms
 * @returns {Promise<T>}
 */

export function withMinDelay(promise, ms = 300) {
  return Promise.all([
    promise,
    new Promise((r) => setTimeout(r, ms)),
  ]).then(([result]) => result);
}
