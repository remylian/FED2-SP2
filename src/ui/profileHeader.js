/**
 * Render the profile header (name, email, avatar, banner, credits, bio).
 * Works with v2 shapes (string or {url, alt}).
 * @param {any} p
 * @returns {void}
 */

export function renderProfileHeader(p) {
  const avatarUrl = typeof p?.avatar === "string" ? p.avatar : (p?.avatar?.url || "");
  const bannerUrl = typeof p?.banner === "string" ? p.banner : (p?.banner?.url || "");
  const bio = p?.bio || "";

  const nameEl = document.getElementById("profile-name");
  const emailEl = document.getElementById("profile-email");
  const avatarEl = document.getElementById("profile-avatar");
  const bannerEl = document.getElementById("profile-banner");
  const creditsEl = document.getElementById("profile-credits");
  const bioOut = document.getElementById("profile-bio-display");

  if (nameEl) nameEl.textContent = p?.name ?? "User";
  if (emailEl) emailEl.textContent = p?.email ?? "—";
  if (avatarEl) avatarEl.src = avatarUrl || "";
  if (bannerEl) bannerEl.style.backgroundImage = bannerUrl ? `url("${bannerUrl}")` : "";
  if (creditsEl) creditsEl.textContent = `${p?.credits ?? 0} credits`;
  if (bioOut) bioOut.textContent = bio || "No bio yet.";
}
