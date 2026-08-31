/* ============================================================
   AI FITNESS COACH — GOAL & FITNESS LEVEL SELECTION
   Two-stage card picker: goal then level. Saves to Firebase.
   Depends on: utils.js, firebase-db.js, app.js
   ============================================================ */

(async function () {
  var session;
  try { session = await requireAuth({ allowIncomplete: true }); } catch (e) { return; }
  afcMountLayout("dashboard");

  var mainEl = qs("#mainContent");
  var selectedGoal = "";
  var selectedLevel = "";
  var stage = 1;

  var goals = [
    { key: "lose_weight", icon: "bi-fire", title: "LOSE WEIGHT", desc: "Burn fat and get lean with targeted workouts and nutrition." },
    { key: "gain_muscle", icon: "bi-trophy-fill", title: "GAIN MUSCLE", desc: "Build strength and size with progressive training plans." },
    { key: "stay_healthy", icon: "bi-heart-pulse-fill", title: "STAY HEALTHY", desc: "Maintain wellness with balanced exercise and diet." },
    { key: "improve_fitness", icon: "bi-lightning-charge-fill", title: "IMPROVE FITNESS", desc: "Boost endurance, flexibility and overall performance." }
  ];

  var levels = [
    { key: "beginner", icon: "bi-emoji-smile", title: "BEGINNER", desc: "New to fitness or returning after a long break." },
    { key: "intermediate", icon: "bi-star-half", title: "INTERMEDIATE", desc: "Regularly active with some training experience." },
    { key: "advanced", icon: "bi-award-fill", title: "ADVANCED", desc: "Experienced athlete seeking intense programs." }
  ];

  function render() {
    if (stage === 1) renderGoalStage();
    else renderLevelStage();
  }

  function renderGoalStage() {
    var html = '<div class="onboarding-card">' +
      '<div class="ob-progress mb-4" role="progressbar" aria-valuenow="1" aria-valuemax="2">' +
      '<div class="ob-segment active" aria-hidden="true"></div><div class="ob-segment" aria-hidden="true"></div></div>' +
      '<div class="text-center mb-4 anim-fade-up"><h2 class="fw-bold">CHOOSE YOUR GOAL</h2>' +
      '<p class="text-muted-2">What do you want to achieve?</p></div>' +
      '<div class="row g-3 mb-4 stagger">';

    goals.forEach(function (g) {
      var sel = selectedGoal === g.key ? " selected" : "";
      html += '<div class="col-12 col-md-6">' +
        '<div class="select-card tile tile-hover' + sel + '" data-goal="' + g.key + '" tabindex="0" role="radio" aria-checked="' + (sel ? "true" : "false") + '">' +
        '<div class="sel-icon"><i class="bi ' + g.icon + '" aria-hidden="true"></i></div>' +
        '<h4>' + afcEscape(g.title) + '</h4><p>' + afcEscape(g.desc) + '</p></div></div>';
    });

    html += '</div>' +
      '<div class="d-flex gap-3 justify-content-between align-items-center">' +
      '<a href="onboarding.html" class="btn btn-ghost">BACK</a>' +
      '<button class="btn btn-fire" id="goal-next"' + (!selectedGoal ? " disabled" : "") + '>CONTINUE</button>' +
      '</div>' +
      '<div class="text-center mt-3"><a href="dashboard.html" class="text-muted-2" style="font-size:.85rem">Skip for now</a></div>' +
      '</div>';

    mainEl.innerHTML = html;
    bindGoalEvents();
  }

  function renderLevelStage() {
    var html = '<div class="onboarding-card">' +
      '<div class="ob-progress mb-4" role="progressbar" aria-valuenow="2" aria-valuemax="2">' +
      '<div class="ob-segment done" aria-hidden="true"></div><div class="ob-segment active" aria-hidden="true"></div></div>' +
      '<div class="text-center mb-4 anim-fade-up"><h2 class="fw-bold">YOUR FITNESS LEVEL</h2>' +
      '<p class="text-muted-2">How experienced are you?</p></div>' +
      '<div class="row g-3 mb-4 stagger">';

    levels.forEach(function (lv) {
      var sel = selectedLevel === lv.key ? " selected" : "";
      html += '<div class="col-12 col-md-4">' +
        '<div class="select-card tile tile-hover' + sel + '" data-level="' + lv.key + '" tabindex="0" role="radio" aria-checked="' + (sel ? "true" : "false") + '">' +
        '<div class="sel-icon"><i class="bi ' + lv.icon + '" aria-hidden="true"></i></div>' +
        '<h4>' + afcEscape(lv.title) + '</h4><p>' + afcEscape(lv.desc) + '</p></div></div>';
    });

    html += '</div>' +
      '<div class="d-flex gap-3 justify-content-between align-items-center">' +
      '<button class="btn btn-ghost" id="level-back">BACK</button>' +
      '<button class="btn btn-fire" id="level-save"' + (!selectedLevel ? " disabled" : "") + '>CONTINUE</button>' +
      '</div>' +
      '<div class="text-center mt-3"><a href="dashboard.html" class="text-muted-2" style="font-size:.85rem">Skip for now</a></div>' +
      '</div>';

    mainEl.innerHTML = html;
    bindLevelEvents();
  }

  function bindGoalEvents() {
    qsa("[data-goal]").forEach(function (el) {
      el.addEventListener("click", function () {
        qsa("[data-goal]").forEach(function (c) { c.classList.remove("selected"); c.setAttribute("aria-checked", "false"); });
        el.classList.add("selected");
        el.setAttribute("aria-checked", "true");
        selectedGoal = el.dataset.goal;
        var nextBtn = qs("#goal-next");
        if (nextBtn) nextBtn.disabled = false;
      });
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.click(); }
      });
    });

    var nextBtn = qs("#goal-next");
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        if (selectedGoal) { stage = 2; render(); }
      });
    }
  }

  function bindLevelEvents() {
    qsa("[data-level]").forEach(function (el) {
      el.addEventListener("click", function () {
        qsa("[data-level]").forEach(function (c) { c.classList.remove("selected"); c.setAttribute("aria-checked", "false"); });
        el.classList.add("selected");
        el.setAttribute("aria-checked", "true");
        selectedLevel = el.dataset.level;
        var saveBtn = qs("#level-save");
        if (saveBtn) saveBtn.disabled = false;
      });
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.click(); }
      });
    });

    var backBtn = qs("#level-back");
    if (backBtn) {
      backBtn.addEventListener("click", function () {
        stage = 1;
        render();
      });
    }

    var saveBtn = qs("#level-save");
    if (saveBtn) {
      saveBtn.addEventListener("click", async function () {
        if (!selectedGoal || !selectedLevel) return;
        afcBusy(saveBtn, true, "Saving...");
        try {
          await afcUserSet("goal", selectedGoal);
          await afcUserSet("fitnessLevel", selectedLevel);
          afcBusy(saveBtn, false);
          afcToast("Goal saved \u2713", "success");
          location.href = "bmi.html";
        } catch (err) {
          afcBusy(saveBtn, false);
          afcToast(afcFriendlyAuthError(err), "error");
        }
      });
    }
  }

  render();
})();
