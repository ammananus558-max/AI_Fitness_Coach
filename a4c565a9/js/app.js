/* ============================================================
   AI FITNESS COACH — APP CORE
   Shared UI: layout mounting (sidebar / header / bottom nav),
   route guards, toasts, loader, modals, trial, helpers.
   Depends on: utils.js, theme.js, firebase-*.js
   ============================================================ */

/* ---------------- Navigation model ---------------- */

window.AFC_NAV = [
  { key: "dashboard", label: "Dashboard", icon: "grid-1x2-fill", href: "dashboard.html" },
  { key: "weekly", label: "Weekly Plan", icon: "calendar-week", href: "weekly-plan.html" },
  { key: "workout", label: "Workout", icon: "lightning-fill", href: "workout.html" },
  { key: "meals", label: "Meals", icon: "egg-fried", href: "meals.html" },
  { key: "water", label: "Water", icon: "droplet-fill", href: "water.html" },
  { key: "habits", label: "Habits", icon: "check2-circle", href: "habits.html" },
  { key: "progress", label: "Progress", icon: "graph-up", href: "progress.html" },
  { key: "before", label: "Before & After", icon: "images", href: "before-after.html" },
  { key: "assistant", label: "AI Assistant", icon: "robot", href: "assistant.html" },
  { key: "subscription", label: "Subscription", icon: "gem", href: "subscription.html" },
  { key: "profile", label: "Profile", icon: "person-circle", href: "profile.html" },
  { key: "settings", label: "Settings", icon: "gear-fill", href: "settings.html" }
];

window.AFC_BOTTOM_NAV = [
  { key: "dashboard", label: "HOME", icon: "house-fill", href: "dashboard.html" },
  { key: "workout", label: "WORKOUT", icon: "lightning-fill", href: "workout.html" },
  { key: "meals", label: "MEALS", icon: "egg-fried", href: "meals.html" },
  { key: "progress", label: "PROGRESS", icon: "graph-up", href: "progress.html" },
  { key: "profile", label: "PROFILE", icon: "person-fill", href: "profile.html" }
];

window.AFC_MORE_ITEMS = [
  { label: "Weekly Plan", icon: "calendar-week", href: "weekly-plan.html" },
  { label: "Exercises", icon: "list-check", href: "exercises.html" },
  { label: "Diet Plans", icon: "basket-fill", href: "diet.html" },
  { label: "Water", icon: "droplet-fill", href: "water.html" },
  { label: "Habits", icon: "check2-circle", href: "habits.html" },
  { label: "Before & After", icon: "images", href: "before-after.html" },
  { label: "AI Assistant", icon: "robot", href: "assistant.html" },
  { label: "Subscription", icon: "gem", href: "subscription.html" },
  { label: "Settings", icon: "gear-fill", href: "settings.html" }
];

window.AFC_ADMIN_NAV = [
  { key: "dashboard", label: "Dashboard", icon: "grid-1x2-fill", href: "dashboard.html" },
  { key: "users", label: "Users", icon: "people-fill", href: "users.html" },
  { key: "exercises", label: "Exercises", icon: "list-check", href: "exercises.html" },
  { key: "workouts", label: "Workouts", icon: "lightning-fill", href: "workouts.html" },
  { key: "diet", label: "Diet Plans", icon: "basket-fill", href: "diet.html" },
  { key: "meals", label: "Meals", icon: "egg-fried", href: "meals.html" },
  { key: "weekly", label: "Weekly Plans", icon: "calendar-week", href: "weekly-plans.html" },
  { key: "before", label: "Before & After", icon: "images", href: "before-after.html" },
  { key: "goals", label: "Goals", icon: "bullseye", href: "goals.html" },
  { key: "pricing", label: "Pricing", icon: "tags-fill", href: "pricing.html" },
  { key: "chatbot", label: "Chatbot", icon: "robot", href: "chatbot.html" },
  { key: "settings", label: "Settings", icon: "gear-fill", href: "settings.html" }
];

/* ---------------- Toasts ---------------- */

