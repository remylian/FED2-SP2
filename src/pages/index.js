import { getJSON } from "../api/client.js";
import { handleError } from "../utils/handleError.js";
import { LISTINGS_URL } from "../config/endpoints.js";
import { getFirstImage } from "../utils/media.js";

/**
 * Read state from current URL (q, sort, page) with defaults.
 * @returns {{ q: string, sort: "endsAt"|"created"|"title", page: number }}
 */

function readStateFromURL() {
  const sp = new URLSearchParams(window.location.search);
  const q = sp.get("q")?.trim() || "";
  const sort = (sp.get("sort") || "endsAt");
  const page = Math.max(1, Number(sp.get("page") || 1));
  return { q, sort, page };
}

/**
 * Replace current URL query parameters without reloading.
 * @param {{ q?: string, sort?: string, page?: number }} patch
 */

function updateURL(patch) {
  const sp = new URLSearchParams(window.location.search);
  if (patch.q !== undefined) sp.set("q", patch.q);
  if (patch.sort !== undefined) sp.set("sort", patch.sort);
  if (patch.page !== undefined) sp.set("page", String(patch.page));
  // Clean empty q
  if (!sp.get("q")) sp.delete("q");
  history.replaceState(null, "", `?${sp.toString()}`);
}

/**
 * Build listings URL with query params.
 * @param {{ q: string, sort: string, page: number, limit?: number }} state
 * @returns {string}
 */

function buildListingsURL({ q, sort, page, limit = 12 }) {
  const sp = new URLSearchParams();
  sp.set("_active", "true");
  sp.set("_bids", "true");
  sp.set("_seller", "true");
  sp.set("limit", String(limit));
  sp.set("page", String(page));
  if (q) sp.set("q", q);
  if (sort) {
    sp.set("sort", sort);
    // Reasonable default orders
    sp.set("sortOrder", sort === "title" ? "asc" : "asc");
  }
  return `${LISTINGS_URL}?${sp.toString()}`;
}

/**
 * Return the highest bid amount or 0 if none.
 * @param {{ amount: number }[]} bids
 * @returns {number}
 */

function getHighestBid(bids = []) {
  if (!Array.isArray(bids) || bids.length === 0) return 0;
  return bids.reduce((m, b) => (b?.amount > m ? b.amount : m), 0);
}

/**
 * Format a remaining time label like "in 3h 12m" or "Ended".
 * @param {string} iso - endsAt
 * @returns {string}
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
 * Create a clickable card element for a listing.
 * - Displays image (or placeholder), title, highest bid, time remaining, and seller.
 * - Uses safe DOM APIs (`textContent`, `setAttribute`) to insert dynamic content.
 * - Returns an <a> element linking to the listing detail page.
 *
 * @param {object} item - Listing data object from the API.
 * @param {string} item.id - Unique identifier for the listing.
 * @param {string} [item.title] - Title of the listing.
 * @param {Array<{url: string, alt?: string}>} [item.media] - Media array for images.
 * @param {string} [item.endsAt] - End date/time in ISO format.
 * @param {Array<{amount: number}>} [item.bids] - Array of bid objects.
 * @param {{ name?: string }} [item.seller] - Seller information.
 * @returns {HTMLAnchorElement} - Fully constructed card element.
 */


