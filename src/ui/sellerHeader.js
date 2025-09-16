
/**
 * Render the seller header section (banner, avatar, name, email, bio heading/body).
 * Accepts string or { url } shape for media.
 * @param {any} p
 * @returns {void}
 */

export function renderSellerHeader(p) {
  const bannerUrl = typeof p?.banner === "string" ? p.banner : (p?.banner?.url || "");
  const avatarUrl = typeof p?.avatar === "string" ? p.avatar : (p?.avatar?.url || "");
  const name = p?.name || "Seller";
  const email = p?.email || "—";
  const bio = p?.bio || "";

  const bannerEl = document.getElementById("seller-banner");
  const avatarEl = document.getElementById("seller-avatar");
  const nameEl = document.getElementById("seller-name");
  const emailEl = document.getElementById("seller-email");
  const bioHeadingEl = document.getElementById("seller-bio-heading");
  const bioEl = document.getElementById("seller-bio");
  const listHeadingEl = document.getElementById("seller-listings-heading");

  if (bannerEl) bannerEl.style.backgroundImage = bannerUrl ? `url("${bannerUrl}")` : "";
  if (avatarEl) avatarEl.src = avatarUrl || "";
  if (nameEl) nameEl.textContent = name;
  if (emailEl) emailEl.textContent = email;
  if (bioHeadingEl) bioHeadingEl.textContent = "Bio";
  if (bioEl) bioEl.textContent = bio || "No bio yet.";
  if (listHeadingEl) listHeadingEl.textContent = `${name}’s listings`;
}
