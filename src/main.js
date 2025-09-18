import "./style.css";
import { initHeader } from "./ui/header.js";
import { startCountdownLoop } from "./ui/countdown.js";

// robust route detection
function getSlug() {
  // e.g. "/", "/index", "/index.html", "/create-listing", "/create-listing.html"
  let p = window.location.pathname.toLowerCase();
  if (p === "/" || p.endsWith("/")) p += "index.html";
  const last = p.split("/").pop();         // "index.html" or "create-listing"
  return last.replace(/\.html$/, "");      // -> "index", "create-listing"
}

const slug = getSlug();

// Init header + global widgets on every page
initHeader();
startCountdownLoop();

// Map slugs to page modules
const routes = {
  index: "./pages/index.js",
  login: "./pages/login.js",
  register: "./pages/register.js",
  listing: "./pages/listing.js",
  profile: "./pages/profile.js",
  seller: "./pages/seller.js",
  "create-listing": "./pages/create-listing.js",
  "edit-listing": "./pages/edit-listing.js",
  "edit-profile": "./pages/edit-profile.js",
};

// Dynamic import if we have a match
if (routes[slug]) {
  import(routes[slug]);
}

if (import.meta.env.DEV) {
  console.log("Auction House initialized, slug:", slug);
}
