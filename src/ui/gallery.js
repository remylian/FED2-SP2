// src/ui/gallery.js

/**
 * Render a simple gallery from media items ({ url, alt } or string).
 * Looks for #listing-gallery first (HTML), then #gallery as a fallback.
 * Supports optional data-ratio on the container: "square" | "4/3" | "3/2".
 * @param {Array<string|{url:string, alt?:string}>} media
 * @returns {void}
 */
export function renderGallery(media = []) {
  const wrap =
    document.getElementById("listing-gallery") ||
    document.getElementById("gallery");
  if (!wrap) return;

  wrap.innerHTML = "";

  const items = Array.isArray(media) ? media : [];
  if (items.length === 0) {
    const ph = document.createElement("div");
    ph.className = "aspect-[4/3] rounded-lg bg-gray-200";
    wrap.appendChild(ph);
    return;
  }

  // Choose aspect ratio: default 4:3 (nicer for listings).
  const ratioAttr = (wrap.dataset.ratio || "4/3").trim();
  const ratioClass =
    ratioAttr === "square" ? "aspect-square"
    : ratioAttr === "3/2"   ? "aspect-[3/2]"
    :                         "aspect-[4/3]";

  for (const m of items) {
    const url = typeof m === "string" ? m : (m?.url || "");
    const alt = typeof m === "string" ? "" : (m?.alt || "Listing image");
    if (!url) continue;

    // Fixed-aspect tile + overflow crop
    const tile = document.createElement("div");
    tile.className = `${ratioClass} overflow-hidden rounded-lg bg-gray-200`;

    const img = document.createElement("img");
    img.src = url;
    img.alt = alt;
    img.loading = "lazy";
    img.decoding = "async";
    img.className = "block h-full w-full object-cover";

    tile.appendChild(img);
    wrap.appendChild(tile);
  }
}
