
import { getSession } from "../utils/session.js";
import { wireCreateListingForm } from "../ui/createListingForm.js";

/**
 * Require a logged-in session with API key; otherwise redirect to login.
 * @returns {boolean} true if allowed to continue
 */

function guardAuth() {
  const { token, apiKey } = getSession();
  if (!token || !apiKey) {
    window.location.assign("/login.html");
    return false;
  }
  return true;
}

/**
 * Entry point: auth guard → wire form → redirect on success.
 */

function initCreateListingPage() {
  if (!guardAuth()) return;

  wireCreateListingForm({
    onSuccess: (id) => window.location.assign(`/listing.html?id=${encodeURIComponent(id)}`),
  });
}

initCreateListingPage();
