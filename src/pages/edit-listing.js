
import { getListing } from "../api/listings.js";
import { getQueryParam } from "../utils/url.js";
import { guardOwner } from "../utils/ownership.js";
import { prefillEditListingForm, wireEditListingForm } from "../ui/editListingForm.js";
import { handleError } from "../utils/handleError.js";

/**
 * Load the listing, guard ownership, prefill form, and wire submit.
 * @returns {Promise<void>}
 */

async function initEditListingPage() {
  const id = getQueryParam("id");
  const feedbackEl = document.getElementById("form-feedback");

  if (!id) {
    if (feedbackEl) feedbackEl.textContent = "Missing listing id.";
    return;
  }

  const [item, loadErr] = await handleError(getListing(id, { includeSeller: true, includeBids: false }));
  if (loadErr) {
    if (feedbackEl) feedbackEl.textContent = "Failed to load listing.";
    return;
  }

  const guard = guardOwner(item);
  if (!guard.ok) {
    if (feedbackEl) {
      feedbackEl.textContent = guard.reason;
      feedbackEl.classList.add("text-red-600");
    }
    document.getElementById("listing-form")?.classList.add("opacity-60", "pointer-events-none");
    return;
  }

  prefillEditListingForm(item);

  const cancel = document.getElementById("cancel-link");
  if (cancel) cancel.href = `/listing.html?id=${encodeURIComponent(id)}`;

  wireEditListingForm({
    id,
    onSuccess: (nextId) => window.location.assign(`/listing.html?id=${encodeURIComponent(nextId)}`),
  });
}

initEditListingPage();
