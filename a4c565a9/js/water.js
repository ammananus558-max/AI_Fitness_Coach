/* Water Tracker page logic */
(async function () {
  var session;
  try { session = await requireAuth(); } catch (e) { return; }
  afcMountLayout("water");

  var ringSvg = qs(".ring-wrap svg");
  var waterCountEl = qs("#waterCount");
  var goalLabelEl = qs("#waterGoalLabel");
  var bigDisplay = qs("#waterBigDisplay");
  var glassesRow = qs("#glassesRow");
  var plusBtn = qs("#plusBtn");
  var minusBtn = qs("#minusBtn");

  var goal = 8;
  var current = 0;

  /* Load goal from settings */
  try {
    var settings = await afcDbGet("settings");
    if (settings && settings.waterGoal) goal = Number(settings.waterGoal) || 8;
  } catch (e) { /* default 8 */ }
  goalLabelEl.textContent = "/ " + goal + " GLASSES";

  /* Live listener on today's water */
  try {
    await afcDbOnValue("users/" + session.uid + "/daily/" + afcTodayKey() + "/water", function (val) {
      current = typeof val === "number" ? val : 0;
      updateUI();
    });
  } catch (err) {
    /* fallback: read once */
    try {
      var v = await afcDailyGet("water");
      current = typeof v === "number" ? v : 0;
      updateUI();
    } catch (e2) { updateUI(); }
  }

  plusBtn.addEventListener("click", function () { changeWater(1); });
  minusBtn.addEventListener("click", function () { changeWater(-1); });

  async function changeWater(delta) {
    var next = current + delta;
    if (next < 0) next = 0;
    current = next;
    updateUI();
    try {
      await afcDailySet("water", current);
      if (current === goal && delta > 0) {
        afcToast("Goal reached!", "success");
        afcConfetti(40);
      }
    } catch (err) {
      afcToast("Could not save.", "error");
    }
  }

  function updateUI() {
    waterCountEl.textContent = current;
    bigDisplay.textContent = current;
    var pct = Math.min(100, Math.round((current / goal) * 100));
    afcRing(ringSvg, pct);

    /* Glass icons */
    var html = "";
    for (var i = 0; i < goal; i++) {
      var filled = i < current;
      html += '<i class="bi bi-cup-fill" style="font-size:1.4rem;color:' +
        (filled ? "var(--info)" : "var(--border)") +
        ';transition:color .3s" aria-hidden="true"></i>';
    }
    glassesRow.innerHTML = html;
  }
})();
