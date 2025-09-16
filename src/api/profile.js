import { getJSON, putJSON } from "./client.js";
import { handleError } from "../utils/handleError.js";
import {
  PROFILE_URL,
  PROFILE_LISTINGS_URL,
  PROFILE_BIDS_URL,
  PROFILE_WINS_URL,
} from "../config/endpoints.js";

/**
 * Get a profile by handle.
 * @param {string} name
 * @returns {Promise<any>}
 * @throws {any} if request fails
 */
export async function getProfile(name) {
  const [resp, err] = await handleError(getJSON(PROFILE_URL(name)));
  if (err) throw err;
  return resp?.data || resp;
}

/**
 * Update profile fields (bio, avatar, banner).
 * Accepts raw URLs and converts to { url } as needed.
 * @param {string} name
 * @param {{ bio?: string, avatar?: string|null, banner?: string|null }} payload
 * @returns {Promise<any>}
 * @throws {any}
 */
export async function updateProfile(name, payload) {
  const body = {
    bio: payload.bio ?? "",
    avatar: payload.avatar ? { url: payload.avatar } : null,
    banner: payload.banner ? { url: payload.banner } : null,
  };
  const [resp, err] = await handleError(putJSON(PROFILE_URL(name), body));
  if (err) throw err;
  return resp?.data || resp;
}

/**
 * Get listings for a profile.
 * @param {string} name
 * @param {{page?:number,limit?:number, includeBids?:boolean, includeSeller?:boolean}} [opts]
 * @returns {Promise<any[]>}
 * @throws {any}
 */
export async function getProfileListings(
  name,
  { page = 1, limit = 12, includeBids = true, includeSeller = true } = {}
) {
  const sp = new URLSearchParams();
  sp.set("page", String(page));
  sp.set("limit", String(limit));
  if (includeBids) sp.set("_bids", "true");
  if (includeSeller) sp.set("_seller", "true");

  const [resp, err] = await handleError(getJSON(`${PROFILE_LISTINGS_URL(name)}?${sp.toString()}`));
  if (err) throw err;
  return resp?.data || resp || [];
}

/**
 * Get recent bids for a profile.
 * Uses `_listings=true` to include the associated listing object.
 * @param {string} name
 * @param {{page?:number,limit?:number, includeListings?:boolean}} [opts]
 * @returns {Promise<any[]>}
 * @throws {any}
 */
export async function getProfileBids(
  name,
  { page = 1, limit = 20, includeListings = true } = {}
) {
  const sp = new URLSearchParams();
  sp.set("page", String(page));
  sp.set("limit", String(limit));
  if (includeListings) sp.set("_listings", "true"); // ← plural per API

  const [resp, err] = await handleError(getJSON(`${PROFILE_BIDS_URL(name)}?${sp.toString()}`));
  if (err) throw err;
  return resp?.data || resp || [];
}

/**
 * Get listings this profile has won.
 * @param {string} name
 * @param {{page?:number, limit?:number, includeBids?:boolean, includeSeller?:boolean}} [opts]
 * @returns {Promise<{items:any[], meta:any}>}
 */

export async function getProfileWins(
  name,
  { page = 1, limit = 12, includeBids = true, includeSeller = true } = {}
) {
  const sp = new URLSearchParams({ page, limit });
  if (includeBids) sp.set("_bids", "true");
  if (includeSeller) sp.set("_seller", "true");

  const [resp, err] = await handleError(getJSON(`${PROFILE_WINS_URL(name)}?${sp.toString()}`));
  if (err) throw err;
  return { items: resp?.data || [], meta: resp?.meta || {} };
}