
/**
 * Here we define all the API endpoints used in the application.
 */

 // Base URL for the Noroff v2 API.
 

export const API_BASE = "https://v2.api.noroff.dev";

//Auth:
export const AUTH_CREATE_API_KEY = `${API_BASE}/auth/create-api-key`;
export const AUTH_REGISTER = `${API_BASE}/auth/register`;
export const AUTH_LOGIN = `${API_BASE}/auth/login`;

//Profiles: 
export const PROFILE_URL = (name) =>
  `${API_BASE}/auction/profiles/${encodeURIComponent(name)}`;

export const PROFILE_LISTINGS_URL = (name) =>
  `${API_BASE}/auction/profiles/${encodeURIComponent(name)}/listings`;

export const PROFILE_BIDS_URL = (name) =>
  `${API_BASE}/auction/profiles/${encodeURIComponent(name)}/bids`;

//Listings:
export const LISTINGS_URL = `${API_BASE}/auction/listings`;

export const LISTING_URL = (id) =>
  `${API_BASE}/auction/listings/${encodeURIComponent(id)}`;

//Bids:

export const PLACE_BID_URL = (listingId) =>
  `${API_BASE}/auction/listings/${encodeURIComponent(listingId)}/bids`;

export const LISTING_BIDS_URL = (listingId) =>
  `${API_BASE}/auction/listings/${encodeURIComponent(listingId)}/bids`;