window.afcToast = function (message, type, ms) {
  type = type || "success";
  const stackId = "afc-toast-stack";
  let stack = document.getElementById(stackId);
  if (!stack) {
    stack = document.createElement("div");
    stack.id = stackId;
    stack.className = "toast-stack";
    stack.setAttribute("aria-live", "polite");
    document.body.appendChild(stack);
  }
  const icons = { success: "check-circle-fill", error: "x-circle-fill", info: "info-circle-fill", warn: "exclamation-triangle-fill" };
  const el = document.createElement("div");
  el.className = "toast-2 " + (type === "success" ? "" : type);
  el.innerHTML = '<i class="bi ' + (icons[type] || icons.success) + '" aria-hidden="true"></i><span>' + afcEscape(message) + "</span>";
  stack.appendChild(el);
  setTimeout(function () {
    el.classList.add("leaving");
    setTimeout(function () { el.remove(); }, 320);
  }, ms || 2600);
};

/* ---------------- Global loader ---------------- */

window.afcLoader = function (text) {
  let el = document.getElementById("afc-loader");
  if (!el) {
    el = document.createElement("div");
    el.id = "afc-loader";
    el.className = "loader-overlay";
    el.innerHTML = '<div class="loader-card"><div class="spinner-fire" role="status" aria-label="Loading"></div><div id="afc-loader-text">Loading...</div></div>';
    document.body.appendChild(el);
  }
  document.getElementById("afc-loader-text").textContent = text || "Loading...";
  el.style.display = "grid";
};
window.afcLoaderOff = function () {
  const el = document.getElementById("afc-loader");
  if (el) el.style.display = "none";
};

/* ---------------- Confirm / prompt modals ---------------- */

/* afcConfirm({title, body, okText, cancelText, danger}) -> Promise<boolean> */
window.afcConfirm = function (opts) {
  opts = opts || {};
  return new Promise(function (resolve) {
    const id = "afc-modal-" + Date.now();
    const wrap = document.createElement("div");
    wrap.innerHTML =
      '<div class="modal fade" id="' + id + '" tabindex="-1" aria-hidden="true">' +
      '  <div class="modal-dialog modal-dialog-centered">' +
      '    <div class="modal-content">' +
      '      <div class="modal-header"><h5 class="modal-title">' + afcEscape(opts.title || "Are you sure?") + '</h5>' +
      '        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div>' +
      '      <div class="modal-body">' + (opts.body || "") + '</div>' +
      '      <div class="modal-footer">' +
      '        <button type="button" class="btn btn-ghost" data-bs-dismiss="modal">' + afcEscape(opts.cancelText || "Cancel") + '</button>' +
      '        <button type="button" class="btn ' + (opts.danger ? "btn-danger" : "btn-fire") + '" data-afc-ok>' + afcEscape(opts.okText || "Confirm") + '</button>' +
      "      </div></div></div></div>";
    const modalEl = wrap.firstElementChild;
    document.body.appendChild(modalEl);
    const modal = new bootstrap.Modal(modalEl);
    let answered = false;
    modalEl.querySelector("[data-afc-ok]").addEventListener("click", function () {
      answered = true; modal.hide(); resolve(true);
    });
    modalEl.addEventListener("hidden.bs.modal", function () {
      modalEl.remove();
      if (!answered) resolve(false);
    });
    modal.show();
  });
};

