/* Diet Plans page logic */
(async function () {
  var session;
  try { session = await requireAuth(); } catch (e) { return; }
  afcMountLayout("meals");

  var plansGrid = qs("#plansGrid");
  var mealsGrid = qs("#mealsGrid");
  var tabsWrap = qs("#categoryTabs");
  var activeCat = "breakfast";
  var allMeals = {};
  var todayMeals = {};

  /* Load diet plans */
  try {
    afcLoader("Loading diet plans...");
    var plans = await afcDbGet("dietPlans") || {};
    renderPlans(plans);
  } catch (err) {
    afcToast("Could not load diet plans.", "error");
  }

  /* Listen to meals collection */
  try {
    await afcDbOnValue("meals", function (data) {
      allMeals = data || {};
      renderMeals();
    });
  } catch (err) {
    afcToast("Could not load meals.", "error");
  }

  /* Listen to today's completed meals */
  try {
    await afcDbOnValue("users/" + session.uid + "/daily/" + afcTodayKey() + "/meals", function (data) {
      todayMeals = data || {};
      renderMeals();
    });
  } catch (err) { /* ignore */ }

  afcLoaderOff();

  /* Tab switching */
  tabsWrap.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-cat]");
    if (!btn) return;
    activeCat = btn.dataset.cat;
    qsa("[data-cat]", tabsWrap).forEach(function (b) {
      b.classList.remove("fire", "active-tab");
      b.setAttribute("aria-selected", "false");
    });
    btn.classList.add("fire", "active-tab");
    btn.setAttribute("aria-selected", "true");
    renderMeals();
  });

  function renderPlans(plans) {
    var keys = Object.keys(plans);
    if (!keys.length) {
      plansGrid.innerHTML = '<div class="col-12"><div class="empty-state"><i class="bi bi-journal-x"></i><p>No diet plans available yet.</p></div></div>';
      return;
    }
    plansGrid.innerHTML = keys.map(function (k) {
      var p = plans[k];
      var mealCount = (p.meals || []).length;
      return '<div class="col-md-6 col-lg-4">' +
        '<div class="tile tile-pad tile-hover">' +
        '<h4 class="card-title-2 mb-1">' + afcEscape(p.name) + '</h4>' +
        '<p class="text-muted-2 mb-2" style="font-size:.88rem">' + afcEscape(p.description) + '</p>' +
        '<span class="chip fire">' + mealCount + ' meals</span>' +
        '</div></div>';
    }).join("");
  }

  function renderMeals() {
    var filtered = [];
    Object.keys(allMeals).forEach(function (k) {
      var m = allMeals[k];
      if (m.active === false) return;
      if (m.category === activeCat) filtered.push({ key: k, data: m });
    });

    if (!filtered.length) {
      mealsGrid.innerHTML = '<div class="col-12"><div class="empty-state"><i class="bi bi-egg-fried"></i><p>No ' + afcEscape(activeCat) + ' meals available.</p></div></div>';
      return;
    }

    var todayRecord = todayMeals[activeCat];
    var completedKey = todayRecord ? todayRecord.key : null;

    mealsGrid.innerHTML = filtered.map(function (item) {
      var m = item.data;
      var done = completedKey === item.key;
      var imgHtml = m.image
        ? '<img src="' + afcEscape(m.image) + '" alt="' + afcEscape(m.name) + '" loading="lazy">'
        : '<i class="bi bi-egg-fried" aria-hidden="true"></i>';

      return '<div class="col-sm-6 col-lg-4 col-xl-3">' +
        '<div class="tile" style="overflow:hidden">' +
        '<div class="media-card-img cat-meal">' + imgHtml + '</div>' +
        '<div class="p-3">' +
        '<h5 class="card-title-2 mb-1">' + afcEscape(m.name) + '</h5>' +
        '<div style="font-size:1.4rem;font-weight:900;margin-bottom:.4rem">' + (m.calories || 0) + ' <span style="font-size:.75rem;color:var(--muted)">kcal</span></div>' +
        '<div class="macro-row mb-2">' +
        '<span class="macro-chip">P ' + (m.protein || 0) + 'g</span>' +
        '<span class="macro-chip">C ' + (m.carbs || 0) + 'g</span>' +
        '<span class="macro-chip">F ' + (m.fat || 0) + 'g</span>' +
        '</div>' +
        '<p class="text-muted-2 mb-3" style="font-size:.82rem">' + afcEscape(m.description || "") + '</p>' +
        '<button class="btn btn-block ' + (done ? 'btn-soft' : 'btn-fire') + ' mark-meal-btn" data-key="' + afcEscape(item.key) + '" data-done="' + done + '">' +
        (done ? '<i class="bi bi-check-lg me-1"></i>COMPLETED' : 'MARK COMPLETED') +
        '</button>' +
        '</div></div></div>';
    }).join("");
  }

  /* Meal completion toggle */
  mealsGrid.addEventListener("click", async function (e) {
    var btn = e.target.closest(".mark-meal-btn");
    if (!btn) return;
    var key = btn.dataset.key;
    var wasDone = btn.dataset.done === "true";
    var meal = allMeals[key];
    if (!meal) return;

    afcBusy(btn, true, "...");
    try {
      if (wasDone) {
        await afcUserSet("daily/" + afcTodayKey() + "/meals/" + activeCat, null);
        await afcDbRemove("users/" + session.uid + "/daily/" + afcTodayKey() + "/meals/" + activeCat);
      } else {
        await afcDailySet("meals/" + activeCat, {
          key: key,
          name: meal.name,
          calories: meal.calories || 0,
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
