
import { getSession } from "../utils/session.js";
import { getProfile } from "../api/profile.js";
import { prefillEditProfileForm, wireEditProfileForm } from "../ui/editProfileForm.js";
import { handleError } from "../utils/handleError.js";

/**
 * Entry point: guard -> load profile -> prefill -> wire submit.
 * @returns {Promise<void>}
 */

async function initEditProfilePage() {
  const { user } = getSession();
  const feedback = document.getElementById("profile-feedback");

  if (!user?.name) {
    // Not logged in -> go to login
    window.location.assign("/login.html");
    return;
  }

  // Load current profile to prefill
  const [p, err] = await handleError(getProfile(user.name));
  if (err) {
    if (feedback) {
      feedback.textContent = "Failed to load profile.";
      feedback.classList.add("text-red-600");
    }
    return;
  }

  prefillEditProfileForm(p);
  wireEditProfileForm({
    name: user.name,
    onSuccess: () => window.location.assign("/profile.html"),
  });
}

initEditProfilePage();
