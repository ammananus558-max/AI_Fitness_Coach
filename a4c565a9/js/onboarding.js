/* ============================================================
   AI FITNESS COACH — ONBOARDING WIZARD
   6-step profile setup: name, age, gender, height, weight, activity.
   Depends on: utils.js, firebase-db.js, app.js
   ============================================================ */

(async function () {
  var session;
  try { session = await requireAuth({ allowIncomplete: true }); } catch (e) { return; }
  afcMountLayout("profile");

  var mainEl = qs("#mainContent");
  var profile = session.profile || {};

  /* Step definitions */
  var steps = [
    { key: "name", label: "Your Name", type: "text" },
    { key: "age", label: "Your Age", type: "number" },
    { key: "gender", label: "Gender", type: "pills" },
    { key: "height", label: "Height (cm)", type: "number" },
    { key: "weight", label: "Weight (kg)", type: "number" },
    { key: "activityLevel", label: "Activity Level", type: "cards" }
  ];

  var data = {
    name: profile.name || "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    activityLevel: ""
  };

  var currentStep = 0;

  function render() {
    var step = steps[currentStep];

    var segs = '';
    for (var i = 0; i < steps.length; i++) {
      var state = i < currentStep ? ' done' : (i === currentStep ? ' active' : '');
      segs += '<div class="ob-segment' + state + '" aria-hidden="true"></div>';
    }

    var html = '<div class="onboarding-card">' +
      '<div class="tile tile-pad anim-fade-up">' +
      '<div class="d-flex justify-content-between align-items-center mb-3">' +
      '<span class="chip fire">STEP ' + (currentStep + 1) + ' / ' + steps.length + '</span>' +
      '<span class="text-muted-2 fw-bold" style="font-size:.82rem">' + afcEscape(step.label) + '</span></div>' +
      '<div class="ob-progress mb-4" role="progressbar" aria-valuenow="' + (currentStep + 1) + '" aria-valuemax="' + steps.length + '">' + segs + '</div>';

    if (step.type === "text") {
      html += '<div class="mb-3"><label class="form-label" for="ob-input">' + afcEscape(step.label) + '</label>' +
        '<input type="text" class="form-control" id="ob-input" placeholder="Enter your full name" value="' + afcEscape(data[step.key]) + '" aria-label="' + afcEscape(step.label) + '"></div>';
    } else if (step.type === "number") {
      var minMax = "";
      if (step.key === "age") minMax = 'min="10" max="100"';
      if (step.key === "height") minMax = 'min="90" max="250"';
      if (step.key === "weight") minMax = 'min="25" max="300"';
      html += '<div class="mb-3"><label class="form-label" for="ob-input">' + afcEscape(step.label) + '</label>' +
        '<input type="number" class="form-control" id="ob-input" placeholder="Enter ' + afcEscape(step.label.toLowerCase()) + '" value="' + afcEscape(data[step.key]) + '" ' + minMax + ' aria-label="' + afcEscape(step.label) + '"></div>';
    } else if (step.type === "pills") {
      var genders = ["Male", "Female", "Prefer not to say"];
      html += '<div class="pill-row mb-3" role="radiogroup" aria-label="Gender">';
      genders.forEach(function (g) {
        var val = g.toLowerCase().replace(/\s+/g, "_");
        if (val === "prefer_not_to_say") val = "other";
        var sel = data.gender === val ? " selected" : "";
        html += '<button type="button" class="pill-option' + sel + '" data-value="' + val + '" role="radio" aria-checked="' + (sel ? "true" : "false") + '">' + afcEscape(g) + '</button>';
      });
      html += '</div>';
    } else if (step.type === "cards") {
      var levels = [
        { val: "sedentary", icon: "bi-cup-hot", title: "Sedentary", desc: "Little or no exercise, desk job" },
        { val: "light", icon: "bi-person-walking", title: "Lightly Active", desc: "Light exercise 1-3 days/week" },
        { val: "moderate", icon: "bi-bicycle", title: "Moderately Active", desc: "Moderate exercise 3-5 days/week" },
        { val: "very", icon: "bi-lightning-fill", title: "Very Active", desc: "Hard exercise 6-7 days/week" }
      ];
      html += '<div class="row g-3 mb-3">';
      levels.forEach(function (lv) {
        var sel = data.activityLevel === lv.val ? " selected" : "";
        html += '<div class="col-12 col-md-6"><div class="select-card tile' + sel + '" data-value="' + lv.val + '" tabindex="0" role="radio" aria-checked="' + (sel ? "true" : "false") + '">' +
          '<div class="sel-icon"><i class="bi ' + lv.icon + '" aria-hidden="true"></i></div>' +
          '<h4>' + afcEscape(lv.title) + '</h4><p>' + afcEscape(lv.desc) + '</p></div></div>';
      });
      html += '</div>';
    }

    html += '<div class="invalid-feedback-2 mb-3" id="ob-error" role="alert"></div>' +
      '<div class="d-flex gap-3 mt-4">' +
      '<button class="btn btn-ghost flex-fill" id="ob-back"' + (currentStep === 0 ? ' disabled' : '') + '>BACK</button>' +
      '<button class="btn btn-fire flex-fill" id="ob-next">' + (currentStep === steps.length - 1 ? 'COMPLETE' : 'CONTINUE') + '</button>' +
      '</div></div></div>';

    mainEl.innerHTML = html;
    bindEvents();
  }

  function validate() {
    var step = steps[currentStep];
    var errEl = qs("#ob-error");
    if (errEl) errEl.textContent = "";

    if (step.type === "text" || step.type === "number") {
      var input = qs("#ob-input");
      if (!input) return false;
      var val = input.value.trim();
      data[step.key] = val;

      if (step.key === "name" && val.length < 2) {
        if (errEl) errEl.textContent = "Name must be at least 2 characters.";
        return false;
      }
      if (step.key === "age" && !afcIsNumber(val, 10, 100)) {
        if (errEl) errEl.textContent = "Please enter a valid age (10–100).";
        return false;
      }
      if (step.key === "height" && !afcIsNumber(val, 90, 250)) {
        if (errEl) errEl.textContent = "Please enter height between 90 and 250 cm.";
        return false;
      }
      if (step.key === "weight" && !afcIsNumber(val, 25, 300)) {
        if (errEl) errEl.textContent = "Please enter weight between 25 and 300 kg.";
        return false;
      }
      return true;
    }
    if (step.type === "pills") {
      if (!data.gender) {
        if (errEl) errEl.textContent = "Please select an option.";
        return false;
      }
      return true;
    }
    if (step.type === "cards") {
      if (!data.activityLevel) {
        if (errEl) errEl.textContent = "Please select your activity level.";
        return false;
      }
      return true;
    }
    return true;
  }

  function bindEvents() {
    var nextBtn = qs("#ob-next");
    var backBtn = qs("#ob-back");

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        if (!validate()) return;
        if (currentStep < steps.length - 1) {
          currentStep++;
          render();
        } else {
          saveProfile();
        }
      });
    }

    if (backBtn) {
      backBtn.addEventListener("click", function () {
        if (currentStep > 0) {
          currentStep--;
          render();
        }
      });
    }

    /* Pill selection */
    qsa(".pill-option").forEach(function (el) {
      el.addEventListener("click", function () {
        qsa(".pill-option").forEach(function (p) { p.classList.remove("selected"); p.setAttribute("aria-checked", "false"); });
        el.classList.add("selected");
        el.setAttribute("aria-checked", "true");
        data.gender = el.dataset.value;
      });
    });

    /* Card selection */
    qsa(".select-card").forEach(function (el) {
      el.addEventListener("click", function () {
        qsa(".select-card").forEach(function (c) { c.classList.remove("selected"); c.setAttribute("aria-checked", "false"); });
        el.classList.add("selected");
        el.setAttribute("aria-checked", "true");
        data.activityLevel = el.dataset.value;
      });
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.click(); }
      });
    });

    /* Enter key continues */
    var input = qs("#ob-input");
    if (input) {
      input.focus();
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); if (nextBtn) nextBtn.click(); }
      });
    }
  }

  async function saveProfile() {
    afcLoader("Saving profile...");
    try {
      await afcUserSet("profile", {
        age: Number(data.age),
        gender: data.gender,
        height: Number(data.height),
        weight: Number(data.weight),
        activityLevel: data.activityLevel
      });
      await afcUserUpdate("", {
        name: data.name,
        profileCompleted: true
      });
      afcLoaderOff();
      afcToast("Profile saved \u2713", "success");
      location.href = "goal.html";
    } catch (err) {
      afcLoaderOff();
      afcToast(afcFriendlyAuthError(err), "error");
    }
  }

  render();
})();
