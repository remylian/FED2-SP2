import { getSession } from "../utils/session.js";
import { deleteListing } from "../api/listings.js";

/**
 * Show owner-only actions (Edit/Delete) and wire Delete.
 * @param {{ id:string, seller?:{name?:string} }} item
 * @returns {void}
 */

export function renderOwnerActions(item) {
  const box = document.getElementById("listing-owner-actions");
  const editLink = document.getElementById("edit-listing-link");
  const delBtn = document.getElementById("delete-listing");
  const spinner = document.getElementById("delete-spinner");
  const feedback = document.getElementById("delete-feedback");
  if (!box || !editLink || !delBtn || !spinner || !feedback) return;

  const { user } = getSession();
  const sellerName = item?.seller?.name || "";
  const isOwner = user?.name && sellerName && user.name === sellerName;

  // Hide by default
  box.classList.add("hidden");
  feedback.textContent = "";
  feedback.classList.remove("text-red-600", "text-emerald-600");

  if (!isOwner) return;

  // Owner sees the action row
  editLink.href = `/edit-listing.html?id=${encodeURIComponent(item.id)}`;
  box.classList.remove("hidden");

  // Wire delete once
  delBtn.onclick = async (e) => {
    e.preventDefault();
    feedback.textContent = "";
    feedback.classList.remove("text-red-600", "text-emerald-600");

    const ok = window.confirm("Are you sure you want to delete this listing? This cannot be undone.");
    if (!ok) return;

    delBtn.disabled = true;
    spinner.classList.remove("hidden");
    try {
      await deleteListing(item.id);
      feedback.textContent = "Listing deleted.";
      feedback.classList.add("text-emerald-600");
      window.location.assign("/profile.html");
    } catch (err) {
      const msg = err.body?.errors?.[0]?.message || err.body?.message || err.message;
      feedback.textContent = msg || "Failed to delete listing.";
      feedback.classList.add("text-red-600");
    } finally {
      delBtn.disabled = false;
      spinner.classList.add("hidden");
    }
  };
}
