// src/pages/auth.js
import { login, register, createApiKey } from "../api/auth.js";
import { saveSession } from "../utils/session.js";
import { refreshCreditsFromServer } from "../utils/credits.js";
import { makeFeedback, makeLoading } from "../ui/feedback.js";
import { isNoroffStudentEmail } from "../utils/validators.js";
import { initHeader } from "../ui/header.js";

/**
 * Wire the Login form:
 * - Basic field checks
 * - Login → ensure API key → save session → refresh credits → redirect
 * - Inline feedback + loading via ui/feedback.js
 * @returns {void}
 */
function wireLogin() {
  const form = document.getElementById("login-form");
  if (!form) return;

  const feedback = makeFeedback("login-feedback");
  const setLoading = makeLoading("login-submit", "login-spinner");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    feedback("");
    setLoading(true);

    try {
      const fd = new FormData(form);
      const email = String(fd.get("email") || "").trim();
      const password = String(fd.get("password") || "");

      if (!email || !password) {
        feedback("Please enter your email and password.");
        return;
      }

      // 1) Login -> token + identity
      const { accessToken, name, avatar, email: respEmail } = await login(email, password);

      // 2) API key: reuse or create
      let apiKey = localStorage.getItem("auth.apiKey") || "";
      if (!apiKey) {
        apiKey = await createApiKey(accessToken);
      }

      // 3) Save session (credits=0 for now), then refresh credits centrally
      saveSession({ accessToken, apiKey, name, email: respEmail || email, avatar, credits: 0 });
      await refreshCreditsFromServer();

      initHeader();
      window.location.assign("/index.html");
    } catch (err) {
      const msg = err?.body?.errors?.[0]?.message || err?.body?.message || err?.message || "Login failed.";
      feedback(msg, "error");
    } finally {
      setLoading(false);
    }
  });
}

/**
 * Wire the Register form (then auto-login):
 * - Enforces @stud.noroff.no
 * - Registers → logs in → ensures API key → saves session → refresh credits
 * @returns {void}
 */
function wireRegister() {
  const form = document.getElementById("register-form");
  if (!form) return;

  const feedback = makeFeedback("register-feedback");
  const setLoading = makeLoading("register-submit", "register-spinner");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    feedback("");
    setLoading(true);

    try {
      const fd = new FormData(form);
      const name = String(fd.get("name") || "").trim();
      const email = String(fd.get("email") || "").trim();
      const password = String(fd.get("password") || "");

      if (!name || !email || !password) {
        feedback("Please fill out all fields.");
        return;
      }
      if (!isNoroffStudentEmail(email)) {
        feedback("Use your @stud.noroff.no email.");
        return;
      }

      // 1) Register
      await register({ name, email, password });

      // 2) Auto-login
      const { accessToken, avatar } = await login(email, password);

      // 3) API key: reuse or create
      let apiKey = localStorage.getItem("auth.apiKey") || "";
      if (!apiKey) {
        apiKey = await createApiKey(accessToken);
      }

      saveSession({ accessToken, apiKey, name, email, avatar, credits: 0 });
      await refreshCreditsFromServer();

      feedback("Account created! Redirecting…", "success");
      initHeader();
      setTimeout(() => window.location.assign("/profile.html"), 400);
    } catch (err) {
      const msg = err?.body?.errors?.[0]?.message || err?.body?.message || err?.message || "Registration failed.";
      feedback(msg, "error");
    } finally {
      setLoading(false);
    }
  });
}

/** Entry point: wire whichever form exists on this page. */
(function initAuthPage() {
  wireLogin();
  wireRegister();
})();
