/* ============================================================
   AI FITNESS COACH — SETTINGS PAGE
   Theme toggle, account info, preferences, data management.
   ============================================================ */
(async function () {
  let session;
  try { session = await requireAuth(); } catch (e) { return; }
  afcMountLayout("settings");

  var profile = session.profile || {};
  var user = session.user || {};

  /* ---- Account display ---- */
  qs("#settingsName").textContent = profile.name || user.displayName || "—";
  qs("#settingsEmail").textContent = profile.email || user.email || "—";

  /* ---- Theme switch ---- */
  var themeSwitch = qs("#themeSwitch");
  themeSwitch.checked = afcCurrentTheme() === "dark";
  themeSwitch.addEventListener("change", async function () {
    await afcToggleTheme();
    themeSwitch.checked = afcCurrentTheme() === "dark";
  });

  /* ---- Water goal (read-only from settings) ---- */
  try {
    var wg = await afcDbGet("settings/waterGoal");
    if (wg && Number(wg) > 0) {
      qs("#settingsWaterGoal").textContent = Number(wg) + " glasses";
    }
  } catch (e) { /* keep default */ }

  /* ---- Trial info ---- */
  try {
    var info = await afcTrialInfo();
    if (info) {
      var trialText = afcFmtDate(info.trial.startDate) + " — " + afcFmtDate(info.trial.endDate);
      if (info.active) {
        trialText += " (Day " + info.dayNum + " of " + info.totalDays + ")";
      } else {
        trialText += " (Expired)";
      }
      qs("#settingsTrialInfo").textContent = trialText;
    } else {
      qs("#settingsTrialInfo").textContent = "No trial data found.";
    }
  } catch (e) {
    qs("#settingsTrialInfo").textContent = "Could not load trial info.";
  }

  /* ---- Reset my data ---- */
  qs("#resetDataBtn").addEventListener("click", async function () {
    var ok = await afcConfirm({
      title: "Reset My Data?",
      body: "This will delete your daily logs, progress records, and before/after photos. Your profile and goals will be kept.",
      okText: "Reset Data",
      danger: true
    });
    if (!ok) return;
    afcLoader("Resetting data...");
    try {
      var uid = afcUid();
      await Promise.all([
        afcDbRemove("users/" + uid + "/daily"),
        afcDbRemove("users/" + uid + "/progress"),
        afcDbRemove("users/" + uid + "/beforeAfter")
      ]);
      afcToast("Data reset successfully.", "success");
    } catch (e) {
      afcToast("Could not reset data. Please try again.", "error");
    } finally {
      afcLoaderOff();
    }
  });

  /* ---- Logout ---- */
  qs("#logoutBtn").addEventListener("click", async function () {
    var ok = await afcConfirm({
      title: "Log out?",
      body: "You can log back in any time.",
      okText: "Logout",
      danger: true
    });
    if (!ok) return;
    afcLoader("Logging out...");
    try { await afcSignOut(); } catch (e) { /* ignore */ }
    location.href = "login.html";
  });
})();
