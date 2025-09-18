import { register, login, createApiKey } from "../api/auth.js";
import { saveSession } from "../utils/session.js";
import { refreshCreditsFromServer } from "../utils/credits.js";
import { makeFeedback, makeLoading } from "../ui/feedback.js";
import { attachFieldValidation, rules } from "../ui/validation.js";
import { initHeader } from "../ui/header.js";

/**
 * Wire the Register page if #register-form exists.
 * - Live field validation (name/email/password)
 * - On submit: register → auto-login → API key → saveSession (old shape) → credits refresh → header update → redirect
 * @returns {void}
 */

(function wireRegister() {
  const form = document.getElementById("register-form");
  if (!form) return;

  const feedback = makeFeedback("register-feedback");
  const setLoading = makeLoading("register-submit", "register-spinner");

  const nameRun = attachFieldValidation(
    (document.getElementById("register-name")),
    document.getElementById("register-name-error"),
    [rules.required("Name"), rules.minLen(2)]
  );

  const emailRun = attachFieldValidation(
    (document.getElementById("register-email")),
    document.getElementById("register-email-error"),
    [rules.required("Email"), rules.email(), rules.noroff()]
  );

  const passRun = attachFieldValidation(
    (document.getElementById("register-password")),
    document.getElementById("register-password-error"),
    [rules.required("Password"), rules.minLen(8)]
  );

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    feedback("");
    setLoading(true);

    const ok = nameRun() & emailRun() & passRun();
    if (!ok) {
      setLoading(false);
      return;
    }

    try {
      const fd = new FormData(form);
      const name = String(fd.get("name") || "").trim();
      const email = String(fd.get("email") || "").trim();
      const password = String(fd.get("password") || "");

      await register({ name, email, password });

      // Auto-login after successful registration
      const auth = await login(email, password);
      const token = auth?.accessToken || "";
      const apiKey = await createApiKey(token);

      // SAVE 
      saveSession({
        accessToken: token,
        apiKey,
        name: auth?.name || name,
        email: auth?.email || email,
        avatar: auth?.avatar ?? null,
        credits: 0,
      });

      await refreshCreditsFromServer();
      initHeader();

      feedback("Account created. You’re now logged in.", "success");
      const next = new URLSearchParams(location.search).get("next");
      window.location.assign(next || "/profile.html");
    } catch (err) {
      const msg =
        err?.body?.errors?.[0]?.message ||
        err?.body?.message ||
        err?.message ||
        "Registration failed. Please try again.";
      feedback(msg, "error");
    } finally {
      setLoading(false);
    }
  });
})();
