/* Progress Tracker page logic */
(async function () {
  var session;
  try { session = await requireAuth(); } catch (e) { return; }
  afcMountLayout("progress");

  var timeframe = 14;
  var dailyData = {};
  var weightLog = {};

  afcLoader("Loading progress data...");

  /* Seed weight log with profile weight if empty */
  try {
    weightLog = await afcUserGet("progress/weight") || {};
    if (!Object.keys(weightLog).length && session.profile && session.profile.weight) {
      weightLog[afcTodayKey()] = session.profile.weight;
      await afcUserSet("progress/weight", weightLog);
    }
  } catch (e) { /* ignore */ }

  /* Load all daily data */
  try {
    dailyData = await afcUserGet("daily") || {};
  } catch (e) { /* ignore */ }

  /* Load streak */
  var streak = { current: 0 };
  try { streak = await afcGetStreak(); } catch (e) { /* ignore */ }

  afcLoaderOff();

  /* Timeframe chip switching */
  qs("#timeframeChips").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-days]");
    if (!btn) return;
    timeframe = parseInt(btn.dataset.days, 10);
    qsa("[data-days]", qs("#timeframeChips")).forEach(function (b) {
      b.classList.remove("fire", "active-tf");
    });
    btn.classList.add("fire", "active-tf");
    renderStats();
    renderCharts();
  });

  renderStats();
  renderCharts();

  function getDateRange(days) {
    var dates = [];
    var today = afcTodayKey();
    for (var i = days - 1; i >= 0; i--) {
      dates.push(afcAddDays(today, -i));
    }
    return dates;
  }

  function renderStats() {
    /* Weight change: first vs latest entry in weight log */
    var wKeys = Object.keys(weightLog).sort();
    var wChange = "--";
    if (wKeys.length >= 2) {
      var diff = weightLog[wKeys[wKeys.length - 1]] - weightLog[wKeys[0]];
      wChange = (diff > 0 ? "+" : "") + diff.toFixed(1);
    } else if (wKeys.length === 1) {
      wChange = "0.0";
    }
    qs("#statWeightChange").textContent = wChange;

    /* Workouts completed count */
    var workoutCount = 0;
    var totalMinutes = 0;
    var waterSum = 0;
    var waterDays = 0;
    var mealsCount = 0;

    Object.keys(dailyData).forEach(function (dk) {
      var d = dailyData[dk];
      if (!d) return;
      if (d.workoutCompleted) workoutCount++;
      if (d.workoutMinutes) totalMinutes += Number(d.workoutMinutes) || 0;
      if (typeof d.water === "number") { waterSum += d.water; waterDays++; }
      if (d.meals) {
        Object.keys(d.meals).forEach(function (mk) {
          if (d.meals[mk]) mealsCount++;
        });
      }
    });

    afcAnimateCount(qs("#statWorkouts"), workoutCount, 700);
    afcAnimateCount(qs("#statMinutes"), totalMinutes, 800);
    var avgWater = waterDays > 0 ? Math.round(waterSum / waterDays * 10) / 10 : 0;
    qs("#statAvgWater").textContent = avgWater;
    afcAnimateCount(qs("#statMeals"), mealsCount, 700);
    afcAnimateCount(qs("#statStreak"), streak.current || 0, 600);
  }

  function renderCharts() {
    var dates = getDateRange(timeframe);

    /* Weight chart (line) */
    var wData = dates.map(function (d) { return weightLog[d] != null ? weightLog[d] : null; });
    drawLineChart(qs("#chartWeight"), dates, wData, "kg");

    /* Water chart (bars) */
    var waterData = dates.map(function (d) {
      var dd = dailyData[d];
      return dd && typeof dd.water === "number" ? dd.water : 0;
    });
    drawBarChart(qs("#chartWater"), dates, waterData, "glasses");

    /* Workout minutes (bars) */
    var minData = dates.map(function (d) {
      var dd = dailyData[d];
      return dd && dd.workoutMinutes ? Number(dd.workoutMinutes) : 0;
    });
    drawBarChart(qs("#chartWorkout"), dates, minData, "min", true);

    /* Meals (bars) */
    var mealData = dates.map(function (d) {
      var dd = dailyData[d];
      if (!dd || !dd.meals) return 0;
      return Object.keys(dd.meals).filter(function (k) { return !!dd.meals[k]; }).length;
    });
    drawBarChart(qs("#chartMeals"), dates, mealData, "meals");
  }

  /* ---- Vanilla SVG Chart Builders ---- */

  function drawLineChart(container, labels, values, unit) {
    if (!container) return;
    var validVals = values.filter(function (v) { return v != null; });
    if (validVals.length < 2) {
      container.innerHTML = '<div class="empty-state"><i class="bi bi-graph-up"></i><p>Not enough data yet.</p></div>';
      return;
    }

    var w = 500, h = 170, pad = { t: 20, r: 20, b: 30, l: 45 };
    var iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
    var minV = Math.min.apply(null, validVals);
    var maxV = Math.max.apply(null, validVals);
    if (minV === maxV) { minV -= 1; maxV += 1; }
    var range = maxV - minV;

    var points = [];
    var areaPoints = [];
    var step = labels.length > 1 ? iw / (labels.length - 1) : 0;

    for (var i = 0; i < values.length; i++) {
      if (values[i] == null) continue;
      var x = pad.l + i * step;
      var y = pad.t + ih - ((values[i] - minV) / range) * ih;
      points.push(x + "," + y);
      areaPoints.push(x + "," + y);
    }

    /* Area fill path */
    var firstX = pad.l;
    var lastX = pad.l + (values.length - 1) * step;
    var baseY = pad.t + ih;
    var areaD = "M" + firstX + "," + baseY + " L" + areaPoints.join(" L") + " L" + lastX + "," + baseY + " Z";

    /* Grid lines */
    var gridLines = "";
    for (var g = 0; g <= 4; g++) {
      var gy = pad.t + (ih / 4) * g;
      var gVal = maxV - (range / 4) * g;
      gridLines += '<line class="chart-grid-line" x1="' + pad.l + '" y1="' + gy + '" x2="' + (w - pad.r) + '" y2="' + gy + '"/>';
      gridLines += '<text class="chart-label" x="' + (pad.l - 5) + '" y="' + (gy + 4) + '" text-anchor="end">' + gVal.toFixed(1) + '</text>';
    }

    /* X axis labels (show every few) */
    var xLabels = "";
    var labelStep = Math.max(1, Math.floor(labels.length / 5));
    for (var li = 0; li < labels.length; li += labelStep) {
      var lx = pad.l + li * step;
      var shortDate = labels[li].slice(5);
      xLabels += '<text class="chart-label" x="' + lx + '" y="' + (h - 5) + '" text-anchor="middle">' + shortDate + '</text>';
    }

    container.innerHTML = '<svg class="chart-svg" viewBox="0 0 ' + w + ' ' + h + '">' +
      gridLines +
      '<path class="chart-area" d="' + areaD + '"/>' +
      '<polyline class="chart-line" points="' + points.join(" ") + '"/>' +
      xLabels +
      '</svg>';
  }

  function drawBarChart(container, labels, values, unit, altColor) {
    if (!container) return;
    var maxV = Math.max.apply(null, values.concat([1]));
    if (maxV === 0) {
      container.innerHTML = '<div class="empty-state"><i class="bi bi-bar-chart"></i><p>No data yet.</p></div>';
      return;
    }

    var w = 500, h = 170, pad = { t: 20, r: 20, b: 30, l: 45 };
    var iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
    var barW = Math.max(4, (iw / labels.length) * 0.6);
    var gap = iw / labels.length;

    var bars = "";
    var gridLines = "";

    for (var g = 0; g <= 4; g++) {
      var gy = pad.t + (ih / 4) * g;
      var gVal = maxV - (maxV / 4) * g;
      gridLines += '<line class="chart-grid-line" x1="' + pad.l + '" y1="' + gy + '" x2="' + (w - pad.r) + '" y2="' + gy + '"/>';
      gridLines += '<text class="chart-label" x="' + (pad.l - 5) + '" y="' + (gy + 4) + '" text-anchor="end">' + Math.round(gVal) + '</text>';
    }

    var xLabels = "";
    var labelStep = Math.max(1, Math.floor(labels.length / 5));

    for (var i = 0; i < values.length; i++) {
      var bh = (values[i] / maxV) * ih;
      var bx = pad.l + i * gap + (gap - barW) / 2;
      var by = pad.t + ih - bh;
      bars += '<rect class="chart-bar' + (altColor ? ' alt' : '') + '" x="' + bx + '" y="' + by + '" width="' + barW + '" height="' + bh + '" rx="3"/>';

      if (i % labelStep === 0) {
        var shortDate = labels[i].slice(5);
        xLabels += '<text class="chart-label" x="' + (bx + barW / 2) + '" y="' + (h - 5) + '" text-anchor="middle">' + shortDate + '</text>';
      }
    }

    container.innerHTML = '<svg class="chart-svg" viewBox="0 0 ' + w + ' ' + h + '">' +
      gridLines + bars + xLabels +
      '</svg>';
  }
})();
