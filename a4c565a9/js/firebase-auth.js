/* ============================================================
   AI FITNESS COACH — FIREBASE AUTH WRAPPER
   Depends on: firebase-config.js (afcFirebaseReady)
   ============================================================ */

async function _afcFb() {
  return window.afcFirebaseReady();
}

/* Create the base user record after any first sign-in. */
async function afcEnsureUserRecord(user, extra) {
  const fb = await _afcFb();
  const snap = await fb.dbSdk.get(fb.dbSdk.ref(fb.db, "users/" + user.uid));
  if (snap.exists()) {
    await fb.dbSdk.update(fb.dbSdk.ref(fb.db, "users/" + user.uid), {
      lastLogin: Date.now(),
      ...(extra || {})
    });
    return false;
  }
  await fb.dbSdk.set(fb.dbSdk.ref(fb.db, "users/" + user.uid), {
    uid: user.uid,
    name: (extra && extra.name) || user.displayName || "",
    email: user.email || "",
    photoURL: user.photoURL || "",
    role: "user",
    createdAt: Date.now(),
    lastLogin: Date.now(),
    profileCompleted: false,
    settings: { theme: document.documentElement.getAttribute("data-theme") || "light" },
    ...(extra || {})
  });
  return true; // new user
}

window.afcSignUp = async function (name, email, password) {
  const fb = await _afcFb();
  const cred = await fb.authSdk.createUserWithEmailAndPassword(fb.auth, email, password);
  await fb.authSdk.updateProfile(cred.user, { displayName: name });
  const isNew = await afcEnsureUserRecord(cred.user, { name: name });
  return { user: cred.user, isNew: true };
};

window.afcSignIn = async function (email, password) {
  const fb = await _afcFb();
  const cred = await fb.authSdk.signInWithEmailAndPassword(fb.auth, email, password);
  await afcEnsureUserRecord(cred.user, {});
  return { user: cred.user, isNew: false };
};

window.afcGoogleSignIn = async function () {
  const fb = await _afcFb();
  const provider = new fb.authSdk.GoogleAuthProvider();
  const cred = await fb.authSdk.signInWithPopup(fb.auth, provider);
  const isNew = await afcEnsureUserRecord(cred.user, {
    name: cred.user.displayName || "",
    photoURL: cred.user.photoURL || ""
  });
  return { user: cred.user, isNew: isNew };
};

window.afcSignOut = async function () {
  const fb = await _afcFb();
  await fb.authSdk.signOut(fb.auth);
};

window.afcSendPasswordReset = async function (email) {
  const fb = await _afcFb();
  await fb.authSdk.sendPasswordResetEmail(fb.auth, email);
};

/* Resolves with the current user (or null) once auth state is known. */
window.afcGetCurrentUser = async function () {
  const fb = await _afcFb();
  return new Promise(function (resolve) {
    fb.authSdk.onAuthStateChanged(fb.auth, function (u) { resolve(u); }, function () { resolve(null); });
  });
};

window.afcOnAuthStateChanged = async function (cb) {
  const fb = await _afcFb();
  return fb.authSdk.onAuthStateChanged(fb.auth, cb);
};