/* afcFormModal({title, fields:[{key,label,type,options,placeholder,value,textarea}], okText}) -> Promise<object|null> */
window.afcFormModal = function (opts) {
  return new Promise(function (resolve) {
    const id = "afc-fmodal-" + Date.now();
    let fieldsHtml = (opts.fields || []).map(function (f) {
      const val = afcEscape(f.value == null ? "" : f.value);
      if (f.type === "select") {
        const options = (f.options || []).map(function (o) {
          const ov = typeof o === "object" ? o.value : o;
          const ol = typeof o === "object" ? o.label : o;
          return '<option value="' + afcEscape(ov) + '"' + (String(f.value) === String(ov) ? " selected" : "") + ">" + afcEscape(ol) + "</option>";
        }).join("");
        return '<div class="mb-3"><label class="form-label">' + afcEscape(f.label) + '</label><select class="form-select" data-key="' + f.key + '">' + options + "</select></div>";
      }
      if (f.textarea) {
        return '<div class="mb-3"><label class="form-label">' + afcEscape(f.label) + '</label><textarea class="form-control" rows="' + (f.rows || 3) + '" data-key="' + f.key + '" placeholder="' + afcEscape(f.placeholder || "") + '">' + val + "</textarea></div>";
      }
      return '<div class="mb-3"><label class="form-label">' + afcEscape(f.label) + '</label><input type="' + (f.type || "text") + '" class="form-control" data-key="' + f.key + '" value="' + val + '" placeholder="' + afcEscape(f.placeholder || "") + '"' + (f.step ? ' step="' + f.step + '"' : "") + (f.min != null ? ' min="' + f.min + '"' : "") + (f.max != null ? ' max="' + f.max + '"' : "") + "></div>";
    }).join("");
    const wrap = document.createElement("div");
    wrap.innerHTML =
      '<div class="modal fade" id="' + id + '" tabindex="-1" aria-hidden="true">' +
      '  <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">' +
      '    <div class="modal-content">' +
      '      <div class="modal-header"><h5 class="modal-title">' + afcEscape(opts.title || "Form") + '</h5>' +
      '        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div>' +
      '      <div class="modal-body">' + fieldsHtml + '</div>' +
      '      <div class="modal-footer">' +
      '        <button type="button" class="btn btn-ghost" data-bs-dismiss="modal">Cancel</button>' +
      '        <button type="button" class="btn btn-fire" data-afc-save>' + afcEscape(opts.okText || "Save") + '</button>' +
      "      </div></div></div></div>";
    const modalEl = wrap.firstElementChild;
    document.body.appendChild(modalEl);
    const modal = new bootstrap.Modal(modalEl);
    let answered = false;
    modalEl.querySelector("[data-afc-save]").addEventListener("click", function () {
      const out = {};
      modalEl.querySelectorAll("[data-key]").forEach(function (el) { out[el.dataset.key] = el.value; });
      answered = true; modal.hide(); resolve(out);
    });
    modalEl.addEventListener("hidden.bs.modal", function () {
      modalEl.remove();
      if (!answered) resolve(null);
    });
    modal.show();
  });
};

/* ---------------- Route guards ---------------- */

/* Friendly banner when Firebase credentials are still placeholders. */
window.afcSetupBanner = function () {
  const mount = qs("#mainContent") || qs(".auth-card") || document.body;
  const card = document.createElement("div");
  card.className = "tile tile-pad setup-banner anim-scale";
  card.innerHTML =
    '<h3><i class="bi bi-plug-fill text-danger me-2"></i>Firebase setup needed</h3>' +
    '<p class="text-muted-2 mb-3">This app runs on Firebase. To use it, paste your Firebase project credentials into ' +
    "<code>js/firebase-config.js</code> (open that file for step-by-step instructions).</p>" +
    "<ol class=\"text-muted-2 mb-3\">" +
    "<li>Create a project at console.firebase.google.com</li>" +
    "<li>Enable Email/Password + Google sign-in</li>" +
    "<li>Create a Realtime Database and enable Storage</li>" +
    "<li>Register a Web App and copy the config into <code>js/firebase-config.js</code></li>" +
    "</ol>" +
    "<p class=\"mb-0 form-hint\">See README.md for the complete setup guide.</p>";
  mount.innerHTML = "";
  mount.appendChild(card);
};

/*
 * requireAuth(opts) -> { user, uid, profile }
 * Redirects to login when signed out, to onboarding when profile
 * is incomplete. opts.allowIncomplete skips the onboarding redirect.
 */
window.requireAuth = async function (opts) {
  opts = opts || {};
  try {
    await window.afcFirebaseReady();
  } catch (e) {
    afcSetupBanner();
    throw e;
  }
  const user = await afcGetCurrentUser();
  if (!user) {
    location.href = "login.html";
    throw new Error("NOT_AUTHENTICATED");
  }
  let profile = await afcDbGet("users/" + user.uid);
  if (!profile) {
    profile = { uid: user.uid, name: user.displayName || "", email: user.email || "", profileCompleted: false };
    await afcDbSet("users/" + user.uid, profile);
  }
  window.AFC_SESSION = { user: user, uid: user.uid, profile: profile };
  if (!profile.profileCompleted && !opts.allowIncomplete &&
      !/onboarding\.html|goal\.html|bmi\.html|calories\.html/.test(location.pathname)) {
    location.href = "onboarding.html";
    throw new Error("PROFILE_INCOMPLETE");
  }
  return window.AFC_SESSION;
};

/*
 * requireAdmin() -> { uid }
 * Admin authorization is read from admins/{uid} in the database.
 * NOTE: For production you should use Firebase Custom Claims set by a
 * trusted backend instead of a client-readable node — a client-side
 * check is a UX gate only, real protection comes from database rules.
 */
