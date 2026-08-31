/* ============================================================
   AI FITNESS COACH — FIREBASE CONFIGURATION
   ============================================================

   >>> PASTE YOUR FIREBASE CONFIG BELOW <<<

   HOW TO GET THESE VALUES:
   1. Go to https://console.firebase.google.com and create a project.
   2. Project settings (gear icon) → "General" → "Your apps" →
      click the Web icon (</>) to register a web app.
   3. Copy the values from the firebaseConfig snippet Firebase shows
      and paste them into the object below.
   4. In the Firebase console also enable:
        - Authentication → Sign-in method → Email/Password AND Google
        - Realtime Database (create it)
        - Storage (create it)
   5. Authentication → Settings → Authorized domains: add the domain
      you host this site on (localhost is included by default).

   DO NOT commit real keys to a public repository in production.
   ============================================================ */

const firebaseConfig = {
  apiKey: "AIzaSyDAMXsPF5_rxFKKc5OXs49PJ8l6tj3zVnM",
  authDomain: "aifitnesscoach-2cef0.firebaseapp.com",
  databaseURL: "https://aifitnesscoach-2cef0-default-rtdb.firebaseio.com",
  projectId: "aifitnesscoach-2cef0",
  storageBucket: "aifitnesscoach-2cef0.firebasestorage.app",
  messagingSenderId: "433287888334",
  appId: "1:433287888334:web:a900c5010c09229471ff9f"
};

/* True when real credentials have been pasted in. */
window.AFC_FIREBASE_READY =
  !String(firebaseConfig.apiKey || "").includes("YOUR_") &&
  !String(firebaseConfig.projectId || "").includes("YOUR_");

window.AFC_FIREBASE = null;

/*
 * afcFirebaseReady() -> Promise<{ app, auth, db, storage, authSdk, dbSdk, storageSdk }>
 * Loads the modular Firebase SDK from CDN once and initializes the app.
 * Rejects with Error("FIREBASE_NOT_CONFIGURED") while placeholders remain.
 */
window.afcFirebaseReady = (function () {
  let promise = null;
  return function () {
    if (promise) return promise;
    promise = (async () => {
      if (!window.AFC_FIREBASE_READY) {
        throw new Error("FIREBASE_NOT_CONFIGURED");
      }
      const V = "10.12.5";
      const base = "https://www.gstatic.com/firebasejs/" + V;
      const [appMod, authSdk, dbSdk, storageSdk] = await Promise.all([
        import(base + "/firebase-app.js"),
        import(base + "/firebase-auth.js"),
        import(base + "/firebase-database.js"),
        import(base + "/firebase-storage.js")
      ]);
      const app = appMod.initializeApp(firebaseConfig);
      window.AFC_FIREBASE = {
        app: app,
        auth: authSdk.getAuth(app),
        db: dbSdk.getDatabase(app),
        storage: storageSdk.getStorage(app),
        authSdk: authSdk,
        dbSdk: dbSdk,
        storageSdk: storageSdk
      };
      return window.AFC_FIREBASE;
    })();
    promise.catch(() => { promise = null; }); // allow retry after config edit
    return promise;
  };
})();

/*
 * OFFLINE QA / DEMO HOOK
 * A test harness may install window.__AFC_MOCK_SDK (an object shaped like
 * { app, auth, db, storage, authSdk, dbSdk, storageSdk }) before this file
 * loads. When present, the app runs against the mock SDK (in-memory DB)
 * instead of the real Firebase CDN modules. Normal operation is unchanged.
 */
if (window.__AFC_MOCK_SDK) {
  window.AFC_FIREBASE_READY = true;
  window.AFC_FIREBASE = window.__AFC_MOCK_SDK;
  window.afcFirebaseReady = function () {
    return Promise.resolve(window.__AFC_MOCK_SDK);
  };
}
