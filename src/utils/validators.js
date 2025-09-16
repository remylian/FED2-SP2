
/**
 * Basic client-side guard for Noroff student emails (server still validates).
 * @param {string} email
 * @returns {boolean}
 */

export function isNoroffStudentEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@stud\.noroff\.no$/.test(String(email).trim());
}

/**
 * Validate edit/create listing inputs.
 * @param {string} title
 * @param {string|null} endsAtISO
 * @returns {{ok:boolean, message?:string}}
 */

export function validateListingForm(title, endsAtISO) {
  if (!title) return { ok: false, message: "Title is required." };
  if (!endsAtISO) return { ok: false, message: "Please choose a valid end date/time." };
  const end = new Date(endsAtISO).getTime();
  if (!Number.isFinite(end) || end - Date.now() < 60_000) {
    return { ok: false, message: "End time must be in the future." };
  }
  return { ok: true };
}