window.requireAdmin = async function () {
  try {
    await window.afcFirebaseReady();
  } catch (e) {
    afcSetupBanner();
    throw e;
  }
  const user = await afcGetCurrentUser();
  if (!user) {
    location.href = "admin-login.html";
    throw new Error("NOT_AUTHENTICATED");
  }
  const adminRec = await afcDbGet("admins/" + user.uid);
  if (!adminRec || adminRec.role !== "admin") {
    afcToast("You are not authorized to access the admin panel.", "error");
    await afcSignOut().catch(function () {});
    location.href = "admin-login.html";
    throw new Error("NOT_ADMIN");
  }
  window.AFC_SESSION = { user: user, uid: user.uid, isAdmin: true };
  return window.AFC_SESSION;
};

/* ---------------- Layout mounting ---------------- */

function _brandHtml() {
  return '<div class="brand">' +
    '<div class="brand-badge"><i class="bi bi-heart-pulse-fill" aria-hidden="true"></i></div>' +
    "<div>AI FITNESS COACH<small>TRAIN • EAT • EVOLVE</small></div></div>";
}

/* Mounts sidebar + header + bottom nav + more sheet.
   activeKey: key from AFC_NAV. opts.admin for admin layout. */
window.afcMountLayout = function (activeKey, opts) {
  opts = opts || {};
  const session = window.AFC_SESSION || {};
  const profile = session.profile || {};
  const firstName = (profile.name || session.user && session.user.displayName || "Athlete").split(" ")[0];
  const nav = opts.admin ? AFC_ADMIN_NAV : AFC_NAV;
  const prefix = opts.admin ? "" : "";

  /* Sidebar */
  const sidebar = qs("#sidebarMount");
  if (sidebar) {
    sidebar.className = opts.admin ? "admin-sidebar" : "app-sidebar";
    sidebar.setAttribute("aria-label", "Main navigation");
    sidebar.innerHTML = _brandHtml() +
      '<nav class="side-nav">' +
      nav.map(function (item) {
        return '<a class="side-link' + (item.key === activeKey ? " active" : "") + '" href="' + prefix + item.href + '"' +
          (item.key === activeKey ? ' aria-current="page"' : "") + ">" +
          '<i class="bi ' + 'bi-' + item.icon + '" aria-hidden="true"></i><span>' + item.label + "</span></a>";
      }).join("") +
      '<div class="side-sep"></div>' +
      '<a class="side-link" href="#" data-afc-logout><i class="bi bi-box-arrow-right" aria-hidden="true"></i><span>Logout</span></a>' +
      "</nav>";
  }

  /* Header */
  const header = qs("#headerMount");
  if (header) {
    header.className = "app-header";
    header.innerHTML =
      '<button class="header-icon-btn" id="sidebarToggleBtn" aria-label="Open menu" style="display:none"><i class="bi bi-list"></i></button>' +
      '<h1 class="page-title" id="headerTitle">' + afcEscape(document.title.replace(/ · AI FITNESS COACH.*$/, "")) + "</h1>" +
      '<div class="header-spacer"></div>' +
      (opts.admin ? "" : '<span class="streak-chip d-none d-sm-inline-flex" id="headerStreak" title="Current streak"><i class="bi bi-fire"></i><span id="headerStreakVal">0</span></span>') +
      '<button class="header-icon-btn" data-afc-theme-toggle aria-label="Toggle dark mode"><i class="bi bi-moon-stars-fill" data-theme-icon></i></button>' +
      '<div class="dropdown">' +
      '<button class="avatar-chip dropdown-toggle" data-bs-toggle="dropdown" aria-label="Account menu">' +
      (profile.photoURL
        ? '<img class="avatar-img" src="' + afcEscape(profile.photoURL) + '" alt="Profile photo">'
        : '<span class="avatar-img" aria-hidden="true">' + afcEscape((firstName[0] || "A").toUpperCase()) + "</span>") +
      "</button>" +
      '<ul class="dropdown-menu dropdown-menu-end">' +
      '<li><h6 class="dropdown-header">' + afcEscape(profile.name || profile.email || "Account") + "</h6></li>" +
      (opts.admin ? "" :
        '<li><a class="dropdown-item" href="profile.html"><i class="bi bi-person me-2"></i>Profile</a></li>' +
        '<li><a class="dropdown-item" href="settings.html"><i class="bi bi-gear me-2"></i>Settings</a></li>' +
        '<li><hr class="dropdown-divider"></li>') +
      '<li><a class="dropdown-item text-danger" href="#" data-afc-logout><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>' +
      "</ul></div>";

    /* theme icon state */
    const tIcon = header.querySelector("[data-theme-icon]");
    if (tIcon) tIcon.className = "bi " + (afcCurrentTheme() === "dark" ? "bi-sun-fill" : "bi-moon-stars-fill");
    header.querySelector("[data-afc-theme-toggle]").addEventListener("click", afcToggleTheme);

    /* sidebar toggle for tablet/mobile */
    const tgl = header.querySelector("#sidebarToggleBtn");
    if (tgl) {
      let bd = qs(".sidebar-backdrop");
      if (!bd) {
        bd = document.createElement("div");
        bd.className = "sidebar-backdrop";
        document.body.appendChild(bd);
        bd.addEventListener("click", function () {
          sidebar && sidebar.classList.remove("open");
          bd.classList.remove("open");
        });
      }
      tgl.addEventListener("click", function () {
        sidebar && sidebar.classList.add("open");
        bd.classList.add("open");
      });
    }
  }

  /* Bottom nav + More sheet (user app only) */
  if (!opts.admin) {
    const bnav = qs("#bottomNavMount");
    if (bnav) {
      bnav.className = "bottom-nav";
      bnav.innerHTML = '<div class="bnav-inner">' +
        AFC_BOTTOM_NAV.map(function (item) {
          return '<a class="bnav-item' + (item.key === activeKey ? " active" : "") + '" href="' + item.href + '">' +
            '<i class="bi ' + 'bi-' + item.icon + '" aria-hidden="true"></i><span>' + item.label + "</span></a>";
        }).join("") +
        '<button class="bnav-item" data-afc-more aria-label="More menu"><i class="bi bi-grid-3x3-gap-fill" aria-hidden="true"></i><span>MORE</span></button>' +
        "</div>";
    }
    let mbd = qs(".more-backdrop"), sheet = qs(".more-sheet");
    if (!sheet) {
      mbd = document.createElement("div");
      mbd.className = "more-backdrop";
      sheet = document.createElement("div");
      sheet.className = "more-sheet";
      sheet.setAttribute("role", "dialog");
      sheet.setAttribute("aria-label", "More menu");
      sheet.innerHTML = '<div class="grab" aria-hidden="true"></div><div class="more-grid">' +
        AFC_MORE_ITEMS.map(function (m) {
          return '<a href="' + m.href + '"><i class="bi ' + 'bi-' + m.icon + '" aria-hidden="true"></i><span>' + m.label + "</span></a>";
        }).join("") +
        '<a href="#" data-afc-logout><i class="bi bi-box-arrow-right"></i><span>Logout</span></a>' +
        "</div>";
      document.body.appendChild(mbd);
      document.body.appendChild(sheet);
      const closeSheet = function () { mbd.classList.remove("open"); sheet.classList.remove("open"); };
      mbd.addEventListener("click", closeSheet);
      sheet.addEventListener("click", function (e) { if (e.target.closest("a:not([data-afc-logout])")) closeSheet(); });
    }
    document.addEventListener("click", function (e) {
      const moreBtn = e.target.closest("[data-afc-more]");
      if (moreBtn) { mbd.classList.add("open"); sheet.classList.add("open"); }
    });
  }

  /* Logout everywhere */
  document.addEventListener("click", async function (e) {
    const btn = e.target.closest("[data-afc-logout]");
    if (!btn) return;
    e.preventDefault();
    const ok = await afcConfirm({ title: "Log out?", body: "You can log back in any time.", okText: "Logout", danger: true });
    if (!ok) return;
    afcLoader("Logging out...");
    try { await afcSignOut(); } catch (err) { /* ignore */ }
    location.href = opts.admin ? "admin-login.html" : "login.html";
  });

  /* Streak chip */
  if (!opts.admin && window.afcGetStreak) {
    afcGetStreak().then(function (s) {
      const el = qs("#headerStreakVal");
      if (el) el.textContent = s.current || 0;
    }).catch(function () {});
  }

  /* Chatbot floating widget */
  if (!opts.admin && !opts.noChat && window.afcMountChatWidget) {
    afcMountChatWidget();
  }

  /* Scroll reveal */
  afcInitReveals();
};

