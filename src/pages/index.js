import { getJSON } from "../api/client.js";
import { handleError } from "../utils/handleError.js";
import { LISTINGS_URL } from "../config/endpoints.js";
import { createListingCard } from "../ui/listingCard.js";
import { initCountdowns } from "../ui/countdown.js";
import { showGridSkeleton } from "../ui/skeletons.js";

/**
 * Read state from current URL (q, sort, page) with defaults.
 * @returns {{ q: string, sort: "endsAt"|"created"|"title", page: number }}
 */

function readStateFromURL() {
  const sp = new URLSearchParams(window.location.search);
  const q = sp.get("q")?.trim() || "";
  const sort = sp.get("sort") || "endsAt";
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
  if (!sp.get("q")) sp.delete("q"); // clean empty q
  history.replaceState(null, "", `?${sp.toString()}`);
}

/**
 * Build listings URL with query params.
 * Uses /search when q is set (v2 API).
 * @param {{ q: string, sort: string, page: number, limit?: number }} state
 * @returns {string}
 */

function buildListingsURL({ q, sort, page, limit = 12 }) {
  const base = q ? `${LISTINGS_URL}/search` : LISTINGS_URL;
  const sp = new URLSearchParams();
  sp.set("_active", "true");
  sp.set("_bids", "true");
  sp.set("_seller", "true");
  sp.set("limit", String(limit));
  sp.set("page", String(page));
  if (q) sp.set("q", q);
  if (sort) {
    sp.set("sort", sort);
    sp.set("sortOrder", sort === "title" ? "asc" : "asc");
  }
  return `${base}?${sp.toString()}`;
}

showGridSkeleton ({gridId: "my-listings-grid", emptyId: "my-listings-empty", count: 8});

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
    grid.appendChild(createListingCard(it, { showSellerLink: true }));
  }
}
 initCountdowns();

/**
 * Render Prev/Next pagination using meta.pageCount when available.
 * @param {{ page: number, pageCount: number }} meta
 */

function renderPagination({ page, pageCount }) {
  const nav = document.getElementById("pagination");
  if (!nav) return;
  nav.innerHTML = "";

  const totalPages = Math.max(1, Number(pageCount) || 1);
  const makeBtn = (label, disabled, nextPage) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.disabled = disabled;
    b.className = `rounded-lg border px-3 py-1 text-sm ${disabled ? "opacity-50" : "hover:bg-gray-100"}`;
    if (!disabled) {
      b.addEventListener("click", () => {
        updateURL({ page: nextPage });
        loadAndRender();
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

  if (heading) heading.textContent = "Browse items (loading...)";

  const [resp, err] = await handleError(getJSON(url));
  if (err) {
    console.error(err);
    renderListings([]);
    if (heading) heading.textContent = "Browse items (error)";
    return;
  }

  const items = resp?.data || [];
  const meta = resp?.meta || {};
  // Prefer pageCount; fall back to totalCount if present
  const pageCount = meta.pageCount ?? (meta.totalCount ? Math.ceil(meta.totalCount / 12) : 1);

  renderListings(items);
  renderPagination({ page: state.page, pageCount });
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
  showGridSkeleton({ gridId: "listings-grid", emptyId: "listings-empty", count: 8 });
  initControls();
  loadAndRender();
}

initIndexPage();
