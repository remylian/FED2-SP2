/**
 * Here we define all the API endpoints used in the application.
 */

export const API_BASE = "https://v2.api.noroff.dev";
export const AUCTION_BASE = `${API_BASE}/auction`;

// Auth
export const AUTH_CREATE_API_KEY = `${API_BASE}/auth/create-api-key`;
export const AUTH_REGISTER = `${API_BASE}/auth/register`;
export const AUTH_LOGIN = `${API_BASE}/auth/login`;

// Profiles
export const PROFILE_URL = (name) =>
  `${AUCTION_BASE}/profiles/${encodeURIComponent(name)}`;

export const PROFILE_LISTINGS_URL = (name) =>
  `${AUCTION_BASE}/profiles/${encodeURIComponent(name)}/listings`;

export const PROFILE_BIDS_URL = (name) =>
  `${AUCTION_BASE}/profiles/${encodeURIComponent(name)}/bids`;

export const PROFILE_WINS_URL = (name) =>
  `${AUCTION_BASE}/profiles/${encodeURIComponent(name)}/wins`;

// Listings
export const LISTINGS_URL = `${AUCTION_BASE}/listings`;

export const LISTING_URL = (id) =>
  `${LISTINGS_URL}/${encodeURIComponent(id)}`;

// Bids
export const LISTING_BIDS_URL = (id) =>
  `${LISTING_URL(id)}/bids`;


// Backwards-compat (temporary). TODO: remove after refactor.
export const PLACE_BID_URL = LISTING_BIDS_URL;
