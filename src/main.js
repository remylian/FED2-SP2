import "./style.css";
import { initHeader } from "./ui/header.js";

const file = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();

// Init header on every page
initHeader();

if (file === "login.html" || file === "register.html") {
  import("./pages/auth.js");
}

// (later)
// if (file === "profile.html") import("./pages/profile.js");
// if (file === "listing.html") import("./pages/listing.js");

console.log("Auction House app initialized:", file);
