
import { getListing } from "../api/listings.js";
import { renderListingMeta } from "../ui/listingMeta.js";
import { renderGallery } from "../ui/gallery.js";
import { renderBidHistory } from "../ui/bidHistory.js";
import { renderOwnerActions } from "../ui/ownerActions.js";
import { wireBidForm } from "../ui/bidForm.js";

/** Get ?id= */
function getId() {
  const id = new URLSearchParams(window.location.search).get("id");
  return id ? id.trim() : null;
}

/** Load → render modules → wire bid form. */
async function initListingPage() {
  const titleEl = document.getElementById("listing-title");
  const subtitleEl = document.getElementById("listing-subtitle");
  const id = getId();

  if (!id) {
    if (titleEl) titleEl.textContent = "Listing not found";
    if (subtitleEl) subtitleEl.textContent = "Missing ?id= in the URL.";
    return;
  }

  try {
    const item = await getListing(id, { includeSeller: true, includeBids: true });
    const meta = renderListingMeta(item);
    renderGallery(item.media);
    renderBidHistory(item.bids);
    renderOwnerActions(item);
    wireBidForm(meta, { onReload: async () => {
      const fresh = await getListing(id, { includeSeller: true, includeBids: true });
      const nextMeta = renderListingMeta(fresh);
      renderGallery(fresh.media);
      renderBidHistory(fresh.bids);
      renderOwnerActions(fresh);
      return nextMeta;
    }});
  } catch (e) {
    if (titleEl) titleEl.textContent = "Failed to load listing";
    if (subtitleEl) {
      const msg = e?.body?.errors?.[0]?.message || e?.body?.message || e?.message || "Please try again.";
      subtitleEl.textContent = msg;
    }
  }
}

initListingPage();
