import "./style.css";
import { initHeader } from "./ui/header.js";
import { startCountdownLoop } from "./ui/countdown.js";

const file = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();

// Init header on every page
initHeader();
startCountdownLoop();

if (file === "login.html") {
  import("./pages/login.js");
}

if (file === "register.html") {
  import("./pages/register.js");
}

if (file === "index.html") {
  import("./pages/index.js");
}

if (file === "listing.html") {
  import("./pages/listing.js");
}

if (file === "profile.html") {
  import("./pages/profile.js");
}

if (file === "create-listing.html") {
  import("./pages/create-listing.js");
}

if (file === "edit-profile.html") {
  import("./pages/edit-profile.js");
}

if (file === "edit-listing.html") {
  import("./pages/edit-listing.js");
}

if (file === "seller.html") {
  import("./pages/seller.js");
}


if (import.meta.env.DEV) {
  console.log("Auction House app initialized:", file);
}
 