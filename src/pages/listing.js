import { getListing } from "../api/listings.js";
import { renderListingMeta } from "../ui/listingMeta.js";
import { renderGallery } from "../ui/gallery.js";
import { renderBidHistory } from "../ui/bidHistory.js";
import { renderOwnerActions } from "../ui/ownerActions.js";
import { wireBidForm } from "../ui/bidForm.js";
import { setPageMeta } from "../ui/meta.js";
import { showListingDetailSkeleton, withMinDelay } from "../ui/skeletons.js";
import { wireCopyShare } from "../ui/share.js";

/** Get ?id= */
function getId() {
  const id = new URLSearchParams(window.location.search).get("id");
  return id ? id.trim() : null;
}

/** Load -> render modules -> wire bid form (+ meta). */
async function initListingPage() {
  const titleEl = document.getElementById("listing-title");
  const subtitleEl = document.getElementById("listing-subtitle");
  const id = getId();

  if (!id) {
    if (titleEl) titleEl.textContent = "Listing not found";
    if (subtitleEl) subtitleEl.textContent = "Missing ?id= in the URL.";
    return;
  }

  // Show detail skeleton immediately
  showListingDetailSkeleton({ galleryCount: 6 });

  try {
    // Enforce a tiny minimum delay so shimmer is visible 
    const item = await withMinDelay(
      getListing(id, { includeSeller: true, includeBids: true }),
      300
    );

    // SEO/share meta
    setPageMeta({
      title: item?.title || "Listing",
      description: (item?.description || "View photos, current highest bid, and bid history."),
      image: (Array.isArray(item?.media) && item.media[0]?.url) || undefined,
      type: "article",
    });

    // Render UI (these overwrite the skeletons)
    const meta = renderListingMeta(item);
    renderGallery(item.media);
    renderBidHistory(item.bids);
    renderOwnerActions(item);
    wireCopyShare("share-btn", () => location.href);

    // Bid form with live refresh
    wireBidForm(meta, {
      onReload: async () => {
        const fresh = await getListing(id, { includeSeller: true, includeBids: true });
        const nextMeta = renderListingMeta(fresh);
        renderGallery(fresh.media);
        renderBidHistory(fresh.bids);
        renderOwnerActions(fresh);


        // refresh meta (optional)
        setPageMeta({
          title: fresh?.title || "Listing",
          description: (fresh?.description || "View photos, current highest bid, and bid history."),
          image: (Array.isArray(fresh?.media) && fresh.media[0]?.url) || undefined,
          type: "article",
        });

        return nextMeta;
      }
    });
  } catch (e) {
    if (titleEl) titleEl.textContent = "Failed to load listing";
    if (subtitleEl) {
      const msg = e?.body?.errors?.[0]?.message || e?.body?.message || e?.message || "Please try again.";
      subtitleEl.textContent = msg;
    }
  }
}

initListingPage();
