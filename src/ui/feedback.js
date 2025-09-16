/**
 * @module ui/feedback
 * Consistent inline feedback + loading toggles.
 */

/**
 * Create a feedback setter that updates an element's text and color.
 * @param {string} elementId
 * @returns {(msg: string, type?: "error"|"success") => void}
 */

export function makeFeedback(elementId) {
  const el = document.getElementById(elementId);
  return (msg, type = "error") => {
    if (!el) return;
    el.textContent = msg || "";
    el.classList.toggle("text-red-600", type === "error");
    el.classList.toggle("text-emerald-600", type === "success");
  };
}

/**
 * Create a loading toggle for a button + spinner pair.
 * @param {string} buttonId
 * @param {string} spinnerId
 * @returns {(loading: boolean) => void}
 */

export function makeLoading(buttonId, spinnerId) {
  const btn = document.getElementById(buttonId);
  const spin = document.getElementById(spinnerId);
  return (loading) => {
    if (btn) btn.disabled = !!loading;
    if (spin) spin.classList.toggle("hidden", !loading);
  };
}
