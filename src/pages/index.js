
import { getListings } from "../api/listings.js";
import { renderListingsGrid } from "../ui/listingsGrid.js";
import { renderPagination } from "../ui/pagination.js";

/** Read state from URL. */
function readState() {
  const sp = new URLSearchParams(window.location.search);
  const q = sp.get("q")?.trim() || "";
  const sort = sp.get("sort") || "endsAt";
  const page = Math.max(1, Number(sp.get("page") || 1));
  return { q, sort, page };
}

/** Replace query params without reload. */
function patchURL(patch) {
  const sp = new URLSearchParams(window.location.search);
  if (patch.q !== undefined) sp.set("q", patch.q);
  if (patch.sort !== undefined) sp.set("sort", patch.sort);
  if (patch.page !== undefined) sp.set("page", String(patch.page));
  if (!sp.get("q")) sp.delete("q");
  history.replaceState(null, "", `?${sp.toString()}`);
}

/** Load listings and render grid + pagination. */
async function loadAndRender() {
  const heading = document.getElementById("listings-heading");
  const { q, sort, page } = readState();
  if (heading) heading.textContent = "Browse items (loading...)";

  try {
    const { items, meta } = await getListings({ q, sort, page, limit: 12 });
    const pageCount = meta.pageCount ?? (meta.totalCount ? Math.ceil(meta.totalCount / 12) : 1);

    renderListingsGrid(items);
    renderPagination({
      page,
      pageCount,
      onChange: (nextPage) => { patchURL({ page: nextPage }); loadAndRender(); },
    });

    if (heading) heading.textContent = "Browse items";
  } catch (err) {
    console.error(err);
    renderListingsGrid([]);
    if (heading) heading.textContent = "Browse items (error)";
  }
}

/** Wire search/sort controls. */
function wireControls() {
  const { q, sort } = readState();
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const sortSelect = document.getElementById("sort");

  if (searchInput) searchInput.value = q;
  if (sortSelect) sortSelect.value = sort;

  if (searchForm && searchInput) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nextQ = String(new FormData(searchForm).get("q") || "").trim();
      patchURL({ q: nextQ, page: 1 });
      loadAndRender();
    });
  }
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      patchURL({ sort: sortSelect.value, page: 1 });
      loadAndRender();
    });
  }
}

/** Entry. */
(function initHome() {
  wireControls();
  loadAndRender();
})();
