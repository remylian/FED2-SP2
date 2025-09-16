import { getSession } from "../utils/session.js";
import { placeBid } from "../api/listings.js";
import { refreshCreditsFromServer } from "../utils/credits.js";
import { initHeader } from "./header.js";

/**
 * Wire the bid form: validates, posts bid, refreshes credits, and reloads.
 * Disables for guests, owners, and ended listings.
 * @param {{ id:string, highest:number, sellerName?:string, ended?:boolean }} meta
 * @param {{ onReload: () => Promise<void> }} hooks
 * @returns {void}
 */

export function wireBidForm({ id, highest, sellerName = "", ended = false }, { onReload }) {
  const form = document.getElementById("bid-form");
  const amountInput = document.getElementById("bid-amount");
  const submitBtn = document.getElementById("bid-submit");
  const feedbackEl = document.getElementById("bid-feedback");

  const setFeedback = (msg, type = "error") => {
    if (!feedbackEl) return;
    feedbackEl.textContent = msg || "";
    feedbackEl.classList.toggle("text-red-600", type === "error");
    feedbackEl.classList.toggle("text-emerald-600", type === "success");
  };
  const setLoading = (on) => { if (submitBtn) submitBtn.disabled = !!on; };

  if (!form || !amountInput || !submitBtn) return;

  const { token, apiKey, user } = getSession() || {};

  // Ended auctions
  if (ended) {
    form.classList.add("opacity-60");
    submitBtn.disabled = true;
    setFeedback("This auction has ended.");
    return;
  }

  // Not logged in
  if (!token || !apiKey) {
    form.classList.add("opacity-60");
    submitBtn.disabled = true;
    setFeedback("Log in to place a bid.");
    return;
  }

  // Owner cannot bid
  if (user?.name && sellerName && user.name === sellerName) {
    form.classList.add("opacity-60");
    submitBtn.disabled = true;
    setFeedback("Owners cannot bid on their own listings.");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setFeedback("");
    setLoading(true);

    const amount = Number(amountInput.value);
    if (!Number.isFinite(amount) || amount <= 0) {
      setFeedback("Please enter a valid amount greater than 0.");
      setLoading(false);
      return;
    }
    if (amount <= highest) {
      setFeedback(`Your bid must be higher than current highest (${highest}).`);
      setLoading(false);
      return;
    }

    try {
      await placeBid(id, amount);
      setFeedback("Bid placed!", "success");

      // Refresh credits badge and reload listing data
      await refreshCreditsFromServer();
      initHeader();
      await onReload();
    } catch (err) {
      const msg = err.body?.errors?.[0]?.message || err.body?.message || err.message;
      setFeedback(msg || "Failed to place bid. Please try again.");
    } finally {
      setLoading(false);
    }
  });
}
