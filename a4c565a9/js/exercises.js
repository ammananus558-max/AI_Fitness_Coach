/* ============================================================
   AI FITNESS COACH — EXERCISES LIBRARY
   ============================================================ */
(async function () {
  var session;
  try { session = await requireAuth(); } catch (e) { return; }
  afcMountLayout("workout");

  /* ---------- State ---------- */
  var allExercises = {};
  var activeCategory = "all";
  var searchQuery = "";

  var CATEGORIES = [
    { key: "all", label: "All" },
    { key: "Full Body", label: "Full Body" },
    { key: "Core", label: "Core" },
    { key: "Chest", label: "Chest" },
    { key: "Back", label: "Back" },
    { key: "Arms", label: "Arms" },
    { key: "Legs", label: "Legs" },
    { key: "Cardio", label: "Cardio" }
  ];

  /* ---------- Category gradient class ---------- */
  function catClass(cat) {
    if (!cat) return "cat-fullbody";
    var s = cat.toLowerCase();
    if (s.indexOf("core") >= 0) return "cat-core";
    if (s.indexOf("chest") >= 0) return "cat-chest";
    if (s.indexOf("back") >= 0) return "cat-back";
    if (s.indexOf("arm") >= 0) return "cat-arms";
    if (s.indexOf("leg") >= 0) return "cat-legs";
    if (s.indexOf("cardio") >= 0) return "cat-cardio";
    if (s.indexOf("full") >= 0) return "cat-fullbody";
    return "cat-fullbody";
  }

  function diffChipClass(diff) {
    if (!diff) return "";
    var d = diff.toLowerCase();
    if (d.indexOf("beginner") >= 0) return "green";
    if (d.indexOf("intermediate") >= 0) return "amber";
    if (d.indexOf("advanced") >= 0) return "red";
    return "";
  }

  /* ---------- Render category filters ---------- */
  var catFiltersEl = qs("#catFilters");
  function renderCatFilters() {
    if (!catFiltersEl) return;
    var html = "";
    CATEGORIES.forEach(function (c) {
      var isActive = c.key === activeCategory;
      html += '<button class="chip' + (isActive ? " fire active" : "") + '" data-cat="' + afcEscape(c.key) + '" ' +
        'aria-pressed="' + isActive + '">' + afcEscape(c.label) + '</button>';
    });
    catFiltersEl.innerHTML = html;

    catFiltersEl.querySelectorAll("[data-cat]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeCategory = btn.dataset.cat;
        renderCatFilters();
        renderGrid();
      });
    });
  }
  renderCatFilters();

  /* ---------- Search ---------- */
  var searchInput = qs("#exSearch");
  if (searchInput) {
    searchInput.addEventListener("input", afcDebounce(function () {
      searchQuery = searchInput.value.trim().toLowerCase();
      renderGrid();
    }, 250));
  }

  /* ---------- Render grid ---------- */
  var gridEl = qs("#exGrid");

  function renderGrid() {
    if (!gridEl) return;
    var keys = Object.keys(allExercises);

    var filtered = keys.filter(function (k) {
      var ex = allExercises[k];
      if (!ex) return false;
      if (activeCategory !== "all" && ex.category !== activeCategory) return false;
      if (searchQuery && !(ex.name || "").toLowerCase().includes(searchQuery)) return false;
      return true;
    });

    if (!filtered.length) {
      gridEl.innerHTML = '<div class="col-12"><div class="empty-state"><i class="bi bi-search" aria-hidden="true"></i><p>No exercises found.</p></div></div>';
      return;
    }

    var html = "";
    filtered.forEach(function (key) {
      var ex = allExercises[key];
      var mediaInner = ex.image
        ? '<img src="' + afcEscape(ex.image) + '" alt="' + afcEscape(ex.name) + '" loading="lazy">'
        : '<i class="bi bi-activity" aria-hidden="true"></i>';

      var infoText = "";
      if (ex.duration && Number(ex.duration) > 0) {
        infoText = ex.sets + " sets × " + ex.duration + "s";
      } else if (ex.reps) {
        infoText = ex.sets + " sets × " + ex.reps + " reps";
      } else {
        infoText = ex.sets + " sets";
      }

      html += '<div class="col-12 col-md-6 col-xl-4">' +
        '<div class="tile tile-hover h-100 d-flex flex-column">' +
        '<div class="media-card-img ' + catClass(ex.category) + '">' + mediaInner + '</div>' +
        '<div class="tile-pad d-flex flex-column flex-grow-1">' +
        '<h3 class="card-title-2 mb-2">' + afcEscape(ex.name) + '</h3>' +
        '<div class="d-flex flex-wrap gap-1 mb-2">' +
        (ex.difficulty ? '<span class="chip ' + diffChipClass(ex.difficulty) + '">' + afcEscape(ex.difficulty) + '</span>' : '') +
        '<span class="chip blue">' + afcEscape(infoText) + '</span>' +
        (ex.rest ? '<span class="chip amber">Rest ' + ex.rest + 's</span>' : '') +
        '</div>' +
        '<button class="btn btn-fire btn-sm mt-auto w-100" data-start-ex="' + afcEscape(key) + '"><i class="bi bi-play-fill me-1" aria-hidden="true"></i>START WORKOUT</button>' +
        '</div></div></div>';
    });

    gridEl.innerHTML = html;

    gridEl.querySelectorAll("[data-start-ex]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        location.href = "workout.html?ex=" + encodeURIComponent(btn.dataset.startEx);
      });
    });
  }

  /* ---------- Realtime listener ---------- */
  var unsubEx = null;
  try {
    unsubEx = await afcDbOnValue("exercises", function (data) {
      allExercises = data || {};
      renderGrid();
    });
  } catch (e) {
    /* Fallback: load once */
    try {
      var snap = await afcDbGet("exercises");
      allExercises = snap || {};
      renderGrid();
    } catch (e2) {
      if (gridEl) gridEl.innerHTML = '<div class="col-12"><div class="empty-state"><i class="bi bi-exclamation-triangle" aria-hidden="true"></i><p>Could not load exercises.</p></div></div>';
    }
  }

  window.addEventListener("pagehide", function () {
    if (unsubEx) unsubEx();
  });

})();
