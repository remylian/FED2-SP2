import { postJSON } from "./client.js";
import { handleError } from "../utils/handleError.js";
import { AUTH_LOGIN, AUTH_REGISTER, AUTH_CREATE_API_KEY } from "../config/endpoints.js";

/**
 * Log in a user.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{accessToken:string, name:string, email?:string, avatar?:any}>}
 */

export async function login(email, password) {
  const [res, err] = await handleError(postJSON(AUTH_LOGIN, { email, password }));
  if (err) throw err;
  const data = res?.data || res || {};
  return {
    accessToken: data.accessToken,
    name: data.name,
    email: data.email,
    avatar: data.avatar ?? null,
  };
}

/**
 * Register a user.
 * @param {{name:string,email:string,password:string}} payload
 * @returns {Promise<void>}
 */

export async function register(payload) {
  const [_, err] = await handleError(postJSON(AUTH_REGISTER, payload));
  if (err) throw err;
}

/**
 * Create a Noroff API key (requires bearer token).
 * @param {string} token
 * @returns {Promise<string>} api key
 */

export async function createApiKey(token) {
  const [res, err] = await handleError(postJSON(AUTH_CREATE_API_KEY, { name: "auction-house-key" }, { token }));
  if (err) throw err;
  return res?.data?.key ?? res?.key ?? "";
}
