
import { isNoroffStudentEmail } from "../utils/validators.js";

/**
 * Attach live validation to an <input>, toggling error text and styles.
 * Returns a function that (re)validates the field on demand.
 *
 * @param {HTMLInputElement|null} input
 * @param {HTMLElement|null} errorEl
 * @param {Array<(value: string) => string>} checks - Return "" if OK, or an error message.
 * @returns {() => boolean} run
 */

export function attachFieldValidation(input, errorEl, checks = []) {
  if (!input) return () => true;

  const setErr = (msg) => {
    const hasError = !!msg;
    if (errorEl) {
      errorEl.textContent = msg || "";
      errorEl.classList.toggle("hidden", !hasError);
    }
    input.classList.toggle("border-red-500", hasError);
    input.classList.toggle("ring-1", hasError);
    input.classList.toggle("ring-red-500", hasError);
    input.setAttribute("aria-invalid", String(hasError));
  };

  const run = () => {
    const val = String(input.value || "");
    for (const fn of checks) {
      const msg = fn(val);
      if (msg) {
        setErr(msg);
        return false;
      }
    }
    setErr("");
    return true;
  };

  input.addEventListener("input", run);
  input.addEventListener("blur", run);
  return run;
}

/** Common, composable validation rules. */
export const rules = {
  required: (label = "This field") => (v) => (v.trim() ? "" : `${label} is required.`),
  email: () => (v) => (/\S+@\S+\.\S+/.test(v) ? "" : "Enter a valid email."),
  noroff: () => (v) => (isNoroffStudentEmail(v) ? "" : "Use your @stud.noroff.no email."),
  minLen: (n) => (v) => (v.length >= n ? "" : `Must be at least ${n} characters.`),
};
