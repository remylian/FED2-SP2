import { normalizeMedia } from "../utils/media.js";

/**
 * Render a responsive gallery into #listing-gallery.
 * Accepts strings or {url,alt} media; filters out empty URLs.
 * @param {Array<string|{url?:string,alt?:string}>} media
 * @returns {void}
 */

export function renderGallery(media = []) {
  const wrap = document.getElementById("listing-gallery");
  if (!wrap) return;
  wrap.innerHTML = "";

  const imgs = normalizeMedia(media);
  if (imgs.length === 0) {
    wrap.innerHTML = `<div class="col-span-full grid place-items-center text-sm text-gray-500 h-48">No images</div>`;
    return;
  }

  for (const { url, alt } of imgs) {
    const div = document.createElement("div");
    div.className = "aspect-square overflow-hidden rounded-lg bg-gray-200";
    div.innerHTML = `<img src="${url}" alt="${alt || ""}" class="h-full w-full object-cover" />`;
    wrap.appendChild(div);
  }
}
