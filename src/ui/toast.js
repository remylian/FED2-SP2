
function ensureToastRoot() {
  let root = document.getElementById("toast-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "toast-root";
    root.className =
      "fixed inset-x-0 top-4 z-50 flex flex-col items-center space-y-2 px-4 sm:items-end";
    root.setAttribute("aria-live", "polite");
    root.setAttribute("role", "status");
    document.body.appendChild(root);
  }
  return root;
}

/**
 * Show a small toast for a moment.
 * @param {string} msg
 * @param {"success"|"error"|"info"} [type="success"]
 * @param {number} [duration=1800]
 */

export function showToast(msg, type = "success", duration = 1800) {
  const root = ensureToastRoot();

  const palette = {
    success: "border-emerald-200 text-emerald-900 bg-white dark:bg-gray-900 dark:text-emerald-100 dark:border-emerald-800",
    error:   "border-red-200 text-red-900 bg-white dark:bg-gray-900 dark:text-red-100 dark:border-red-800",
    info:    "border-gray-200 text-gray-900 bg-white dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700",
  }[type];

  const el = document.createElement("div");
  el.className =
    `pointer-events-auto rounded-lg border px-3 py-2 shadow transition
     opacity-0 translate-y-2 ${palette}`;
  el.textContent = msg;

  root.appendChild(el);
  // enter
  requestAnimationFrame(() => {
    el.classList.remove("opacity-0", "translate-y-2");
    el.classList.add("opacity-100", "translate-y-0");
  });

  // leave
  setTimeout(() => {
    el.classList.remove("opacity-100", "translate-y-0");
    el.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => el.remove(), 200);
  }, duration);
}
