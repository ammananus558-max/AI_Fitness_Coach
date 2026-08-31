/* ============================================================
   AI FITNESS COACH — AUTH HELPERS
   Shared logic for login / signup / welcome pages.
   Depends on: utils.js, firebase-auth.js, firebase-db.js, app.js
   ============================================================ */

/**
 * Post-auth routing: reads profileCompleted and redirects accordingly.
 */
window.afcAfterAuthRoute = async function (user) {
  try {
    var data = await afcDbGet("users/" + user.uid);
    if (!data || !data.profileCompleted) {
      location.href = "onboarding.html";
    } else {
      location.href = "dashboard.html";
    }
  } catch (e) {
    location.href = "onboarding.html";
  }
};

/**
 * Bind a Google sign-in button.
 * @param {string} buttonSel - CSS selector for the button element.
 */
window.afcBindGoogle = function (buttonSel) {
  var btn = qs(buttonSel);
  if (!btn) return;
  btn.addEventListener("click", async function () {
    afcBusy(btn, true, "Signing in...");
    try {
      var result = await afcGoogleSignIn();
      await afcAfterAuthRoute(result.user);
    } catch (err) {
      afcBusy(btn, false);
      afcToast(afcFriendlyAuthError(err), "error");
    }
  });
};
