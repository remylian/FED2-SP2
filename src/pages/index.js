import { getJSON } from "../api/client.js";
import { handleError } from "../utils/handleError.js";
import { LISTINGS_URL } from "../config/endpoints.js";
import { createListingCard } from "../ui/listingCard.js";
import { initCountdowns } from "../ui/countdown.js";
import { showGridSkeleton } from "../ui/skeletons.js";

/**
 * Read state from current URL (q, sort, page) with defaults.
 * URL becomes the source of truth (refresh/share/back-forward behave).
 * @returns {{ q: string, sort: "endsAt"|"created"|"title", page: number }}
 */
function readStateFromURL() {
	const sp = new URLSearchParams(window.location.search);

	const q = (sp.get("q") ?? "").trim();

	const sortRaw = (sp.get("sort") ?? "endsAt").trim();
	/** @type {"endsAt"|"created"|"title"} */
	const sort = sortRaw === "created" || sortRaw === "title" ? sortRaw : "endsAt";

	const pageRaw = Number.parseInt(sp.get("page") ?? "1", 10);
	const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

	return { q, sort, page };
}

/**
 * Replace or push URL query parameters without reloading.
 * @param {{ q?: string, sort?: string, page?: number }} patch
 * @param {{ push?: boolean }} [opts]
 */
function updateURL(patch, { push = false } = {}) {
	const url = new URL(window.location.href);
	const sp = url.searchParams;

	if (patch.q !== undefined) sp.set("q", patch.q);
	if (patch.sort !== undefined) sp.set("sort", patch.sort);
	if (patch.page !== undefined) sp.set("page", String(patch.page));

	// Clean empty q (nice URLs)
	if (!sp.get("q")) sp.delete("q");

	const next = `${url.pathname}${sp.toString() ? `?${sp.toString()}` : ""}`;
	if (push) history.pushState(null, "", next);
	else history.replaceState(null, "", next);
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
		sp.set("sortOrder", "asc");
	}

	return `${base}?${sp.toString()}`;
}

/**
 * Debounce helper.
 * Why: typing shouldn't spam the API and should feel stable.
 * @template {(...args:any[])=>void} T
 * @param {T} fn
 * @param {number} [wait=250]
 * @returns {T}
 */
function debounce(fn, wait = 250) {
	/** @type {number|null} */
	let t = null;

	// @ts-ignore - return same callable signature
	return (...args) => {
		if (t) window.clearTimeout(t);
		t = window.setTimeout(() => fn(...args), wait);
	};
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
		grid.appendChild(createListingCard(it, { showSellerLink: true }));
	}

	// If countdown elements are created inside cards, init after render.
	initCountdowns();
}

/**
 * Render Prev/Next pagination using meta.pageCount when available.
 * @param {{ page: number, pageCount: number }} meta
 */
function renderPagination({ page, pageCount }) {
	const nav = document.getElementById("pagination");
	if (!nav) return;

	nav.innerHTML = "";

	const totalPages = Math.max(1, Number(pageCount) || 1);
	if (totalPages <= 1) return;

	const makeBtn = (label, disabled, nextPage) => {
		const b = document.createElement("button");
		b.type = "button";
		b.textContent = label;
		b.disabled = disabled;
		b.className = `rounded-lg border px-3 py-1 bg-white text-sm ${
			disabled ? "opacity-60" : "hover:bg-gray-100"
		}`;

		if (!disabled) {
			b.addEventListener("click", () => {
				updateURL({ page: nextPage }, { push: true });
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

// --- Race-safety for dynamic search ---
let activeRequestId = 0;

/**
 * Load listings and render grid + pagination.
 */
async function loadAndRender() {
	const requestId = ++activeRequestId;

	const heading = document.getElementById("listings-heading");
	const state = readStateFromURL();
	const url = buildListingsURL(state);

	if (heading) heading.textContent = "Browse items (loading...)";

	const [resp, err] = await handleError(getJSON(url));

	// Ignore stale responses (typing fast / slow network)
	if (requestId !== activeRequestId) return;

	if (err) {
		console.error(err);
		renderListings([]);
		renderPagination({ page: state.page, pageCount: 1 });
		if (heading) heading.textContent = "Browse items (error)";
		return;
	}

	const items = resp?.data || [];
	const meta = resp?.meta || {};

	const limit = 12;
	const pageCount = meta.pageCount ?? (meta.totalCount ? Math.ceil(meta.totalCount / limit) : 1);

	renderListings(items);
	renderPagination({ page: state.page, pageCount });

	if (heading) heading.textContent = "Browse items";
}

/**
 * Wire search and sort controls.
 * - Submit still works (Enter key / accessibility)
 * - Typing triggers debounced search
 * - ESC clears
 */
function initControls() {
	const searchForm = document.getElementById("search-form");
	const searchInput = document.getElementById("search-input");
	const sortSelect = document.getElementById("sort");

	const { q, sort } = readStateFromURL();

	if (searchInput) searchInput.value = q;
	if (sortSelect) sortSelect.value = sort;

	const runSearch = () => {
		if (!searchInput) return;
		const nextQ = String(searchInput.value ?? "").trim();
		updateURL({ q: nextQ, page: 1 }, { push: true });
		loadAndRender();
	};

	// Submit still works
	if (searchForm && searchInput) {
		searchForm.addEventListener("submit", (e) => {
			e.preventDefault();
			runSearch();
		});
	}

	// Dynamic: search as you type (debounced)
	if (searchInput) {
		const debounced = debounce(runSearch, 250);
		searchInput.addEventListener("input", debounced);

		searchInput.addEventListener("keydown", (e) => {
			if (e.key === "Escape") {
				searchInput.value = "";
				runSearch();
			}
		});
	}

	if (sortSelect) {
		sortSelect.addEventListener("change", () => {
			updateURL({ sort: sortSelect.value, page: 1 }, { push: true });
			loadAndRender();
		});
	}

	// Back/forward should restore state + rerender
	window.addEventListener("popstate", () => {
		const next = readStateFromURL();
		if (searchInput) searchInput.value = next.q;
		if (sortSelect) sortSelect.value = next.sort;
		loadAndRender();
	});
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