window.afcSetHeaderTitle = function (title) {
  const el = qs("#headerTitle");
  if (el) el.textContent = title;
};

/* ---------------- Reveal on scroll ---------------- */
window.afcInitReveals = function () {
  const els = qsa(".reveal:not(.revealed)");
  if (!els.length || !("IntersectionObserver" in window)) {
    els.forEach(function (el) { el.classList.add("revealed"); });
    return;
  }
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add("revealed");
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(function (el) { io.observe(el); });
};

/* Animated counter */
window.afcAnimateCount = function (el, target, ms) {
  if (!el) return;
  target = Number(target) || 0;
  ms = ms || 800;
  const start = performance.now();
  function tick(now) {
    const p = Math.min(1, (now - start) / ms);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
};

/* SVG ring progress: afcRing(svgEl, pct) — svg must contain
   <circle class="ring-track"> and <circle class="ring-bar"> */
window.afcRing = function (svg, pct) {
  if (!svg) return;
  const bar = svg.querySelector(".ring-bar");
  if (!bar) return;
  const r = Number(bar.getAttribute("r"));
  const c = 2 * Math.PI * r;
  bar.style.strokeDasharray = String(c);
  bar.style.strokeDashoffset = String(c * (1 - afcClamp(pct, 0, 100) / 100));
};

/* Confetti burst on success */
window.afcConfetti = function (count) {
  const colors = ["#ff2e63", "#ff6b35", "#22c55e", "#38bdf8", "#f59e0b", "#8b5cf6"];
  count = count || 60;
  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    p.className = "confetti-piece";
    p.style.left = Math.random() * 100 + "vw";
    p.style.background = colors[i % colors.length];
    p.style.animationDuration = 1.6 + Math.random() * 1.6 + "s";
    p.style.animationDelay = Math.random() * 0.4 + "s";
    document.body.appendChild(p);
    setTimeout(function () { p.remove(); }, 3600);
  }
};

