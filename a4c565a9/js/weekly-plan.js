/* ============================================================
   AI FITNESS COACH — WEEKLY PLAN
   ============================================================ */
(async function () {
  var session;
  try { session = await requireAuth(); } catch (e) { return; }
  afcMountLayout("weekly");

  var DAY_NAMES = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  var DAY_LABELS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
  var todayKey = afcTodayKey();
  var todayDayName = new Date(todayKey + "T00:00:00").toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

  var mealsDb = {};
  try {
    var mAll = await afcDbGet("meals");
    if (mAll) mealsDb = mAll;
  } catch (e) { /* non-fatal */ }

  /* ---------- State ---------- */
  var currentWeek = 1;
  try {
    var cw = await afcUserGet("plan/currentWeek");
    if (cw) currentWeek = Number(cw);
  } catch (e) { /* default */ }

  /* ---------- Week tabs ---------- */
  var tabsEl = qs("#weekTabs");
  function renderTabs() {
    if (!tabsEl) return;
    var html = "";
    for (var i = 1; i <= 4; i++) {
      html += '<button class="week-tab' + (i === currentWeek ? " active" : "") + '" data-week="' + i + '" role="tab" aria-selected="' + (i === currentWeek) + '">WEEK ' + i + '</button>';
    }
    tabsEl.innerHTML = html;
    tabsEl.querySelectorAll(".week-tab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var w = Number(btn.dataset.week);
        if (w === currentWeek) return;
        currentWeek = w;
        renderTabs();
        afcUserSet("plan/currentWeek", w).catch(function () {});
      });
    });
  }
  renderTabs();

  /* ---------- Render week ---------- */
  var bodyEl = qs("#weekBody");
  var startWrap = qs("#startTodayWrap");
  var startBtn = qs("#startTodayBtn");

  function renderWeek(plans) {
    if (!bodyEl) return;

    if (!plans) {
      bodyEl.innerHTML = '<div class="empty-state"><i class="bi bi-calendar-x" aria-hidden="true"></i><p>No weekly plans available yet.</p></div>';
      if (startWrap) startWrap.style.display = "none";
      return;
    }

    var weekData = plans["week" + currentWeek];
    if (!weekData) {
      bodyEl.innerHTML = '<div class="empty-state"><i class="bi bi-calendar-x" aria-hidden="true"></i><p>No plan for week ' + currentWeek + ' yet.</p></div>';
      if (startWrap) startWrap.style.display = "none";
      return;
    }

    var html = '<div class="row g-3">';
    var todayWorkoutKey = null;

    DAY_NAMES.forEach(function (day, idx) {
      var d = weekData[day];
      if (!d) return;

      var isRest = !!d.restDay;
      var isToday = day === todayDayName;
      var workoutHtml = "";
      var dietHtml = "";

      if (isRest) {
        workoutHtml = '<span class="chip blue"><i class="bi bi-moon-stars-fill me-1" aria-hidden="true"></i>REST DAY</span>';
      } else if (d.workout) {
        if (isToday) todayWorkoutKey = d.workout.key;
        var exChips = (d.workout.exercises || []).map(function (n) {
          return '<span class="chip">' + afcEscape(n) + '</span>';
        }).join("");
        workoutHtml = '<div class="d-flex flex-wrap gap-1 mt-1">' + exChips + '</div>';
      }

      /* Diet block */
      if (d.diet) {
        var cats = ["breakfast", "lunch", "snack", "dinner"];
        var lines = cats.map(function (cat) {
          var mk = d.diet[cat];
          var meal = mk && mealsDb[mk] ? mealsDb[mk] : null;
          var name = meal ? meal.name : (mk || "—");
          var cal = meal ? meal.calories : "";
          return '<div class="small"><strong>' + cat.charAt(0).toUpperCase() + cat.slice(1) + ':</strong> ' +
            afcEscape(name) + (cal ? ' <span class="text-muted-2">(' + cal + ' kcal)</span>' : '') + '</div>';
        }).join("");
        dietHtml = '<div class="mt-2">' + lines + '</div>';
      }

      html += '<div class="col-12 col-md-6 col-xl-4">' +
        '<div class="tile tile-pad day-card' + (isRest ? " rest" : "") + '">' +
        '<div class="d-flex align-items-center justify-content-between mb-2">' +
        '<span class="day-name">' + afcEscape(DAY_LABELS[idx]) + '</span>' +
        (isToday ? '<span class="chip fire">TODAY</span>' : '') +
        '</div>' +
        workoutHtml + dietHtml +
        (d.notes ? '<div class="small text-muted-2 mt-2 fst-italic">' + afcEscape(d.notes) + '</div>' : '') +
        '</div></div>';
    });

    html += '</div>';
    bodyEl.innerHTML = html;

    /* Start today button */
    if (startWrap && startBtn) {
      if (todayWorkoutKey) {
        startWrap.style.display = "";
        startBtn.href = "workout.html?w=" + encodeURIComponent(todayWorkoutKey);
      } else {
        startWrap.style.display = "none";
      }
    }
  }

  /* ---------- Realtime listener ---------- */
  var unsubPlans = null;
  try {
    unsubPlans = await afcDbOnValue("weeklyPlans", function (data) {
      renderWeek(data);
    });
  } catch (e) {
    /* Fallback: load once */
    try {
      var wp = await afcDbGet("weeklyPlans");
      renderWeek(wp);
    } catch (e2) {
      if (bodyEl) bodyEl.innerHTML = '<div class="empty-state"><i class="bi bi-exclamation-triangle" aria-hidden="true"></i><p>Could not load weekly plans.</p></div>';
    }
  }

  window.addEventListener("pagehide", function () {
    if (unsubPlans) unsubPlans();
  });

})();
