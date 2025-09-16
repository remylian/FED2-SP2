/**
 * @module utils/dates
 * Lightweight date utilities shared across pages.
 */

/**
 * Readable "ends in" label like "in 3h 12m" or "Ended".
 * Keeps labels short for cards.
 * @param {string|undefined|null} iso - ISO datetime string
 * @returns {string}
 */

export function formatEndsIn(iso) {
  const end = new Date(iso || "");
  const now = new Date();
  if (!iso || isNaN(end.getTime())) return "Ends unknown";
  const diff = end.getTime() - now.getTime();
  if (diff <= 0) return "Ended";
  const mins = Math.floor(diff / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h >= 24) {
    const d = Math.floor(h / 24);
    return `in ${d}d ${h % 24}h`;
  }
  if (h > 0) return `in ${h}h ${m}m`;
  return `in ${m}m`;
}

/**
 * Locale date-time for meta text and detail pages.
 * @param {string|undefined|null} iso
 * @returns {string}
 */

export function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

/**
 * Convert `<input type="datetime-local">` value to ISO.
 * @param {string} dtLocal
 * @returns {string|null}
 */

export function localToISO(dtLocal) {
  if (!dtLocal) return null;
  const d = new Date(dtLocal);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * Convert ISO to `YYYY-MM-DDThh:mm` for `<input type="datetime-local">`.
 * @param {string} iso
 * @returns {string}
 */

export function isoToLocalInput(iso) {
  const d = new Date(iso || "");
  if (isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
