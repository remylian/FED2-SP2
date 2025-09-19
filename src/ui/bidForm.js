import { getSession } from "../utils/session.js";
import { placeBid } from "../api/listings.js";
import { refreshCreditsFromServer } from "../utils/credits.js";
import { initHeader } from "./header.js";

/**
 * Wire the bid form: validates, posts bid, refreshes credits, and reloads.
 * Disables for guests, owners, ended listings, and when you're already the top bidder.
 * Keeps live state so you cannot outbid yourself again without a full reload where someone else has outbid you.
 *
 * @param {{ id:string, highest:number, sellerName?:string, ended?:boolean, highestBidderName?:string }} meta
 * @param {{ onReload: () => Promise<{
 *    id:string, highest:number, sellerName:string, ended:boolean, highestBidderName:string
 * }> }} hooks
 */

export function wireBidForm(
  meta,
  { onReload }
) {
  const form = document.getElementById("bid-form");
  const amountInput = document.getElementById("bid-amount");
  const submitBtn = document.getElementById("bid-submit");
  const feedbackEl = document.getElementById("bid-feedback");
  if (!form || !amountInput || !submitBtn) return;

  // local mutable state (kept fresh after each reload) 
  let currentHighest = Number(meta?.highest || 0);
  let currentSeller = String(meta?.sellerName || "");
  let listingEnded = !!meta?.ended;
  let currentTopBidder = String(meta?.highestBidderName || "").toLowerCase();

  const setFeedback = (msg, type = "error") => {
    if (!feedbackEl) return;
    feedbackEl.textContent = msg || "";
    feedbackEl.classList.toggle("text-red-600", type === "error");
    feedbackEl.classList.toggle("text-emerald-600", type === "success");
  };
  const setLoading = (on) => { submitBtn.disabled = !!on; };
  const disableForm = (msg) => {
    form.classList.add("opacity-60");
    submitBtn.disabled = true;
    setFeedback(msg);
  };

  //  guards at init 
  const session = getSession() || {};
  const me = String(session.user?.name || "").toLowerCase();
  const sellerLc = currentSeller.toLowerCase();

  if (listingEnded) {
    return disableForm("This auction has ended.");
  }
  if (!session.token || !session.apiKey || !me) {
    return disableForm("Log in to place a bid.");
  }
  if (me && sellerLc && me === sellerLc) {
    return disableForm("Owners cannot bid on their own listings.");
  }
  if (me && currentTopBidder && me === currentTopBidder) {
    return disableForm("You are already the highest bidder.");
  }

  // submit handler 
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setFeedback("");
    setLoading(true);

    // Re-check quickly with latest session
    const meNow = String(getSession()?.user?.name || "").toLowerCase();
    if (meNow && currentTopBidder && meNow === currentTopBidder) {
      setFeedback("You are already the highest bidder.");
      setLoading(false);
      return;
    }

    const amount = Number(amountInput.value);
    if (!Number.isFinite(amount) || amount <= 0) {
      setFeedback("Please enter a valid amount greater than 0.");
      setLoading(false);
      return;
    }
    if (amount <= currentHighest) {
      setFeedback(`Your bid must be higher than current highest (${currentHighest}).`);
      setLoading(false);
      return;
    }

    try {
      // Place bid
      await placeBid(meta.id, amount);
      setFeedback("Bid placed!", "success");

      // Immediately treat ME as top to block double-click outbidding before reload finishes
      currentTopBidder = meNow || me;
      // Optional: soft-disable the button until reload completes
      submitBtn.disabled = true;

      // Update credits badge
      await refreshCreditsFromServer();
      initHeader();

      // Reload listing data and update our local state
      const next = await onReload();
      if (next) {
        currentHighest = Number(next.highest || 0);
        currentSeller = String(next.sellerName || "");
        listingEnded = !!next.ended;
        currentTopBidder = String(next.highestBidderName || "").toLowerCase();
      }

      // After reload: if I'm still top, keep disabled with message; else re-enable
      const stillTop = (meNow || me) && currentTopBidder && (meNow || me) === currentTopBidder;
      if (listingEnded) {
        disableForm("This auction has ended.");
      } else if (stillTop) {
        disableForm("You are already the highest bidder.");
      } else {
        form.classList.remove("opacity-60");
        submitBtn.disabled = false;
        setFeedback("");
      }
    } catch (err) {
      const msg = err?.body?.errors?.[0]?.message || err?.body?.message || err?.message;
      setFeedback(msg || "Failed to place bid. Please try again.");
      submitBtn.disabled = false;
    } finally {
      setLoading(false);
    }
  });
}
