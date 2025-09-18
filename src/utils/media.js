// src/utils/media.js

/**
 * Normalize media to [{ url, alt }]
 * @param {any} media
 * @returns {{url:string, alt:string}[]}
 */
export function normalizeMedia(media) {
  if (!Array.isArray(media)) return [];
  return media
    .map((m) => {
      if (typeof m === "string") return { url: m, alt: "" };
      return { url: m?.url || "", alt: m?.alt || "" };
    })
    .filter((m) => !!m.url);
}
