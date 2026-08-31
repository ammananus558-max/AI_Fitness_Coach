/* ============================================================
   AI FITNESS COACH — ADMIN AUTHENTICATION
   Handles admin login flow with role verification.

   SECURITY NOTE:
   This client-side check (reading admins/{uid} and verifying
   role === "admin") is a UX gate ONLY. It prevents non-admin
   users from seeing the admin panel UI, but it does NOT provide
   real security because any user can read/write Firebase data
   if database rules allow it.

   For PRODUCTION you MUST:
   1. Use Firebase Custom Claims set by a trusted server/cloud
      function to mark admin users. Verify claims in Security
      Rules via request.auth.token.admin === true.
   2. Write strict Firebase Realtime Database Rules that restrict
      read/write on admin-only paths (e.g. exercises/, workouts/,
      settings/, etc.) to authenticated users with the admin claim.
   3. Never trust client-side role checks alone — they are for
      user experience only; the database rules are what actually
      protect admin data.
   ============================================================ */

/**
 * afcAdminLogin(email, password)
 * Signs in with email/password, then verifies the user exists in
 * the admins/ node with role === "admin". If not, signs out and
 * throws Error("NOT_ADMIN").
 * @returns {object} Firebase user object on success.
 */
window.afcAdminLogin = async function (email, password) {
  const result = await afcSignIn(email, password);
  const user = result.user;

  /* Check admins/{uid} for role === "admin" */
  const adminRec = await afcDbGet("admins/" + user.uid);
  if (!adminRec || adminRec.role !== "admin") {
    await afcSignOut().catch(function () {});
    throw new Error("NOT_ADMIN");
  }

  return user;
};
