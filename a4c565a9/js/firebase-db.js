/* ============================================================
   AI FITNESS COACH — FIREBASE REALTIME DATABASE WRAPPER
   Depends on: firebase-config.js
   ============================================================ */

async function _afcDbSdk() {
  const fb = await window.afcFirebaseReady();
  return { db: fb.db, sdk: fb.dbSdk };
}

/* Read once. Returns the value or null. */
window.afcDbGet = async function (path) {
  const { db, sdk } = await _afcDbSdk();
  const snap = await sdk.get(sdk.ref(db, path));
  return snap.exists() ? snap.val() : null;
};

window.afcDbSet = async function (path, value) {
  const { db, sdk } = await _afcDbSdk();
  await sdk.set(sdk.ref(db, path), value);
};

window.afcDbUpdate = async function (path, value) {
  const { db, sdk } = await _afcDbSdk();
  await sdk.update(sdk.ref(db, path), value);
};

/* Push a child and return the generated key. */
window.afcDbPush = async function (path, value) {
  const { db, sdk } = await _afcDbSdk();
  const r = sdk.push(sdk.ref(db, path), value);
  return sdk.key(r);
};

window.afcDbRemove = async function (path) {
  const { db, sdk } = await _afcDbSdk();
  await sdk.remove(sdk.ref(db, path));
};

/* Realtime listener. Returns an unsubscribe function. */
window.afcDbOnValue = async function (path, cb) {
  const { db, sdk } = await _afcDbSdk();
  const r = sdk.ref(db, path);
  const unsub = sdk.onValue(r, function (snap) {
    cb(snap.exists() ? snap.val() : null);
  }, function (err) {
    console.error("Firebase listener error:", path, err);
    if (window.afcToast) afcToast("Could not load data. Check your connection.", "error");
  });
  return unsub;
};

/* ---------- Shortcuts for the signed-in user ----------
   Require window.AFC_SESSION to be set (done by requireAuth). */

window.afcUid = function () {
  return window.AFC_SESSION ? window.AFC_SESSION.uid : null;
};
window.afcUserGet = function (sub) {
  return afcDbGet("users/" + afcUid() + (sub ? "/" + sub : ""));
};
window.afcUserSet = function (sub, value) {
  return afcDbSet("users/" + afcUid() + "/" + sub, value);
};
window.afcUserUpdate = function (sub, value) {
  return afcDbUpdate("users/" + afcUid() + "/" + sub, value);
};
/* Today's daily record helpers: users/{uid}/daily/YYYY-MM-DD/... */
window.afcDailyPath = function (dateKey, sub) {
  return "daily/" + (dateKey || afcTodayKey()) + (sub ? "/" + sub : "");
};
window.afcDailyGet = function (sub, dateKey) {
  return afcUserGet(afcDailyPath(dateKey, sub));
};
window.afcDailySet = function (sub, value, dateKey) {
  return afcUserSet(afcDailyPath(dateKey, sub), value);
};
