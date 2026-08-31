/* Calorie Calculator page logic */
(async function () {
  var session;
  try { session = await requireAuth({ allowIncomplete: true }); } catch (e) { return; }
  afcMountLayout("dashboard");

  var profile = session.profile || {};
  var ageIn = qs("#ageInput");
  var genderSel = qs("#genderSelect");
  var heightIn = qs("#heightInput");
  var weightIn = qs("#weightInput");
  var actSel = qs("#activitySelect");
  var form = qs("#calForm");
  var calcBtn = qs("#calcBtn");
  var resultsCol = qs("#resultsCol");
  var bmrEl = qs("#bmrVal");
  var maintEl = qs("#maintVal");
  var targetEl = qs("#targetVal");

  /* Prefill from profile */
  if (profile.age) ageIn.value = profile.age;
  if (profile.gender) genderSel.value = profile.gender;
  if (profile.height) heightIn.value = profile.height;
  if (profile.weight) weightIn.value = profile.weight;
  if (profile.activityLevel) actSel.value = profile.activityLevel;

  var isSetup = location.search.indexOf("setup=1") !== -1;

  /* Load existing calories if saved */
  try {
    var existing = await afcUserGet("health/calories");
    if (existing && existing.target) showResult(existing.bmr, existing.maintenanceCalories, existing.target, false);
  } catch (e) { /* ignore */ }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    var age = parseInt(ageIn.value, 10);
    var gender = genderSel.value;
    var h = parseFloat(heightIn.value);
    var w = parseFloat(weightIn.value);
    var activity = actSel.value;
    var valid = true;

    var fields = [
      { el: ageIn, ok: afcIsNumber(age, 10, 120), msg: "Enter age between 10–120" },
      { el: genderSel, ok: !!gender, msg: "Please select gender" },
      { el: heightIn, ok: afcIsNumber(h, 50, 300), msg: "Enter height between 50–300 cm" },
      { el: weightIn, ok: afcIsNumber(w, 10, 500), msg: "Enter weight between 10–500 kg" },
      { el: actSel, ok: !!activity, msg: "Please select activity level" }
    ];

    fields.forEach(function (f) {
      var fb = f.el.nextElementSibling;
      if (!f.ok) {
        f.el.classList.add("is-invalid");
        if (fb) fb.textContent = f.msg;
        valid = false;
      } else {
        f.el.classList.remove("is-invalid");
        if (fb) fb.textContent = "";
      }
    });

    if (!valid) return;

    afcBusy(calcBtn, true, "Calculating...");
    try {
      var result = afcCalcCalories({ age: age, gender: gender, height: h, weight: w, activityLevel: activity });
      if (!result) {
        afcToast("Could not calculate. Check inputs.", "error");
        afcBusy(calcBtn, false);
        return;
      }

      showResult(result.bmr, result.maintenance, result.target, true);

      await afcUserSet("health/calories", {
        bmr: result.bmr,
        maintenanceCalories: result.maintenance,
        target: result.target
      });
      /* Also save individual keys for spec parity */
      await afcUserSet("health/bmr", result.bmr);
      await afcUserSet("health/maintenanceCalories", result.maintenance);

      /* Mark profile complete on setup flow */
      if (isSetup) {
        await afcUserUpdate("", { profileCompleted: true });
      }

      afcToast("Calories calculated!", "success");

      if (isSetup) {
        afcConfetti(80);
        setTimeout(function () {
          afcToast("Setup complete!", "success");
        }, 600);
      }
    } catch (err) {
      afcToast("Could not save. Check connection.", "error");
    } finally {
      afcBusy(calcBtn, false);
    }
  });

  function showResult(bmr, maint, target, animate) {
    resultsCol.style.display = "";
    if (animate) {
      afcAnimateCount(bmrEl, bmr, 800);
      afcAnimateCount(maintEl, maint, 900);
      afcAnimateCount(targetEl, target, 1000);
    } else {
      bmrEl.textContent = bmr;
      maintEl.textContent = maint;
      targetEl.textContent = target;
    }
  }
})();
