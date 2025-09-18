// src/ui/createListingForm.js
import { localToISO } from "../utils/dates.js";
import { validateListingForm } from "../utils/validators.js";
import { createListing } from "../api/listings.js";
import { createMediaRow, collectMedia, ensureAtLeastOneMediaRow } from "./mediaFields.js";
import { makeFeedback, makeLoading } from "./feedback.js";

/**
 * Initialize the Create Listing form UI:
 * - Seeds one media row (URL + Alt)
 * - Sets a sensible min for endsAt (now + 10 min)
 * - Wires the "Add media" button
 * - Wires submit with validation and API call
 *
 * @param {{ onSuccess?: (id:string)=>void }} [opts]
 * @returns {void}
 */
export function wireCreateListingForm({ onSuccess } = {}) {
  const feedback = makeFeedback("form-feedback");
  const setLoading = makeLoading("form-submit", "form-spinner");

  const form = document.getElementById("listing-form");
  const mediaList = document.getElementById("media-list");
  const addBtn = document.getElementById("media-add");
  const endsAtInput = document.getElementById("endsAt");

  // Ensure at least one media row is present
  if (mediaList && mediaList.children.length === 0) {
    mediaList.appendChild(createMediaRow({ url: "", alt: "" }));
  } else {
    ensureAtLeastOneMediaRow();
  }

  // UX: min datetime local = now + 10 minutes
  if (endsAtInput) {
    const pad = (n) => String(n).padStart(2, "0");
    const now = new Date(Date.now() + 10 * 60_000);
    const local = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(
      now.getHours()
    )}:${pad(now.getMinutes())}`;
    endsAtInput.min = local;
  }

  if (addBtn) {
    addBtn.addEventListener("click", () => {
      if (!mediaList) return;
      const row = createMediaRow({ url: "", alt: "" });
      mediaList.appendChild(row);
      row.querySelector('input[name="media"]')?.focus();
    });
  }

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    feedback("");
    setLoading(true);

    try {
      const fd = new FormData(form);
      const title = String(fd.get("title") || "").trim();
      const description = String(fd.get("description") || "").trim();
      const endsAtISO = localToISO(String(fd.get("endsAt") || ""));

      // Collect { url, alt }
      const media = collectMedia();

      const valid = validateListingForm(title, endsAtISO);
      if (!valid.ok) {
        feedback(valid.message || "Please check your input.");
        return;
      }

      const created = await createListing({ title, description, endsAt: endsAtISO, media });
      const newId = created?.id;
      feedback("Listing created!", "success");

      if (typeof onSuccess === "function" && newId) {
        onSuccess(newId);
      } else if (newId) {
        window.location.assign(`/listing.html?id=${encodeURIComponent(newId)}`);
      }
    } catch (err) {
      const msg =
        err?.body?.errors?.[0]?.message ||
        err?.body?.message ||
        err?.message ||
        "Failed to create listing.";
      feedback(msg, "error");
    } finally {
      setLoading(false);
    }
  });
}