function createListingCard(item) {
  const { id, title, media = [], endsAt, bids = [], seller } = item || {};
  const { url: imgUrl, alt: imgAlt } = getFirstImage(media);
  const highest = getHighestBid(bids);
  const safeTitle = title ?? "Untitled";
  const sellerName = seller?.name || "Unknown";
  const endsLabel = endsAt ? formatEndsIn(endsAt) : "Ends: N/A";
  const href = id ? `/listing.html?id=${encodeURIComponent(id)}` : "#";

  const a = document.createElement("a");
  a.href = href;
  a.className = "group block overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow";

  // Image wrapper
  const imgWrap = document.createElement("div");
  imgWrap.className = "aspect-[16/10] w-full bg-gray-200 overflow-hidden";

  if (imgUrl) {
    const img = document.createElement("img");
    img.className = "h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]";
    img.src = imgUrl;
    img.alt = imgAlt || "";
    imgWrap.appendChild(img);
  } else {
    const ph = document.createElement("div");
    ph.className = "h-full w-full grid place-items-center text-gray-500 text-sm";
    ph.textContent = "No image";
    imgWrap.appendChild(ph);
  }

  // Content
  const content = document.createElement("div");
  content.className = "p-4";

  const h3 = document.createElement("h3");
  h3.className = "mb-1 line-clamp-1 text-base font-semibold";
  h3.textContent = safeTitle;

  const infoRow = document.createElement("div");
  infoRow.className = "mb-2 flex items-center justify-between text-sm text-gray-600";

  const bidSpan = document.createElement("span");
  bidSpan.innerHTML = `Highest bid: <span class="font-medium text-gray-900"></span>`;
  bidSpan.querySelector("span").textContent = String(highest);

  const endsSpan = document.createElement("span");
  endsSpan.textContent = endsLabel;

  infoRow.append(bidSpan, endsSpan);

  const sellerDiv = document.createElement("div");
  sellerDiv.className = "text-xs text-gray-500";
  sellerDiv.textContent = `Seller: ${sellerName}`;

  content.append(h3, infoRow, sellerDiv);
  a.append(imgWrap, content);
  return a;
}


/**
 * Render listings into the grid and toggle empty state.
 * @param {any[]} items
 */

function renderListings(items = []) {
  const grid = document.getElementById("listings-grid");
  const empty = document.getElementById("listings-empty");
  if (!grid || !empty) return;

  grid.innerHTML = "";
  if (!Array.isArray(items) || items.length === 0) {
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");
  for (const it of items) {
    grid.appendChild(createListingCard(it));
  }
}

/**
 * Render simple Prev/Next pagination buttons.
 * @param {{ page: number, total: number, limit: number }} meta
 */

function renderPagination({ page, total, limit }) {
  const nav = document.getElementById("pagination");
  if (!nav) return;
  nav.innerHTML = "";

  const totalPages = Math.max(1, Math.ceil((Number(total) || 0) / (Number(limit) || 12)));
  const makeBtn = (label, disabled, nextPage) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.disabled = disabled;
    b.className = `rounded-lg border px-3 py-1 text-sm ${disabled ? "opacity-50" : "hover:bg-gray-100"}`;
    if (!disabled) {
      b.addEventListener("click", () => {
        updateURL({ page: nextPage });
        loadAndRender(); // reload with new page
      });
    }
    return b;
  };

  nav.appendChild(makeBtn("Prev", page <= 1, page - 1));
  const pageInfo = document.createElement("span");
  pageInfo.className = "px-2 py-1 text-sm text-gray-600";
  pageInfo.textContent = `Page ${page} of ${totalPages}`;
  nav.appendChild(pageInfo);
  nav.appendChild(makeBtn("Next", page >= totalPages, page + 1));
}

/**
 * Load listings and render grid + pagination.
 */

async function loadAndRender() {
  const heading = document.getElementById("listings-heading");
  const state = readStateFromURL();
  const url = buildListingsURL(state);

  // simple loading hint
  if (heading) {
    heading.textContent = "Browse items (loading...)";
  }

  const [resp, err] = await handleError(getJSON(url));
  if (err) {
    console.error(err);
    renderListings([]);
    if (heading) heading.textContent = "Browse items (error)";
    return;
  }

  const items = resp?.data || [];
  const total = resp?.meta?.total ?? items.length;
  renderListings(items);
  renderPagination({ page: state.page, total, limit: 12 });
  if (heading) heading.textContent = "Browse items";
}

/**
 * Wire search and sort controls.
 */

function initControls() {
  const { q, sort } = readStateFromURL();

  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const sortSelect = document.getElementById("sort");

  if (searchInput) searchInput.value = q;
  if (sortSelect) sortSelect.value = sort;

  if (searchForm && searchInput) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nextQ = String(new FormData(searchForm).get("q") || "").trim();
      updateURL({ q: nextQ, page: 1 });
      loadAndRender();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      updateURL({ sort: sortSelect.value, page: 1 });
      loadAndRender();
    });
  }
}

/**
 * Entry point for index page.
 */
function initIndexPage() {
  initControls();
  loadAndRender();
}

initIndexPage();
