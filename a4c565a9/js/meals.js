/* Today's Meals page logic */
(async function () {
  var session;
  try { session = await requireAuth(); } catch (e) { return; }
  afcMountLayout("meals");

  var container = qs("#mealsContainer");
  var completedEl = qs("#completedCount");
  var totalKcalEl = qs("#totalKcal");
  var progressBar = qs("#mealProgress");
  var dateDisplay = qs("#dateDisplay");
  var restNote = qs("#restDayNote");

  dateDisplay.textContent = afcFmtDate(afcTodayKey());

  var allMeals = {};
  var todayMeals = {};
  var plannedDiet = null;
  var isRestDay = false;

  afcLoader("Loading meals...");

  /* Load all meals catalog */
  try {
    allMeals = await afcDbGet("meals") || {};
  } catch (err) { /* ignore */ }

  /* Get current week and today's plan */
  try {
    var currentWeek = await afcUserGet("plan/currentWeek");
    var weekNum = currentWeek || 1;
    var weekData = await afcDbGet("weeklyPlans/week" + weekNum);
    if (weekData) {
      var dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      var todayDayName = dayNames[new Date().getDay()];
      var dayPlan = weekData[todayDayName];
      if (dayPlan) {
        plannedDiet = dayPlan.diet || null;
        isRestDay = !!dayPlan.restDay;
      }
    }
  } catch (err) { /* ignore */ }

  if (isRestDay) restNote.style.display = "";

  /* Listen to today's meal completions */
  try {
    await afcDbOnValue("users/" + session.uid + "/daily/" + afcTodayKey() + "/meals", function (data) {
      todayMeals = data || {};
      renderAll();
    });
  } catch (err) { /* fallback: render once */
    renderAll();
  }

  afcLoaderOff();

  function renderAll() {
    var categories = ["breakfast", "lunch", "snack", "dinner"];
    var catLabels = { breakfast: "Breakfast", lunch: "Lunch", snack: "Snack", dinner: "Dinner" };
    var catIcons = { breakfast: "bi-sunrise-fill", lunch: "bi-sun-fill", snack: "bi-cup-hot-fill", dinner: "bi-moon-fill" };

    if (!plannedDiet) {
      container.innerHTML = '<div class="col-12"><div class="empty-state"><i class="bi bi-calendar-x"></i><p>No meals planned for today yet.</p></div></div>';
      updateSummary(0, 0);
      return;
    }

    var completedCount = 0;
    var totalKcal = 0;

    container.innerHTML = categories.map(function (cat) {
      var mealKey = plannedDiet[cat];
      var meal = mealKey ? allMeals[mealKey] : null;
      var record = todayMeals[cat];
      var done = !!record;
      if (done) {
        completedCount++;
        totalKcal += (record.calories || (meal && meal.calories) || 0);
      }

      if (!meal) {
        return '<div class="col-sm-6 col-lg-3">' +
          '<div class="tile tile-pad text-center">' +
          '<div class="icon-bubble mx-auto mb-2"><i class="bi ' + catIcons[cat] + '"></i></div>' +
          '<strong>' + catLabels[cat] + '</strong>' +
          '<p class="text-muted-2 mb-0" style="font-size:.85rem">No meal assigned</p>' +
          '</div></div>';
      }

      var imgHtml = meal.image
        ? '<img src="' + afcEscape(meal.image) + '" alt="' + afcEscape(meal.name) + '" loading="lazy">'
        : '<i class="bi bi-egg-fried" aria-hidden="true"></i>';

      return '<div class="col-sm-6 col-lg-3">' +
        '<div class="tile" style="overflow:hidden">' +
        '<div class="media-card-img cat-meal">' + imgHtml + '</div>' +
        '<div class="p-3">' +
        '<div class="d-flex align-items-center gap-2 mb-1">' +
        '<i class="bi ' + catIcons[cat] + ' text-primary"></i>' +
        '<span class="stat-label">' + catLabels[cat].toUpperCase() + '</span>' +
        '</div>' +
        '<h5 class="card-title-2 mb-1">' + afcEscape(meal.name) + '</h5>' +
        '<div style="font-size:1.3rem;font-weight:900;margin-bottom:.3rem">' + (meal.calories || 0) + ' <span style="font-size:.7rem;color:var(--muted)">kcal</span></div>' +
        '<div class="macro-row mb-2">' +
        '<span class="macro-chip">P ' + (meal.protein || 0) + 'g</span>' +
        '<span class="macro-chip">C ' + (meal.carbs || 0) + 'g</span>' +
        '<span class="macro-chip">F ' + (meal.fat || 0) + 'g</span>' +
        '</div>' +
        '<p class="text-muted-2 mb-3" style="font-size:.8rem;line-height:1.3">' + afcEscape(meal.description || "") + '</p>' +
        '<button class="btn btn-block ' + (done ? 'btn-soft' : 'btn-fire') + ' mark-btn" data-cat="' + afcEscape(cat) + '" data-key="' + afcEscape(mealKey) + '" data-done="' + done + '">' +
        (done ? '<i class="bi bi-check-lg me-1"></i>COMPLETED' : 'MARK COMPLETED') +
        '</button>' +
        '</div></div></div>';
    }).join("");

    updateSummary(completedCount, totalKcal);
  }

  function updateSummary(done, kcal) {
    completedEl.textContent = done + " / 4";
    totalKcalEl.textContent = kcal;
    progressBar.style.width = Math.round((done / 4) * 100) + "%";
  }

  /* Toggle completion */
  container.addEventListener("click", async function (e) {
    var btn = e.target.closest(".mark-btn");
    if (!btn) return;
    var cat = btn.dataset.cat;
    var key = btn.dataset.key;
    var wasDone = btn.dataset.done === "true";
    var meal = allMeals[key];

    afcBusy(btn, true, "...");
    try {
      if (wasDone) {
        await afcDbRemove("users/" + session.uid + "/daily/" + afcTodayKey() + "/meals/" + cat);
      } else {
        await afcDailySet("meals/" + cat, {
          key: key,
          name: meal ? meal.name : key,
          calories: meal ? meal.calories || 0 : 0,
          at: new Date().toISOString()
        });
        afcToast("Meal completed!", "success");
      }
    } catch (err) {
      afcToast("Could not update.", "error");
    } finally {
      afcBusy(btn, false);
    }
  });
})();
