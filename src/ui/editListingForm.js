// src/ui/editListingForm.js
import { isoToLocalInput, localToISO } from "../utils/dates.js";
import { createMediaRow, collectMedia } from "./mediaFields.js";
import { validateListingForm } from "../utils/validators.js";
import { updateListing } from "../api/listings.js";
import { makeFeedback, makeLoading } from "./feedback.js";

/**
 * Prefill the edit form with listing data, including media alt texts.
 * @param {any} item
 * @returns {void}
 */
export function prefillEditListingForm(item) {
  const title = document.getElementById("title");
  const desc = document.getElementById("description");
  const ends = document.getElementById("endsAt");
  const list = document.getElementById("media-list");

  if (title) title.value = item?.title || "";
  if (desc) desc.value = item?.description || "";
  if (ends) ends.value = isoToLocalInput(item?.endsAt);

  if (list) {
    list.innerHTML = "";
    const arr = Array.isArray(item?.media) ? item.media : [];
    if (arr.length === 0) {
      list.appendChild(createMediaRow({ url: "", alt: "" }));
    } else {
      for (const m of arr) {
        const url = typeof m === "string" ? m : (m?.url || "");
        const alt = typeof m === "string" ? "" : (m?.alt || "");
        list.appendChild(createMediaRow({ url, alt }));
      }
    }
  }
}

/**
 * Wire the edit form submit: validate, PUT, redirect on success.
 * Uses ui/feedback.js helpers bound to your markup IDs.
 * @param {{ id:string, onSuccess?: (id:string)=>void }} opts
 * @returns {void}
 */
export function wireEditListingForm({ id, onSuccess }) {
  const feedback = makeFeedback("form-feedback");
  const setLoading = makeLoading("form-submit", "form-spinner");
  const form = document.getElementById("listing-form");

  // Add-row button
  const addBtn = document.getElementById("media-add");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const mediaList = document.getElementById("media-list");
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

      await updateListing(id, { title, description, media, endsAt: endsAtISO });

      feedback("Listing updated.", "success");
      if (typeof onSuccess === "function") onSuccess(id);
      else window.location.assign(`/listing.html?id=${encodeURIComponent(id)}`);
    } catch (err) {
      const msg =
        err?.body?.errors?.[0]?.message ||
        err?.body?.message ||
        err?.message ||
        "Failed to update listing.";
      feedback(msg, "error");
    } finally {
      setLoading(false);
    }
  });
}
