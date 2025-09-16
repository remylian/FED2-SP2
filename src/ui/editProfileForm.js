
import { makeFeedback, makeLoading } from "./feedback.js";
import { updateProfile } from "../api/profile.js";
import { initHeader } from "./header.js";

/**
 * Prefill the Edit Profile form from a profile object.
 * @param {any} p
 * @returns {void}
 */

export function prefillEditProfileForm(p) {
  const avatarUrl = typeof p?.avatar === "string" ? p.avatar : (p?.avatar?.url || "");
  const bannerUrl = typeof p?.banner === "string" ? p.banner : (p?.banner?.url || "");

  const bioEl = document.getElementById("profile-bio");
  const avatarEl = document.getElementById("profile-avatar-url");
  const bannerEl = document.getElementById("profile-banner-url");

  if (bioEl) bioEl.value = p?.bio || "";
  if (avatarEl) avatarEl.value = avatarUrl;
  if (bannerEl) bannerEl.value = bannerUrl;
}

/**
 * Wire the Edit Profile form: validate → PUT → sync header → redirect.
 * Uses #profile-feedback, #profile-save, #profile-spinner from the markup.
 * @param {{ name:string, onSuccess?: () => void }} opts
 * @returns {void}
 */

export function wireEditProfileForm({ name, onSuccess }) {
  const feedback = makeFeedback("profile-feedback");
  const setLoading = makeLoading("profile-save", "profile-spinner");
  const form = document.getElementById("profile-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    feedback("");
    setLoading(true);
    try {
      const fd = new FormData(form);
      const bio = String(fd.get("bio") || "");
      const avatar = String(fd.get("avatar") || "");
      const banner = String(fd.get("banner") || "");

      await updateProfile(name, { bio, avatar, banner });

      // Sync avatar in localStorage so header picks it up immediately
      try {
        const stored = JSON.parse(localStorage.getItem("auth.user") || "{}");
        stored.avatar = avatar ? { url: avatar } : stored.avatar ?? null;
        localStorage.setItem("auth.user", JSON.stringify(stored));
      } catch { /* ignore */ }

      initHeader();
      feedback("Profile updated.", "success");

      if (typeof onSuccess === "function") onSuccess();
      else window.location.assign("/profile.html");
    } catch (err) {
      const msg = err?.body?.errors?.[0]?.message || err?.body?.message || err?.message || "Failed to save profile.";
      feedback(msg, "error");
    } finally {
      setLoading(false);
    }
  });
}
