/* BMI Calculator page logic */
(async function () {
  var session;
  try { session = await requireAuth({ allowIncomplete: true }); } catch (e) { return; }
  afcMountLayout("dashboard");

  var profile = session.profile || {};
  var heightIn = qs("#heightInput");
  var weightIn = qs("#weightInput");
  var form = qs("#bmiForm");
  var calcBtn = qs("#calcBtn");
  var resultsCol = qs("#resultsCol");
  var bmiValueEl = qs("#bmiValue");
  var categoryLabel = qs("#bmiCategoryLabel");
  var gaugeArc = qs("#gaugeArc");
  var gaugeNeedle = qs("#gaugeNeedle");

  /* Prefill from profile */
  if (profile.height) heightIn.value = profile.height;
  if (profile.weight) weightIn.value = profile.weight;

  /* Load existing BMI if saved */
  try {
    var existing = await afcUserGet("health/bmi");
    if (existing && existing.value) showResult(existing.value, false);
  } catch (e) { /* ignore */ }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    var h = parseFloat(heightIn.value);
    var w = parseFloat(weightIn.value);
    var valid = true;

    if (!afcIsNumber(h, 50, 300)) {
      heightIn.classList.add("is-invalid");
      heightIn.nextElementSibling.textContent = "Enter height between 50–300 cm";
      valid = false;
    } else {
      heightIn.classList.remove("is-invalid");
      heightIn.nextElementSibling.textContent = "";
    }

    if (!afcIsNumber(w, 10, 500)) {
      weightIn.classList.add("is-invalid");
      weightIn.nextElementSibling.textContent = "Enter weight between 10–500 kg";
      valid = false;
    } else {
      weightIn.classList.remove("is-invalid");
      weightIn.nextElementSibling.textContent = "";
    }

    if (!valid) return;

    afcBusy(calcBtn, true, "Calculating...");
    try {
      var bmi = afcCalcBMI(h, w);
      var cat = afcBMICategory(bmi);
      showResult(bmi, true);

      await afcUserSet("health/bmi", {
        value: bmi,
        category: cat.label,
        height: h,
        weight: w,
        date: afcTodayKey()
      });
      afcToast("BMI calculated!", "success");
    } catch (err) {
      afcToast("Could not save. Check connection.", "error");
    } finally {
      afcBusy(calcBtn, false);
    }
  });

  function showResult(bmi, animate) {
    resultsCol.style.display = "";
    var cat = afcBMICategory(bmi);

    if (animate) {
      afcAnimateCount(bmiValueEl, bmi, 900);
    } else {
      bmiValueEl.textContent = bmi;
    }

    categoryLabel.innerHTML = '<span class="chip ' + cat.cls + '">' + afcEscape(cat.label) + "</span>";

    /* Highlight active segment */
    var segMap = { Underweight: "underweight", Normal: "normal", Overweight: "overweight", Obesity: "obesity" };
    qsa("#scaleLegend .chip").forEach(function (el) {
      el.style.opacity = el.dataset.seg === segMap[cat.label] ? "1" : "0.4";
      el.style.transform = el.dataset.seg === segMap[cat.label] ? "scale(1.1)" : "scale(1)";
    });

    /* Gauge needle: map BMI 10-40 to angle -90..+90 degrees */
    var pct = afcClamp((bmi - 10) / 30, 0, 1);
    var angle = -90 + pct * 180;
    gaugeNeedle.style.transform = "rotate(" + angle + "deg)";

    /* Arc fill */
    var totalLen = 314;
    gaugeArc.style.strokeDashoffset = String(totalLen * (1 - pct));

    /* Color arc by category */
    var colors = { amber: "var(--warning)", green: "var(--success)", red: "var(--danger)" };
    gaugeArc.setAttribute("stroke", colors[cat.cls] || "var(--primary)");
  }
})();
