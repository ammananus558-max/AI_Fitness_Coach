/* ============================================================
   AI FITNESS COACH — PURE UTILITIES (no Firebase dependency)
   ============================================================ */

window.qs = (sel, root) => (root || document).querySelector(sel);
window.qsa = (sel, root) => Array.from((root || document).querySelectorAll(sel));

/* ---------- Dates ---------- */

/* Local YYYY-MM-DD key (used everywhere for daily records). */
window.afcTodayKey = function () {
  return afcDateKey(new Date());
};
window.afcDateKey = function (d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + day;
};
window.afcAddDays = function (dateKey, n) {
  const d = new Date(dateKey + "T00:00:00");
  d.setDate(d.getDate() + n);
  return afcDateKey(d);
};
window.afcDaysBetween = function (aKey, bKey) {
  const a = new Date(aKey + "T00:00:00");
  const b = new Date(bKey + "T00:00:00");
  return Math.round((b - a) / 86400000);
};
window.afcFmtDate = function (dateKey) {
  if (!dateKey) return "";
  const d = new Date(dateKey + (dateKey.length === 10 ? "T00:00:00" : ""));
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
};
window.afcFmtDateTime = function (ts) {
  const d = ts instanceof Date ? ts : new Date(ts);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) +
    " " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
};
window.afcGreeting = function () {
  const h = new Date().getHours();
  if (h < 12) return "GOOD MORNING";
  if (h < 17) return "GOOD AFTERNOON";
  return "GOOD EVENING";
};
window.afcWeekdayName = function (dateKey) {
  return new Date(dateKey + "T00:00:00").toLocaleDateString(undefined, { weekday: "long" });
};

/* ---------- Health math ---------- */

/* BMI = weight(kg) / (height(m)^2) */
window.afcCalcBMI = function (heightCm, weightKg) {
  if (!heightCm || !weightKg) return null;
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
};
window.afcBMICategory = function (bmi) {
  if (bmi == null) return { label: "—", cls: "" };
  if (bmi < 18.5) return { label: "Underweight", cls: "amber" };
  if (bmi < 25) return { label: "Normal", cls: "green" };
  if (bmi < 30) return { label: "Overweight", cls: "amber" };
  return { label: "Obesity", cls: "red" };
};

/* Mifflin-St Jeor BMR + activity multiplier. */
window.afcCalcCalories = function (p) {
  const { age, gender, height, weight, activityLevel } = p || {};
  if (!age || !height || !weight) return null;
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  bmr += gender === "female" ? -161 : 5;
  const mult = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very: 1.725
  }[activityLevel] || 1.375;
  const maintenance = bmr * mult;
  return {
    bmr: Math.round(bmr),
    maintenance: Math.round(maintenance),
    target: Math.round(maintenance) // daily target defaults to maintenance
  };
};

/* ---------- Validation ---------- */
window.afcValidEmail = function (v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || "").trim());
};
window.afcValidPassword = function (v) {
  return String(v || "").length >= 6;
};
window.afcIsNumber = function (v, min, max) {
  const n = Number(v);
  if (!isFinite(n)) return false;
  if (min != null && n < min) return false;
  if (max != null && n > max) return false;
  return true;
};
window.AFC_MAX_IMAGE_MB = 5;
window.AFC_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
window.afcValidateImage = function (file) {
  if (!file) return "Please choose an image file.";
  if (!AFC_IMAGE_TYPES.includes(file.type)) return "Only JPG, JPEG, PNG or WEBP images are allowed.";
  if (file.size > AFC_MAX_IMAGE_MB * 1024 * 1024) return "Image must be under " + AFC_MAX_IMAGE_MB + " MB.";
  return null;
};

/* ---------- Misc ---------- */
window.afcEscape = function (s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
};
window.afcClamp = function (v, min, max) { return Math.min(max, Math.max(min, v)); };
window.afcDebounce = function (fn, ms) {
  let t;
  return function () {
    clearTimeout(t);
    const args = arguments, ctx = this;
    t = setTimeout(function () { fn.apply(ctx, args); }, ms);
  };
};
window.afcFriendlyAuthError = function (err) {
  const code = (err && (err.code || err.message)) || "";
  const map = {
    "auth/invalid-email": "That email address looks invalid.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect email or password.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/email-already-in-use": "An account with that email already exists.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
    "auth/popup-closed-by-user": "Google sign-in was cancelled.",
    "auth/popup-blocked": "Popup was blocked. Allow popups and try again.",
    "auth/requires-recent-login": "Please log in again to do that."
  };
  return map[code] || (err && err.message ? err.message.replace(/^Firebase:\s*/i, "") : "Something went wrong. Please try again.");
};

/* Busy state helper for buttons: afcBusy(btn, true, "Signing in...") */
window.afcBusy = function (btn, busy, text) {
  if (!btn) return;
  if (busy) {
    btn.dataset.origHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border" role="status" aria-hidden="true"></span> ' + (text || "Loading...");
  } else {
    btn.disabled = false;
    if (btn.dataset.origHtml) btn.innerHTML = btn.dataset.origHtml;
  }
};