/* Image fallback helper: returns HTML for a media area. */
window.afcMediaHtml = function (url, alt, iconCls) {
  if (url) return '<img src="' + afcEscape(url) + '" alt="' + afcEscape(alt || "") + '" loading="lazy">';
  return '<i class="bi ' + (iconCls || "bi-heart-pulse-fill") + '" aria-hidden="true"></i>';
};

/* ---------------- 7-day free trial ---------------- */

/* Ensures users/{uid}/trial exists. Returns {startDate, endDate, days}. */
window.afcEnsureTrial = async function () {
  const session = window.AFC_SESSION;
  if (!session) return null;
  let trial = await afcUserGet("trial");
  if (trial && trial.startDate && trial.endDate) return trial;
  let days = 7;
  try {
    const s = await afcDbGet("settings/trialDays");
    if (s && Number(s) > 0) days = Number(s);
  } catch (e) { /* default 7 */ }
  trial = { startDate: afcTodayKey(), endDate: afcAddDays(afcTodayKey(), days - 1), days: days };
  await afcUserSet("trial", trial);
  return trial;
};

/* Trial status for display. */
window.afcTrialInfo = async function () {
  const trial = await afcEnsureTrial();
  if (!trial) return null;
  const today = afcTodayKey();
  const dayNum = afcDaysBetween(trial.startDate, today) + 1;
  const totalDays = trial.days || (afcDaysBetween(trial.startDate, trial.endDate) + 1);
  const active = today <= trial.endDate;
  return {
    trial: trial,
    dayNum: afcClamp(dayNum, 1, totalDays),
    totalDays: totalDays,
    active: active,
    pct: Math.round((afcClamp(dayNum, 1, totalDays) / totalDays) * 100)
  };
};

/* Subscription active? */
window.afcHasPremium = async function () {
  const sub = await afcUserGet("subscription");
  if (!sub || sub.status !== "active") return false;
  if (sub.endDate && afcTodayKey() > sub.endDate) return false;
  return true;
};

/* App-wide SVG defs (gradients for rings/charts). Injected once. */
(function () {
  const div = document.createElement("div");
  div.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
  div.setAttribute("aria-hidden", "true");
  div.innerHTML =
    '<svg width="0" height="0"><defs>' +
    '<linearGradient id="afcRingGrad" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0%" stop-color="#ff2e63"/><stop offset="100%" stop-color="#ff6b35"/>' +
    "</linearGradient>" +
    '<linearGradient id="afcAreaGrad" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#ff2e63" stop-opacity="0.5"/><stop offset="100%" stop-color="#ff2e63" stop-opacity="0"/>' +
    "</linearGradient></defs></svg>";
  document.addEventListener("DOMContentLoaded", function () {
    document.body.appendChild(div);
  });
})();
