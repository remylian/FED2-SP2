/**
 * @module ui/mediaFields
 * Small helpers to render/manage media URL inputs used in create/edit listing.
 */

/**
 * Create a single media input row with remove button.
 * @param {string} [value=""]
 * @returns {HTMLElement}
 */

export function createMediaRow(value = "") {
  const row = document.createElement("div");
  row.className = "flex items-center gap-2";

  const input = document.createElement("input");
  input.type = "url";
  input.name = "media";
  input.placeholder = "https://…";
  input.className = "min-w-0 flex-1 rounded-lg border px-3 py-2 outline-none focus:ring";
  input.value = value;

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "media-remove rounded-lg border px-2 py-1 text-sm hover:bg-gray-50";
  removeBtn.textContent = "Remove";
  removeBtn.addEventListener("click", () => {
    row.remove();
    ensureAtLeastOneMediaRow();
  });

  row.append(input, removeBtn);
  return row;
}

/**
 * Ensure at least one media row exists.
 * @returns {void}
 */

export function ensureAtLeastOneMediaRow() {
  const list = document.getElementById("media-list");
  if (list && list.children.length === 0) {
    list.appendChild(createMediaRow(""));
  }
}

/**
 * Collect non-empty media URLs from the form.
 * @returns {string[]}
 */

export function collectMedia() {
  const list = document.getElementById("media-list");
  if (!list) return [];
  return Array.from(list.querySelectorAll('input[name="media"]'))
    .map((i) => String(i.value || "").trim())
    .filter((u) => u.length > 0);
}
