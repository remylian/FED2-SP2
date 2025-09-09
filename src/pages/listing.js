import { getJSON, postJSON } from "../api/client.js";
import { handleError } from "../utils/handleError.js";
import { LISTING_URL, LISTING_BIDS_URL } from "../config/endpoints.js";
import { getSession } from "../utils/session.js";
import { normalizeMedia } from "../utils/media.js";
import { refreshCreditsFromServer } from "../utils/credits.js";
import { initHeader } from "../ui/header.js";

/**
 * Read ?id= from URL.
 * @returns {string|null}
 */

function getListingId() {
  const id = new URLSearchParams(window.location.search).get("id");
  return id ? id.trim() : null;
}

function highestBid(bids = []) {
  if (!Array.isArray(bids) || !bids.length) return 0;
  return bids.reduce((m, b) => (b?.amount > m ? b.amount : m), 0);
}

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

/**
 * Render helpers
 */

function renderGallery(media = []) {
  const wrap = document.getElementById("listing-gallery");
  wrap.innerHTML = "";

  const imgs = normalizeMedia(media);
  if (imgs.length === 0) {
    wrap.innerHTML = `<div class="col-span-full grid place-items-center text-sm text-gray-500 h-48">No images</div>`;
    return;
  }
  for (const { url, alt } of imgs) {
    const div = document.createElement("div");
    div.className = "aspect-square overflow-hidden rounded-lg bg-gray-200";
    div.innerHTML = `<img src="${url}" alt="${alt || ""}" class="h-full w-full object-cover" />`;
    wrap.appendChild(div);
  }
}


function renderBids(bids = []) {
  const list = document.getElementById("bid-history");
  const empty = document.getElementById("bid-history-empty");
  list.innerHTML = "";
  if (!Array.isArray(bids) || bids.length === 0) {
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  // Most recent first
  const sorted = [...bids].sort((a, b) => new Date(b.created) - new Date(a.created));
  for (const b of sorted) {
    const li = document.createElement("li");
    const who = b?.bidderName || "Anonymous";
    const when = fmtDate(b?.created);
    li.className = "rounded-lg border px-3 py-2 text-sm";
    li.textContent = `${who} bid ${b?.amount ?? 0} • ${when}`;
    list.appendChild(li);
  }
}

function setBidFeedback(msg, type = "error") {
  const el = document.getElementById("bid-feedback");
  el.textContent = msg || "";
  el.classList.toggle("text-red-600", type === "error");
  el.classList.toggle("text-emerald-600", type === "success");
}

function setBidLoading(loading) {
  const btn = document.getElementById("bid-submit");
  btn.disabled = !!loading;
}

/**
 * Load and render single listing
 */

async function loadListing() {
  const id = getListingId();
  if (!id) {
    document.getElementById("listing-title").textContent = "Listing not found";
    return null;
  }

  // Fetch listing with seller + bids
  const url = `${LISTING_URL(id)}?_seller=true&_bids=true`;
  const [resp, err] = await handleError(getJSON(url));
  if (err) {
    console.error(err);
    document.getElementById("listing-title").textContent = "Failed to load listing";
    return null;
  }

  const item = resp?.data || resp;
  const { title, description, media, endsAt, seller, bids } = item || {};
  const highest = highestBid(bids);

  // Title + subtitle
  document.getElementById("listing-title").textContent = title || "Untitled";
  document.getElementById("listing-subtitle").textContent =
    `Seller: ${seller?.name ?? "unknown"} • Highest bid: ${highest} • Ends: ${fmtDate(endsAt)}`;

  // Meta
  document.getElementById("listing-highest").textContent = String(highest);
  document.getElementById("listing-ends").textContent = fmtDate(endsAt);
  document.getElementById("listing-seller").textContent = seller?.name ?? "—";

  // Description + gallery + bids
  document.getElementById("listing-description").textContent = description || "No description.";
  renderGallery(media);
  renderBids(bids);

  return { id, highest };
}

/**
 * Initialize the bid form for a listing.
 * - Disables form if the user is not logged in.
 * - Validates bid amount against current highest.
 * - Submits bid to the API and handles errors.
 * - On success: updates feedback, clears input, refreshes credits, header, and listing.
 *
 * @param {object} options - Listing context.
 * @param {string} options.id - The listing ID.
 * @param {number} options.highest - Current highest bid amount.
 * @returns {void}
 */


function initBidForm({ id, highest }) {
  const { token, apiKey } = getSession();
  let currentHighest = Number(highest) || 0;

  const form = document.getElementById("bid-form");
  if (!form) return;

  const amountInput = document.getElementById("bid-amount");
  const submitBtn = document.getElementById("bid-submit");

  // If not logged in, disable form
  if (!token || !apiKey) {
    form.classList.add("opacity-60");
    if (submitBtn) submitBtn.disabled = true;
    setBidFeedback("Log in to place a bid.");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setBidFeedback("");
    setBidLoading(true);

    try {
      if (!amountInput) {
        setBidFeedback("Bid input not found.");
        return;
      }

      const amount = Number(amountInput.value);
      if (!Number.isFinite(amount) || amount <= 0) {
        setBidFeedback("Please enter a valid amount greater than 0.");
        return;
      }

      if (amount <= currentHighest) {
        setBidFeedback(`Your bid must be higher than current highest (${currentHighest}).`);
        return;
      }

      const [res, err] = await handleError(
        postJSON(LISTING_BIDS_URL(id), { amount })
      );

      if (err) {
        const msg = err.body?.errors?.[0]?.message || err.body?.message || err.message;
        setBidFeedback(msg || "Failed to place bid. Please try again.");
        return;
      }

      // Success
      setBidFeedback("Bid placed!", "success");
      amountInput.value = "";
      amountInput.blur();

      // Refresh credits in localStorage and header badge
      await refreshCreditsFromServer();
      initHeader();

      // Reload listing to refresh bids and update local validation state
      const meta = await loadListing();
      if (meta && Number.isFinite(meta.highest)) {
        currentHighest = Number(meta.highest);
      }
    } finally {
      setBidLoading(false);
    }
  });
}


/**
 * Entry point
 */

async function initListingPage() {
  const meta = await loadListing();
  if (meta) initBidForm(meta);
}

initListingPage();
