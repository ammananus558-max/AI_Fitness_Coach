/* Daily Habits page logic */
(async function () {
  var session;
  try { session = await requireAuth(); } catch (e) { return; }
  afcMountLayout("habits");

  var HABITS = [
    { key: "drinkWater", label: "Drink Water", icon: "bi-droplet-fill" },
    { key: "workout", label: "Workout", icon: "bi-lightning-fill" },
    { key: "healthyFood", label: "Healthy Food", icon: "bi-basket-fill" },
    { key: "sleep", label: "Sleep", icon: "bi-moon-stars-fill" },
    { key: "dailyActivity", label: "Daily Activity", icon: "bi-activity" }
  ];

  var habitsList = qs("#habitsList");
  var progressText = qs("#habitProgressText");
  var progressBar = qs("#habitProgressBar");
  var streakHint = qs("#streakHint");
  var todayHabits = {};

  /* Load streak info */
  try {
    var streak = await afcGetStreak();
    if (streak.current > 0) {
      streakHint.textContent = "You're on a " + streak.current + "-day streak! Keep going.";
    } else if (streak.best > 0) {
      streakHint.textContent = "Your best streak was " + streak.best + " days. Start a new one today!";
    }
  } catch (e) { /* ignore */ }

  /* Listen to today's habits */
  try {
    await afcDbOnValue("users/" + session.uid + "/daily/" + afcTodayKey() + "/habits", function (data) {
      todayHabits = data || {};
      renderHabits();
    });
  } catch (err) {
    renderHabits();
  }

  function renderHabits() {
    var doneCount = 0;
    habitsList.innerHTML = HABITS.map(function (h) {
      var done = !!todayHabits[h.key];
      if (done) doneCount++;
      return '<div class="habit-row' + (done ? ' done' : '') + '" data-key="' + h.key + '">' +
        '<div class="habit-check' + (done ? ' done' : '') + '" role="checkbox" aria-checked="' + done + '" tabindex="0" aria-label="Toggle ' + afcEscape(h.label) + '">' +
        '<i class="bi bi-check-lg" aria-hidden="true"></i>' +
        '</div>' +
        '<div class="icon-bubble" style="width:40px;height:40px;font-size:1.1rem"><i class="bi ' + h.icon + '"></i></div>' +
        '<span class="habit-name fw-bold">' + afcEscape(h.label) + '</span>' +
        '</div>';
    }).join("");

    progressText.textContent = doneCount + " / 5 completed";
    progressBar.style.width = Math.round((doneCount / 5) * 100) + "%";
  }

  /* Toggle habit */
  habitsList.addEventListener("click", function (e) {
    var check = e.target.closest(".habit-check");
    if (!check) return;
    var row = check.closest(".habit-row");
    if (!row) return;
    toggleHabit(row.dataset.key);
  });

  habitsList.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      var check = e.target.closest(".habit-check");
      if (!check) return;
      e.preventDefault();
      var row = check.closest(".habit-row");
      if (row) toggleHabit(row.dataset.key);
    }
  });

  async function toggleHabit(key) {
    var wasDone = !!todayHabits[key];
    try {
      await afcDailySet("habits/" + key, !wasDone);
      if (!wasDone) afcToast("Habit checked!", "success");
    } catch (err) {
      afcToast("Could not update.", "error");
    }
  }
})();
