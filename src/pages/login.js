import { login, createApiKey } from "../api/auth.js";
import { saveSession } from "../utils/session.js";
import { refreshCreditsFromServer } from "../utils/credits.js";
import { makeFeedback, makeLoading } from "../ui/feedback.js";
import { attachFieldValidation, rules } from "../ui/validation.js";
import { initHeader } from "../ui/header.js";

/**
 * Wire the Login page if #login-form exists.
 * - Live field validation (email/password)
 * - On submit: API login -> API key -> saveSession (old shape) -> credits refresh -> header update -> redirect
 * @returns {void}
 */

(function wireLogin() {
  const form = document.getElementById("login-form");
  if (!form) return;

  const feedback = makeFeedback("login-feedback");
  const setLoading = makeLoading("login-submit", "login-spinner");

  const emailRun = attachFieldValidation(
    (document.getElementById("login-email")),
    document.getElementById("login-email-error"),
    [rules.required("Email"), rules.email(), rules.noroff()]
  );

  const passRun = attachFieldValidation(
    (document.getElementById("login-password")),
    document.getElementById("login-password-error"),
    [rules.required("Password"), rules.minLen(8)]
  );

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    feedback("");
    setLoading(true);

    const ok = emailRun() & passRun(); // run both validators
    if (!ok) {
      setLoading(false);
      return;
    }

    try {
      const fd = new FormData(form);
      const email = String(fd.get("email") || "").trim();
      const password = String(fd.get("password") || "");

      // Login -> token + user
      const auth = await login(email, password);
      const token = auth?.accessToken || "";

      // Issue API key using the fresh token
      const apiKey = await createApiKey(token);

      // SAVE 
      saveSession({
        accessToken: token,
        apiKey,
        name: auth?.name || "",
        email: auth?.email || email,
        avatar: auth?.avatar ?? null,
        credits: 0, // will refresh next
      });

      await refreshCreditsFromServer();
      initHeader();

      feedback("Logged in.", "success");
      const next = new URLSearchParams(location.search).get("next");
      window.location.assign(next || "/profile.html");
    } catch (err) {
      const msg =
        err?.body?.errors?.[0]?.message ||
        err?.body?.message ||
        err?.message ||
        "Login failed. Please try again.";
      feedback(msg, "error");
    } finally {
      setLoading(false);
    }
  });
})();
