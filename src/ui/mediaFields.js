
/**
 * Create one media row with URL + alt text.
 * @param {{url?: string, alt?: string}} [initial]
 * @returns {HTMLElement}
 */

export function createMediaRow(initial = {}) {
  const { url = "", alt = "" } = initial;

  const row = document.createElement("div");
  row.className = "media-row flex flex-col sm:flex-row gap-2 items-start";

  row.innerHTML = `
    <div class="flex-1 w-full">
      <label class="block text-xs text-gray-600 mb-1">Image URL</label>
      <input name="media" type="url" placeholder="https://…"
             value="${url}"
             class="w-full rounded-lg border px-3 py-2"
             required>
    </div>
    <div class="flex-1 w-full">
      <label class="block text-xs text-gray-600 mb-1">Alt text</label>
      <input name="alt" type="text" placeholder="Describe the image"
             value="${alt}"
             class="w-full rounded-lg border px-3 py-2">
    </div>
    <button type="button"
            class="media-remove mt-1 sm:mt-6 rounded-lg border px-3 py-2 text-sm hover:bg-gray-100"
            aria-label="Remove image">Remove</button>
  `;

  row.querySelector(".media-remove")?.addEventListener("click", () => row.remove());
  return row;
}

/**
 * Ensure there's at least one media row present.
 * @param {string} [listId="media-list"]
 */

export function ensureAtLeastOneMediaRow(listId = "media-list") {
  const list = document.getElementById(listId);
  if (!list) return;
  if (!list.querySelector(".media-row")) {
    list.appendChild(createMediaRow({ url: "", alt: "" }));
  }
}

/**
 * Collect valid media rows as { url, alt }.
 * Filters out rows without a valid absolute URL.
 * @param {string} [listId="media-list"]
 * @returns {{url:string, alt:string}[]}
 */

export function collectMedia(listId = "media-list") {
  const list = document.getElementById(listId);
  if (!list) return [];
  const rows = Array.from(list.querySelectorAll(".media-row"));

  const out = [];
  for (const r of rows) {
    const url = String(r.querySelector('input[name="media"]')?.value || "").trim();
    const alt = String(r.querySelector('input[name="alt"]')?.value || "").trim();
    if (!url) continue;
    try {
      new URL(url); // ensure absolute URL
      out.push({ url, alt });
    } catch {
      // ignore invalid URLs
    }
  }
  return out;
}
