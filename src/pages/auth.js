import { postJSON, getJSON } from "../api/client.js";
import { handleError } from "../utils/handleError.js";
import {
  AUTH_LOGIN,
  AUTH_REGISTER,
  AUTH_CREATE_API_KEY,
  PROFILE_URL,
} from "../config/endpoints.js";

/**
 * Persist minimal auth session.
 * @param {{ accessToken: string, name: string, email?: string, avatar?: any, credits?: number, apiKey?: string }} payload
 */
function saveSession(payload) {
  const { accessToken, name, email = "", avatar = null, credits = 0, apiKey = "" } = payload;
  localStorage.setItem("auth.token", accessToken);
  if (apiKey) localStorage.setItem("auth.apiKey", apiKey); // ← store only when present
  localStorage.setItem("auth.user", JSON.stringify({ name, email, avatar, credits }));
  localStorage.setItem("auth.timestamp", new Date().toISOString());
}

/**
 * Create a Noroff API key for authoritative actions.
 * Requires a valid Bearer token.
 * @param {string} token
 * @returns {Promise<string>} - API key string or empty string on failure
 */

async function createApiKey(token) {
  // The API expects a small payload with a name/label for the key.
  const payload = { name: "auction-house-key" };
  const [res, err] = await handleError(postJSON(AUTH_CREATE_API_KEY, payload, { token }));
  if (err) {
    console.warn("Failed to create API key:", err);
    return "";
  }
  // Common responses: { data: { key: "…" } } or { key: "…" }
  const key = res?.data?.key ?? res?.key ?? "";
  return typeof key === "string" ? key : "";
}


/**
 * Fetch latest credits for a user after login.
 * @param {string} name - profile handle
 * @param {string} token - bearer token
 * @param {string} [apiKey] - Noroff API key (optional but recommended)
 * @returns {Promise<number>} - credits value or 0
 */

async function fetchCredits(name, token, apiKey) {
  const url = PROFILE_URL(name);
  const [data, error] = await handleError(getJSON(url, { token, apiKey }));
  if (error) return 0;
  const credits = Number(data?.data?.credits ?? 0);
  return Number.isFinite(credits) ? credits : 0;
}

/**
 * Toggle button loading state and spinner visibility.
 * @param {HTMLButtonElement} btn
 * @param {HTMLElement} spinner
 * @param {boolean} isLoading
 */

function setLoading(btn, spinner, isLoading) {
  btn.disabled = isLoading;
  if (spinner) spinner.classList.toggle("hidden", !isLoading);
}

/**
 * Show inline feedback text (error or success).
 * @param {HTMLElement} el
 * @param {string} message
 * @param {"error"|"success"} [type="error"]
 */

function showFeedback(el, message, type = "error") {
  if (!el) return;
  el.textContent = message;
  el.classList.toggle("text-red-600", type === "error");
  el.classList.toggle("text-emerald-600", type === "success");
}

/**
 * Basic client-side guard for Noroff student emails.
 * Server still performs authoritative validation.
 * @param {string} email
 * @returns {boolean}
 */

function isNoroffStudentEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@stud\.noroff\.no$/.test(email.trim());
}

/**
 * Initialize auth page: binds submit handlers for Login and Register.
 */

function initAuthPage() {
  // --- Login wiring ---
  const loginForm = document.getElementById("login-form");
  const loginFeedback = document.getElementById("login-feedback");
  const loginBtn = document.getElementById("login-submit");
  const loginSpinner = document.getElementById("login-spinner");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      showFeedback(loginFeedback, "");
      setLoading(loginBtn, loginSpinner, true);

      const form = Object.fromEntries(new FormData(loginForm));
      const email = String(form.email || "").trim();
      const password = String(form.password || "");

      if (!email || !password) {
        showFeedback(loginFeedback, "Please enter your email and password.");
        setLoading(loginBtn, loginSpinner, false);
        return;
      }

      const [res, err] = await handleError(
        postJSON(AUTH_LOGIN, { email, password })
      );

      if (err) {
        // Try to surface API-provided message if present
        const apiMsg =
          (err.body && (err.body.errors?.[0]?.message || err.body.message)) ||
          err.message;
        showFeedback(loginFeedback, apiMsg || "Login failed. Please try again.");
        setLoading(loginBtn, loginSpinner, false);
        return;
      }

      // Expect accessToken + name from login response
      const accessToken = res?.data?.accessToken || res?.accessToken;
      const name = res?.data?.name || res?.name;
      const avatar = res?.data?.avatar ?? res?.avatar ?? null;
      if (!accessToken || !name) {
        showFeedback(loginFeedback, "Login response was missing required fields.");
        setLoading(loginBtn, loginSpinner, false);
        return;
      }

  
  // Reuse existing API key if available; otherwise create one
  const existingApiKey = localStorage.getItem("auth.apiKey") || "";
  const apiKey = existingApiKey || await createApiKey(accessToken);

  // Fetch credits (profile) after login
  const credits = await fetchCredits(name, accessToken, apiKey);
// Save everything once 
saveSession({ accessToken, name, email, avatar, credits, apiKey });

// Redirect to profile
window.location.assign("/profile.html");
    });
  }

  // --- Register wiring ---
  const registerForm = document.getElementById("register-form");
  const registerFeedback = document.getElementById("register-feedback");
  const registerBtn = document.getElementById("register-submit");
  const registerSpinner = document.getElementById("register-spinner");

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      showFeedback(registerFeedback, "");
      setLoading(registerBtn, registerSpinner, true);

     
      const form = Object.fromEntries(new FormData(registerForm));
      const name = String(form.name || "").trim();
      const email = String(form.email || "").trim();
      const password = String(form.password || "");

      if (!name || !email || !password) {
        showFeedback(registerFeedback, "Please fill in all required fields.");
        setLoading(registerBtn, registerSpinner, false);
        return;
      }
      if (!isNoroffStudentEmail(email)) {
        showFeedback(
          registerFeedback,
          "Email must be a valid @stud.noroff.no address."
        );
        setLoading(registerBtn, registerSpinner, false);
        return;
      }

      const [res, err] = await handleError(
        postJSON(AUTH_REGISTER, { name, email, password })
      );

      if (err) {
        const apiMsg =
          (err.body && (err.body.errors?.[0]?.message || err.body.message)) ||
          err.message;
        showFeedback(
          registerFeedback,
          apiMsg || "Registration failed. Please check your details."
        );
        setLoading(registerBtn, registerSpinner, false);
        return;
      }

      // Success: inform and suggest login
      showFeedback(
        registerFeedback,
        "Account created. You may now log in.",
        "success"
      );

      // Optionally auto-fill login email
      const loginEmail = document.getElementById("login-email");
      if (loginEmail) loginEmail.value = email;

      setLoading(registerBtn, registerSpinner, false);
      // Optionally scroll to login
      document.getElementById("login-heading")?.scrollIntoView({ behavior: "smooth" });
    });
  }
}

// Initialize when this script is loaded on auth.html
initAuthPage();
