
import { getJSON, postJSON, delJSON, putJSON } from "./client.js";
import { handleError } from "../utils/handleError.js";
import { LISTING_URL, LISTING_BIDS_URL, LISTINGS_URL } from "../config/endpoints.js";

/**
 * Fetch a single listing with optional expansions.
 * @param {string} id
 * @param {{ includeSeller?: boolean, includeBids?: boolean }} [opts]
 * @returns {Promise<any>} listing object
 * @throws {any} on error
 */

export async function getListing(id, { includeSeller = true, includeBids = true } = {}) {
  const sp = new URLSearchParams();
  if (includeSeller) sp.set("_seller", "true");   // docs: optional flag
  if (includeBids)  sp.set("_bids", "true");      // docs: optional flag
  const [resp, err] = await handleError(getJSON(`${LISTING_URL(id)}?${sp}`));
  if (err) throw err;
  return resp?.data || resp;
}


/**
 * Fetch listings for the home page (uses /search when q is present).
 * @param {{ q?:string, sort?:string, page?:number, limit?:number }} params
 * @returns {Promise<{ items:any[], meta:{ pageCount?:number, totalCount?:number } }>}
 */

export async function getListings({ q = "", sort = "endsAt", page = 1, limit = 12 } = {}) {
  const base = q ? `${LISTINGS_URL}/search` : LISTINGS_URL;
  const sp = new URLSearchParams();
  sp.set("_active", "true");
  sp.set("_bids", "true");
  sp.set("_seller", "true");
  sp.set("limit", String(limit));
  sp.set("page", String(page));
  if (q) sp.set("q", q);
  if (sort) {
    sp.set("sort", sort);
    sp.set("sortOrder", sort === "title" ? "asc" : "asc");
  }

  const url = `${base}?${sp.toString()}`;
  const [resp, err] = await handleError(getJSON(url));
  if (err) throw err;
  return {
    items: resp?.data || [],
    meta: resp?.meta || {},
  };
}

/**
 * Place a bid on a listing.
 * @param {string} id
 * @param {number} amount
 * @returns {Promise<any>}
 * @throws {any} on error
 */

export async function placeBid(id, amount) {
  const [resp, err] = await handleError(postJSON(LISTING_BIDS_URL(id), { amount }));
  if (err) throw err;
  return resp?.data || resp;
}

/**
 * Create a new listing.
 * @param {{title:string, description?:string, media?:{url:string}[], endsAt:string}} payload
 * @returns {Promise<{id:string}>} Created listing
 * @throws {any}
 */

export async function createListing(payload) {
  const [resp, err] = await handleError(postJSON(LISTINGS_URL, payload));
  if (err) throw err;
  return resp?.data || resp;
}

/**
 * Update an existing listing by id.
 * @param {string} id
 * @param {{title:string, description?:string, media?:{url:string}[], endsAt?:string}} payload
 * @returns {Promise<void>}
 * @throws {any}
 */

export async function updateListing(id, payload) {
  const [, err] = await handleError(putJSON(LISTING_URL(id), payload));
  if (err) throw err;
}

/**
 * Delete a listing.
 * @param {string} id
 * @returns {Promise<void>}
 * @throws {any} on error
 */

export async function deleteListing(id) {
  const [, err] = await handleError(delJSON(LISTING_URL(id)));
  if (err) throw err;
}
