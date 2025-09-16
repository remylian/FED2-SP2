/**
 * @module utils/url
 * Tiny URL helpers.
 */

/**
 * Read a query parameter from a search string (defaults to window.location.search).
 * @param {string} name
 * @param {string} [search]
 * @returns {string|null}
 */

export function getQueryParam(name, search = window.location.search) {
  const v = new URLSearchParams(search).get(name);
  return v ? v.trim() : null;
}
