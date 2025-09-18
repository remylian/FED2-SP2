// src/ui/countdown.js

/**
 * Format remaining ms as a short "Xd Xh Xm", "Xh Xm", "Xm Xs" or "Xs".
 * @param {number} ms
 * @returns {string}
 */
function fmtLeft(ms) {
  if (ms <= 0) return "Ended";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

/**
 * Update one countdown element.
 * Adds urgency tint on its nearest .countdown-pill:
 *  - < 1h: red
 *  - < 24h: amber
 *  - else: gray
 * @param {HTMLElement} el
 * @returns {boolean} alive
 */
function updateOne(el) {
  const iso = el.getAttribute("data-ends");
  if (!iso) return false;
  const end = new Date(iso).getTime();
  const now = Date.now();
  const left = end - now;

  el.textContent = left <= 0 ? "Ended" : fmtLeft(left);

  const pill = el.closest(".countdown-pill");
  if (pill) {
    pill.classList.remove(
      "bg-gray-100","text-gray-700",
      "bg-amber-100","text-amber-800",
      "bg-red-100","text-red-800",
      "bg-gray-300","text-gray-600"
    );
    if (left <= 0) {
      pill.classList.add("bg-gray-300","text-gray-600");
    } else if (left < 3600_000) {
      pill.classList.add("bg-red-100","text-red-800");
    } else if (left < 86_400_000) {
      pill.classList.add("bg-amber-100","text-amber-800");
    } else {
      pill.classList.add("bg-gray-100","text-gray-700");
    }
  }
  return left > 0;
}

/**
 * Scan and update all current countdown nodes once.
 * @returns {boolean} anyAlive
 */
function tickAll() {
  let alive = false;
  document.querySelectorAll("[data-countdown][data-ends]").forEach((n) => {
    alive ||= updateOne(n);
  });
  return alive;
}

/**
 * Manual initializer (one-time + interval that stops when all end).
 * Call this after you render a batch of cards or the listing page.
 * @param {number} [intervalMs=1000]
 */
export function initCountdowns(intervalMs = 1000) {
  // first paint
  tickAll();
  // keep updating until everything ends
  const t = setInterval(() => {
    const alive = tickAll();
    if (!alive) clearInterval(t);
  }, intervalMs);
}

/**
 * Fire-and-forget loop: checks the DOM every second for any countdowns.
 * Use this if you’d rather not remember to call initCountdowns()
 * after each render. Cheap enough for this app size.
 * @param {number} [intervalMs=1000]
 */
export function startCountdownLoop(intervalMs = 1000) {
  // Paint immediately, then keep updating
  tickAll();
  setInterval(tickAll, intervalMs);
}
