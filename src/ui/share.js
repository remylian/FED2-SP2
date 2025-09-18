
import { showToast } from "./toast.js";

/**
 * Wire a button to copy a URL/text to clipboard.
 * Falls back to prompt on older browsers.
 * @param {string} buttonId
 * @param {string|(() => string)} [textOrFn] defaults to location.href
 */

export function wireCopyShare(buttonId, textOrFn) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;

  const getText = () =>
    typeof textOrFn === "function" ? textOrFn() : (textOrFn || location.href);

  btn.addEventListener("click", async () => {
    const text = getText();
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        showToast("Link copied");
      } else {
        // fallback
        window.prompt("Copy this link:", text);
        showToast("Copy the link shown", "info");
      }
    } catch {
      showToast("Could not copy link", "error");
    }
  });
}
