/**
 * Return the first image of a listing, regardless of whether the API
 * returned strings or { url, alt } objects.
 * @param {Array<string|{url?: string, alt?: string}>} media
 * @returns {{ url: string, alt: string }}
 */

export function getFirstImage(media) {
  if (!Array.isArray(media) || media.length === 0) return { url: "", alt: "" };
  const m = media[0];
  if (typeof m === "string") return { url: m, alt: "" };
  if (m && typeof m === "object") return { url: m.url || "", alt: m.alt || "" };
  return { url: "", alt: "" };
}

/**
 * Normalize any media array to an array of { url, alt } objects,
 * filtering out empty/invalid entries.
 * @param {Array<string|{url?: string, alt?: string}>} media
 * @returns {Array<{ url: string, alt: string }>}
 */

export function normalizeMedia(media) {
  if (!Array.isArray(media)) return [];
  return media
    .map((m) =>
      typeof m === "string" ? { url: m, alt: "" } : { url: m?.url || "", alt: m?.alt || "" }
    )
    .filter((x) => !!x.url);
}
