import { getSession } from "./session.js";

/**
 * Ensure the current user owns the listing.
 * @param {any} listing - listing object that includes seller info
 * @returns {{ok:true}|{ok:false, reason:string}}
 */

export function guardOwner(listing) {
  const { user } = getSession() || {};
  if (!user?.name) return { ok: false, reason: "You must be logged in." };
  const sellerName = listing?.seller?.name || listing?.sellerName;
  if (sellerName && sellerName !== user.name) {
    return { ok: false, reason: "Only the owner can edit this listing." };
  }
  return { ok: true };
}
