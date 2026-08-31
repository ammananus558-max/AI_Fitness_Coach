/* ============================================================
   AI FITNESS COACH — THEME (light / dark)
   Applies instantly from localStorage to avoid flash; syncs to
   users/{uid}/settings/theme when a session exists.
   Include this script in <head>.
   ============================================================ */

(function () {
  const saved = localStorage.getItem("afc-theme");
  const initial = saved || "dark";
  apply(initial);

  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-bs-theme", theme);
  }

  window.afcApplyTheme = apply;

  window.afcCurrentTheme = function () {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  };

  window.afcToggleTheme = async function () {
    const next = afcCurrentTheme() === "dark" ? "light" : "dark";
    apply(next);
    localStorage.setItem("afc-theme", next);
    // Persist for the signed-in user (best effort).
    try {
      if (window.AFC_SESSION && window.afcUserSet) {
        await afcUserSet("settings/theme", next);
      }
    } catch (e) { /* non-fatal */ }
    document.querySelectorAll("[data-theme-icon]").forEach(function (el) {
      el.className = el.className.replace(/\bbi-(moon-stars-fill|sun-fill)\b/, "")
        .replace(/\s{2,}/g, " ").trim();
      el.classList.add(next === "dark" ? "bi-sun-fill" : "bi-moon-stars-fill");
    });
  };

  /* Load the user's saved theme once auth is ready. */
  window.afcSyncUserTheme = async function () {
    try {
      if (!window.afcUserGet) return;
      const t = await afcUserGet("settings/theme");
      if (t === "dark" || t === "light") {
        apply(t);
        localStorage.setItem("afc-theme", t);
      }
    } catch (e) { /* non-fatal */ }
  };
})();
