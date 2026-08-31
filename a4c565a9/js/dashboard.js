/* ============================================================
   AI FITNESS COACH — DASHBOARD
   ============================================================ */
(async function () {
  var session;
  try { session = await requireAuth(); } catch (e) { return; }
  afcMountLayout("dashboard");

  var today = afcTodayKey();
  var uid = session.uid;
  var profile = session.profile || {};
  var firstName = (profile.name || "Athlete").split(" ")[0];

  /* ---------- Page head ---------- */
  var headEl = qs("#dashHead");
  if (headEl) {
    headEl.innerHTML = "<h1>" + afcEscape(afcGreeting()) + ", " + afcEscape(firstName.toUpperCase()) + " \uD83D\uDC4B</h1><p>" + afcEscape(afcFmtDate(today)) + "</p>";
  }

  /* ---------- Cached data ---------- */
  var mealsDb = {};
  var waterGoal = 8;
  var calTarget = 2000;

  try {
    var settingsSnap = await afcDbGet("settings");
    if (settingsSnap && settingsSnap.waterGoal) waterGoal = Number(settingsSnap.waterGoal);
  } catch (e) { /* default */ }

  try {
    var ct = await afcUserGet("health/calories/target");
    if (ct) calTarget = Number(ct);
  } catch (e) { /* default */ }

  /* Load all meals for calorie lookups */
  try {
    var mAll = await afcDbGet("meals");
    if (mAll) mealsDb = mAll;
  } catch (e) { /* non-fatal */ }

  /* ---------- Stats initial values ---------- */
  var statStreak = qs("#statStreak");
  var statWater = qs("#statWater");
  var statMeals = qs("#statMeals");
  var statWorkout = qs("#statWorkout");
  var statCalories = qs("#statCalories");

  /* Streak */
  try {
    var streakData = await afcGetStreak();
    if (statStreak) afcAnimateCount(statStreak, streakData.current || 0);
  } catch (e) { /* ignore */ }

  /* ---------- Render daily data ---------- */
  function renderDaily(daily) {
    daily = daily || {};

    /* Water */
    var w = Number(daily.water) || 0;
    if (statWater) statWater.textContent = w + "/" + waterGoal;

    /* Meals count */
    var mealKeys = daily.meals ? Object.keys(daily.meals) : [];
    if (statMeals) statMeals.textContent = mealKeys.length + "/4";

    /* Workout status */
    var done = !!daily.workoutCompleted;
    if (statWorkout) {
      statWorkout.textContent = done ? "DONE" : "PENDING";
      statWorkout.style.color = done ? "var(--success)" : "var(--warning)";
    }

    /* Calories from completed meals */
    var totalCal = 0;
    mealKeys.forEach(function (k) {
      var entry = daily.meals[k];
      if (entry && entry.calories) totalCal += Number(entry.calories);
      else if (entry && entry.key && mealsDb[entry.key]) totalCal += Number(mealsDb[entry.key].calories) || 0;
    });
    if (statCalories) statCalories.textContent = totalCal + "/" + calTarget;

    /* Habits */
    renderHabits(daily.habits || {});
  }

  /* ---------- Today's workout card ---------- */
  async function loadTodayWorkout() {
    var body = qs("#todayWorkoutBody");
    if (!body) return;
    try {
      var weekNum = await afcUserGet("plan/currentWeek");
      if (!weekNum) weekNum = 1;
      var dayName = new Date(today + "T00:00:00").toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
      var plan = await afcDbGet("weeklyPlans/week" + weekNum + "/" + dayName);

      if (!plan) {
        body.innerHTML = '<div class="empty-state"><i class="bi bi-calendar-x" aria-hidden="true"></i><p>No workout scheduled for today.</p></div>';
        return;
      }

      if (plan.restDay) {
        body.innerHTML = '<div class="d-flex align-items-center gap-3">' +
          '<div class="icon-bubble"><i class="bi bi-moon-stars-fill" aria-hidden="true"></i></div>' +
          '<div><strong>REST DAY</strong><br><span class="text-muted-2">' + afcEscape(plan.notes || "Recovery: hydrate, stretch and sleep well.") + '</span></div></div>';
        return;
      }

      var wk = plan.workout;
      if (!wk) {
        body.innerHTML = '<div class="empty-state"><p>No workout assigned.</p></div>';
        return;
      }

      var exChips = (wk.exercises || []).map(function (n) {
        return '<span class="chip">' + afcEscape(n) + '</span>';
      }).join("");

      body.innerHTML = '<div class="d-flex flex-column gap-2">' +
        '<div class="d-flex align-items-center gap-2 mb-1"><strong class="fs-5">' + afcEscape(wk.key || "Workout") + '</strong></div>' +
        '<div class="d-flex flex-wrap gap-2">' + exChips + '</div>' +
        '<a href="workout.html?w=' + encodeURIComponent(wk.key) + '" class="btn btn-fire mt-2 align-self-start"><i class="bi bi-play-fill me-1" aria-hidden="true"></i>START WORKOUT</a>' +
        '</div>';
    } catch (e) {
      body.innerHTML = '<div class="empty-state"><i class="bi bi-exclamation-triangle" aria-hidden="true"></i><p>Could not load today\'s workout.</p></div>';
    }
  }

  /* ---------- Today's meals card ---------- */
  async function loadTodayMeals(dailyMeals) {
    var body = qs("#todayMealsBody");
    if (!body) return;

    try {
      var weekNum = await afcUserGet("plan/currentWeek");
      if (!weekNum) weekNum = 1;
      var dayName = new Date(today + "T00:00:00").toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
      var plan = await afcDbGet("weeklyPlans/week" + weekNum + "/" + dayName);

      if (!plan || !plan.diet) {
        body.innerHTML = '<div class="empty-state"><p>No meal plan for today.</p></div>';
        return;
      }

      dailyMeals = dailyMeals || {};
      var categories = ["breakfast", "lunch", "snack", "dinner"];
      var html = "";

      categories.forEach(function (cat) {
        var mealKey = plan.diet[cat];
        var meal = mealKey && mealsDb[mealKey] ? mealsDb[mealKey] : null;
        var isDone = !!dailyMeals[cat];
        var catLabel = cat.charAt(0).toUpperCase() + cat.slice(1);
        var mealName = meal ? meal.name : (mealKey || "Not set");
        var mealCal = meal ? meal.calories : "";

        html += '<div class="d-flex align-items-center justify-content-between py-3 border-bottom" data-meal-cat="' + afcEscape(cat) + '">' +
          '<div class="d-flex align-items-center gap-3">' +
          '<button class="habit-check' + (isDone ? " done" : "") + '" data-toggle-meal="' + afcEscape(cat) + '" ' +
          'aria-label="Mark ' + afcEscape(catLabel) + ' as complete" role="checkbox" aria-checked="' + isDone + '">' +
          '<i class="bi bi-check-lg" aria-hidden="true"></i></button>' +
          '<div><strong>' + afcEscape(catLabel) + '</strong><br>' +
          '<span class="text-muted-2 small">' + afcEscape(mealName) + (mealCal ? " · " + mealCal + " kcal" : "") + '</span></div>' +
          '</div></div>';
      });

      body.innerHTML = html;

      /* Toggle handlers */
      body.querySelectorAll("[data-toggle-meal]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          toggleMeal(btn, plan.diet);
        });
      });
    } catch (e) {
      body.innerHTML = '<div class="empty-state"><i class="bi bi-exclamation-triangle" aria-hidden="true"></i><p>Could not load meals.</p></div>';
    }
  }

  async function toggleMeal(btn, dietPlan) {
    var cat = btn.dataset.toggleMeal;
    var mealKey = dietPlan[cat];
    if (!mealKey) { afcToast("No meal assigned for " + cat, "warn"); return; }

    var meal = mealsDb[mealKey] || {};
    var wasDone = btn.classList.contains("done");

    try {
      if (wasDone) {
        await afcDailySet("meals/" + cat, null);
        btn.classList.remove("done");
        btn.setAttribute("aria-checked", "false");
        afcToast(capitalize(cat) + " unchecked", "info");
      } else {
        await afcDailySet("meals/" + cat, { key: mealKey, name: meal.name || mealKey, calories: meal.calories || 0, at: Date.now() });
        btn.classList.add("done");
        btn.setAttribute("aria-checked", "true");
        afcToast(capitalize(cat) + " logged!", "success");
      }
    } catch (e) {
      afcToast("Could not update meal", "error");
    }
  }

  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ---------- Habits ---------- */
  var HABITS = [
    { key: "drink-water", label: "Drink Water", icon: "bi-droplet-fill" },
    { key: "workout", label: "Workout", icon: "bi-lightning-fill" },
    { key: "healthy-food", label: "Eat Healthy", icon: "bi-egg-fried" },
    { key: "sleep", label: "Sleep Well", icon: "bi-moon-stars-fill" },
    { key: "daily-activity", label: "Stay Active", icon: "bi-activity" }
  ];

  function renderHabits(habitsData) {
    var container = qs("#habitsBody");
    if (!container) return;

    var html = "";
    HABITS.forEach(function (h) {
      var done = !!habitsData[h.key];
      html += '<div class="habit-row tile mb-2' + (done ? " done" : "") + '" data-habit-key="' + afcEscape(h.key) + '">' +
        '<button class="habit-check' + (done ? " done" : "") + '" data-toggle-habit="' + afcEscape(h.key) + '" ' +
        'role="checkbox" aria-checked="' + done + '" aria-label="Toggle ' + afcEscape(h.label) + '">' +
        '<i class="bi bi-check-lg" aria-hidden="true"></i></button>' +
        '<i class="bi ' + h.icon + ' fs-5" style="color:var(--primary)" aria-hidden="true"></i>' +
        '<span class="habit-name fw-bold">' + afcEscape(h.label) + '</span></div>';
    });

    container.innerHTML = html;

    container.querySelectorAll("[data-toggle-habit]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        toggleHabit(btn);
      });
    });
  }

  async function toggleHabit(btn) {
    var key = btn.dataset.toggleHabit;
    var row = btn.closest(".habit-row");
    var wasDone = btn.classList.contains("done");

    try {
      if (wasDone) {
        await afcDailySet("habits/" + key, false);
        btn.classList.remove("done");
        btn.setAttribute("aria-checked", "false");
        if (row) row.classList.remove("done");
      } else {
        await afcDailySet("habits/" + key, true);
        btn.classList.add("done");
        btn.setAttribute("aria-checked", "true");
        if (row) row.classList.add("done");
        afcToast("Habit completed!", "success");
      }
    } catch (e) {
      afcToast("Could not update habit", "error");
    }
  }

  /* ---------- Trial status ---------- */
  async function loadTrial() {
    var body = qs("#trialBody");
    if (!body) return;

    try {
      var premium = await afcHasPremium();
      if (premium) {
        body.innerHTML = '<div class="d-flex align-items-center gap-2"><span class="chip green"><i class="bi bi-gem me-1" aria-hidden="true"></i>PREMIUM ACTIVE</span></div>';
        return;
      }

      var info = await afcTrialInfo();
      if (!info) {
        body.innerHTML = '<p class="text-muted-2">Unable to load subscription status.</p>';
        return;
      }

      if (info.active) {
        body.innerHTML = '<p class="fw-bold mb-2">FREE TRIAL — DAY ' + info.dayNum + ' / ' + info.totalDays + '</p>' +
          '<div class="progress-2 mb-2"><div class="bar" style="width:' + info.pct + '%"></div></div>' +
          '<small class="text-muted-2">' + (info.totalDays - info.dayNum) + ' days remaining</small>';
      } else {
        body.innerHTML = '<p class="fw-bold mb-3">YOUR FREE WEEK IS COMPLETE</p>' +
          '<a href="subscription.html" class="btn btn-fire"><i class="bi bi-gem me-1" aria-hidden="true"></i>CONTINUE WITH PREMIUM</a>';
      }
    } catch (e) {
      body.innerHTML = '<p class="text-muted-2">Could not load trial info.</p>';
    }
  }

  /* ---------- Realtime listener on daily record ---------- */
  var unsubDaily = null;
  try {
    unsubDaily = await afcDbOnValue("users/" + uid + "/daily/" + today, function (daily) {
      renderDaily(daily);
      loadTodayMeals(daily ? daily.meals : null);
    });
  } catch (e) {
    /* Fallback: render once with empty */
    renderDaily(null);
    loadTodayMeals(null);
  }

  window.addEventListener("pagehide", function () {
    if (unsubDaily) unsubDaily();
  });

  /* ---------- Init async sections ---------- */
  loadTodayWorkout();
  loadTrial();

})();
