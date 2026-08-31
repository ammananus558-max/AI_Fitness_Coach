/* ============================================================
   AI FITNESS COACH — WORKOUT PAGE + PLAYER
   ============================================================ */
(async function () {
  var session;
  try { session = await requireAuth(); } catch (e) { return; }
  afcMountLayout("workout");

  /* ---------- URL params ---------- */
  var params = new URLSearchParams(location.search);
  var autoWorkoutKey = params.get("w");
  var autoExerciseKey = params.get("ex");

  /* ---------- State ---------- */
  var allWorkouts = {};
  var allExercises = {};
  var userGoal = "";
  var showAll = false;

  try {
    var g = await afcUserGet("goal");
    if (g) userGoal = g;
  } catch (e) { /* ignore */ }

  /* Load exercises catalog */
  try {
    var exSnap = await afcDbGet("exercises");
    if (exSnap) allExercises = exSnap;
  } catch (e) { /* non-fatal */ }

  /* ---------- Filter UI ---------- */
  var filterBtns = qsa("#workoutFilters .chip");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) { b.classList.remove("fire", "active"); b.setAttribute("aria-pressed", "false"); });
      btn.classList.add("fire", "active");
      btn.setAttribute("aria-pressed", "true");
      showAll = btn.dataset.filter === "all";
      renderGrid();
    });
  });

  /* ---------- Category gradient class ---------- */
  function catClass(str) {
    if (!str) return "cat-fullbody";
    var s = str.toLowerCase();
    if (s.indexOf("core") >= 0) return "cat-core";
    if (s.indexOf("chest") >= 0) return "cat-chest";
    if (s.indexOf("back") >= 0) return "cat-back";
    if (s.indexOf("arm") >= 0) return "cat-arms";
    if (s.indexOf("leg") >= 0) return "cat-legs";
    if (s.indexOf("cardio") >= 0) return "cat-cardio";
    if (s.indexOf("full") >= 0) return "cat-fullbody";
    return "cat-fullbody";
  }

  /* ---------- Render grid ---------- */
  var gridEl = qs("#workoutGrid");

  function renderGrid() {
    if (!gridEl) return;
    var keys = Object.keys(allWorkouts);
    if (!keys.length) {
      gridEl.innerHTML = '<div class="col-12"><div class="empty-state"><i class="bi bi-lightning" aria-hidden="true"></i><p>No workouts available yet.</p></div></div>';
      return;
    }

    var filtered = keys.filter(function (k) {
      var w = allWorkouts[k];
      if (!w || !w.active) return false;
      if (showAll) return true;
      return !userGoal || w.goal === userGoal;
    });

    if (!filtered.length) {
      gridEl.innerHTML = '<div class="col-12"><div class="empty-state"><i class="bi bi-search" aria-hidden="true"></i><p>No workouts match your goal. Try "All Workouts".</p></div></div>';
      return;
    }

    var html = "";
    filtered.forEach(function (key) {
      var w = allWorkouts[key];
      var exCount = (w.exercises || []).length;
      var mediaInner = w.media ? '<img src="' + afcEscape(w.media) + '" alt="' + afcEscape(w.name) + '" loading="lazy">' : '<i class="bi bi-lightning-fill" aria-hidden="true"></i>';

      html += '<div class="col-12 col-md-6 col-xl-4">' +
        '<div class="tile tile-hover h-100 d-flex flex-column">' +
        '<div class="media-card-img ' + catClass(w.day || w.goal) + '">' + mediaInner + '</div>' +
        '<div class="tile-pad d-flex flex-column flex-grow-1">' +
        '<h3 class="card-title-2 mb-2">' + afcEscape(w.name) + '</h3>' +
        '<div class="d-flex flex-wrap gap-1 mb-2">' +
        (w.level ? '<span class="chip green">' + afcEscape(w.level) + '</span>' : '') +
        '<span class="chip blue">' + (w.duration || 0) + ' min</span>' +
        '<span class="chip amber">' + exCount + ' exercises</span>' +
        (w.goal ? '<span class="chip fire">' + afcEscape(w.goal) + '</span>' : '') +
        '</div>' +
        '<p class="text-muted-2 small mb-3 flex-grow-1">' + afcEscape(w.description || "") + '</p>' +
        '<button class="btn btn-fire w-100 mt-auto" data-start-workout="' + afcEscape(key) + '"><i class="bi bi-play-fill me-1" aria-hidden="true"></i>START WORKOUT</button>' +
        '</div></div></div>';
    });

    gridEl.innerHTML = html;

    gridEl.querySelectorAll("[data-start-workout]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        openPlayer(btn.dataset.startWorkout);
      });
    });
  }

  /* ---------- Realtime listener for workouts ---------- */
  var unsubWorkouts = null;
  try {
    unsubWorkouts = await afcDbOnValue("workouts", function (data) {
      allWorkouts = data || {};
      renderGrid();
    });
  } catch (e) {
    renderGrid();
  }

  window.addEventListener("pagehide", function () {
    if (unsubWorkouts) unsubWorkouts();
  });

  /* ---------- Auto-open from URL ---------- */
  if (autoExerciseKey) {
    openSingleExercise(autoExerciseKey);
  } else if (autoWorkoutKey) {
    /* Wait for workouts to load then open */
    var waitInterval = setInterval(function () {
      if (allWorkouts[autoWorkoutKey]) {
        clearInterval(waitInterval);
        openPlayer(autoWorkoutKey);
      }
    }, 200);
    setTimeout(function () { clearInterval(waitInterval); }, 8000);
  }

  /* ========== WORKOUT PLAYER ========== */

  function openPlayer(workoutKey) {
    var workout = allWorkouts[workoutKey];
    if (!workout) { afcToast("Workout not found", "error"); return; }

    var exerciseKeys = workout.exercises || [];
    if (!exerciseKeys.length) { afcToast("No exercises in this workout", "warn"); return; }

    var exercises = exerciseKeys.map(function (k) { return allExercises[k] || { name: k, sets: 0, reps: 0, duration: 0, rest: 0, instructions: "" }; });

    var currentIdx = 0;
    var timerSeconds = 0;
    var timerInterval = null;
    var paused = false;
    var resting = false;
    var totalDurationSec = 0;

    /* Create overlay */
    var overlay = document.createElement("div");
    overlay.className = "player-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", "Workout player");
    document.body.appendChild(overlay);

    function renderExercise() {
      var ex = exercises[currentIdx];
      var isLast = currentIdx === exercises.length - 1;
      var isTimerBased = ex.duration && Number(ex.duration) > 0;
      var defaultTimer = isTimerBased ? Number(ex.duration) : 30;

      timerSeconds = defaultTimer;
      paused = false;
      resting = false;

      /* Media */
      var mediaHtml = "";
      if (ex.videoURL) {
        var vidUrl = ex.videoURL;
        if (vidUrl.indexOf("youtube.com") >= 0 || vidUrl.indexOf("youtu.be") >= 0) {
          var ytId = extractYoutubeId(vidUrl);
          mediaHtml = '<iframe src="https://www.youtube-nocookie.com/embed/' + afcEscape(ytId) + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width:100%;height:100%" title="' + afcEscape(ex.name) + '"></iframe>';
        } else if (vidUrl.match(/\.(mp4|webm|gif)(\?|$)/i)) {
          mediaHtml = '<video src="' + afcEscape(vidUrl) + '" autoplay loop muted playsinline style="width:100%;height:100%;object-fit:cover"></video>';
        } else {
          mediaHtml = '<i class="bi bi-play-circle-fill" aria-hidden="true"></i>';
        }
      } else if (ex.image) {
        mediaHtml = '<img src="' + afcEscape(ex.image) + '" alt="' + afcEscape(ex.name) + '" style="width:100%;height:100%;object-fit:cover">';
      } else {
        mediaHtml = '<i class="bi bi-heart-pulse-fill" aria-hidden="true"></i>';
      }

      /* Rep info */
      var repInfo = "";
      if (isTimerBased) {
        repInfo = ex.sets + " sets × " + ex.duration + "s each";
      } else if (ex.reps) {
        repInfo = ex.sets + " sets × " + ex.reps + " reps";
      } else {
        repInfo = ex.sets + " sets";
      }

      var progressPct = Math.round(((currentIdx) / exercises.length) * 100);

      overlay.innerHTML =
        '<div class="tile tile-pad player-card anim-scale">' +
        '<div class="d-flex justify-content-between align-items-center mb-2">' +
        '<small class="fw-bold text-muted-2">EXERCISE ' + (currentIdx + 1) + ' / ' + exercises.length + '</small>' +
        '<button class="btn-close" id="playerClose" aria-label="Close player"></button></div>' +
        '<div class="progress-2 thin mb-3"><div class="bar" style="width:' + progressPct + '%"></div></div>' +
        '<div class="player-media mb-3">' + mediaHtml + '</div>' +
        '<h2 class="fs-4 fw-bold mb-1">' + afcEscape(ex.name) + '</h2>' +
        '<p class="text-muted-2 small mb-2">' + afcEscape(repInfo) + (ex.rest ? ' · Rest ' + ex.rest + 's' : '') + '</p>' +
        '<p class="mb-3">' + afcEscape(ex.instructions || "") + '</p>' +
        '<div class="player-timer text-center mb-3" id="playerTimerDisplay">' + formatTime(timerSeconds) + '</div>' +
        '<div class="d-flex gap-2 justify-content-center">' +
        '<button class="btn btn-ghost" id="playerPrev"' + (currentIdx === 0 ? " disabled" : "") + '><i class="bi bi-skip-backward-fill" aria-hidden="true"></i> PREV</button>' +
        '<button class="btn btn-soft" id="playerPause"><i class="bi bi-pause-fill" id="pauseIcon" aria-hidden="true"></i> <span id="pauseLabel">PAUSE</span></button>' +
        (isLast
          ? '<button class="btn btn-fire" id="playerDone"><i class="bi bi-check-lg" aria-hidden="true"></i> DONE</button>'
          : '<button class="btn btn-ghost" id="playerNext">NEXT <i class="bi bi-skip-forward-fill" aria-hidden="true"></i></button>') +
        '</div></div>';

      bindPlayerEvents();
      startTimer();
    }

    function startTimer() {
      stopTimer();
      updateTimerDisplay();
      timerInterval = setInterval(function () {
        if (paused) return;
        timerSeconds--;
        updateTimerDisplay();
        if (timerSeconds <= 0) {
          stopTimer();
          /* Auto-advance or show rest */
          handleTimerEnd();
        }
      }, 1000);
    }

    function stopTimer() {
      if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    }

    function updateTimerDisplay() {
      var el = qs("#playerTimerDisplay", overlay);
      if (el) el.textContent = formatTime(timerSeconds);
    }

    function handleTimerEnd() {
      var ex = exercises[currentIdx];
      if (resting) {
        /* Rest ended, move to next */
        resting = false;
        if (currentIdx < exercises.length - 1) {
          currentIdx++;
          renderExercise();
        }
        return;
      }

      /* Exercise timer done; start rest if applicable and not last */
      if (ex.rest && Number(ex.rest) > 0 && currentIdx < exercises.length - 1) {
        showRestCountdown(Number(ex.rest));
      } else if (currentIdx < exercises.length - 1) {
        currentIdx++;
        renderExercise();
      }
      /* If last exercise, user must press DONE */
    }

    function showRestCountdown(seconds) {
      resting = true;
      timerSeconds = seconds;
      var el = qs("#playerTimerDisplay", overlay);
      if (el) el.textContent = "REST " + formatTime(seconds);

      stopTimer();
      timerInterval = setInterval(function () {
        timerSeconds--;
        if (el) el.textContent = "REST " + formatTime(timerSeconds);
        if (timerSeconds <= 0) {
          stopTimer();
          resting = false;
          currentIdx++;
          renderExercise();
        }
      }, 1000);

      /* Add skip button during rest */
      var card = qs(".player-card", overlay);
      if (card) {
        var existingSkip = qs("#restSkip", overlay);
        if (existingSkip) existingSkip.remove();
        var skipBtn = document.createElement("button");
        skipBtn.id = "restSkip";
        skipBtn.className = "btn btn-soft btn-sm mt-2";
        skipBtn.textContent = "SKIP REST";
        skipBtn.addEventListener("click", function () {
          stopTimer();
          resting = false;
          currentIdx++;
          renderExercise();
        });
        card.appendChild(skipBtn);
      }
    }

    function bindPlayerEvents() {
      var closeBtn = qs("#playerClose", overlay);
      var prevBtn = qs("#playerPrev", overlay);
      var pauseBtn = qs("#playerPause", overlay);
      var nextBtn = qs("#playerNext", overlay);
      var doneBtn = qs("#playerDone", overlay);

      if (closeBtn) closeBtn.addEventListener("click", function () { confirmClose(); });
      if (prevBtn) prevBtn.addEventListener("click", function () { goPrev(); });
      if (nextBtn) nextBtn.addEventListener("click", function () { goNext(); });
      if (pauseBtn) pauseBtn.addEventListener("click", function () { togglePause(); });
      if (doneBtn) doneBtn.addEventListener("click", function () { finishWorkout(); });
    }

    function togglePause() {
      paused = !paused;
      var icon = qs("#pauseIcon", overlay);
      var label = qs("#pauseLabel", overlay);
      if (icon) icon.className = "bi " + (paused ? "bi-play-fill" : "bi-pause-fill");
      if (label) label.textContent = paused ? "RESUME" : "PAUSE";
    }

    function goPrev() {
      if (currentIdx > 0) { currentIdx--; renderExercise(); }
    }

    function goNext() {
      if (currentIdx < exercises.length - 1) { currentIdx++; renderExercise(); }
    }

    async function confirmClose() {
      var ok = await afcConfirm({ title: "Quit Workout?", body: "Your progress will be lost.", okText: "Quit", danger: true });
      if (ok) closePlayer();
    }

    function closePlayer() {
      stopTimer();
      if (overlay.parentNode) overlay.remove();
      cleanupKeyboard();
    }

    async function finishWorkout() {
      stopTimer();

      /* Calculate total minutes */
      var totalSec = 0;
      exercises.forEach(function (ex) {
        if (ex.duration && Number(ex.duration) > 0) totalSec += Number(ex.duration) * (Number(ex.sets) || 1);
        else totalSec += 30 * (Number(ex.sets) || 1);
      });
      var minutes = Math.max(5, Math.round(totalSec / 60));

      try {
        await afcDailySet("workoutCompleted", true);
        await afcDailySet("workoutMinutes", minutes);
        await afcDailySet("exercisesDone", exercises.length);
        await afcDailySet("lastWorkoutAt", Date.now());
        await afcUserSet("progress/lastWorkout", {
          workoutKey: workoutKey,
          name: workout.name,
          at: Date.now()
        });
        await afcTouchStreak();
      } catch (e) {
        afcToast("Could not save workout data", "error");
      }

      /* Show success burst */
      var streakData = { current: 1 };
      try { streakData = await afcGetStreak(); } catch (e) { /* ignore */ }

      showSuccessBurst(streakData.current || 1);
      afcConfetti(80);

      /* Remove player overlay */
      if (overlay.parentNode) overlay.remove();
      cleanupKeyboard();
    }

    function showSuccessBurst(streakCount) {
      var burst = document.createElement("div");
      burst.className = "success-burst";
      burst.innerHTML =
        '<div class="tile tile-pad burst-card">' +
        '<div class="burst-icon"><i class="bi bi-trophy-fill" aria-hidden="true"></i></div>' +
        '<h2 class="fw-bold mb-2">WORKOUT COMPLETE \uD83D\uDD25</h2>' +
        '<p class="text-muted-2 mb-3">Streak: ' + streakCount + ' day' + (streakCount !== 1 ? 's' : '') + '</p>' +
        '<button class="btn btn-fire" id="burstClose">CONTINUE</button></div>';
      document.body.appendChild(burst);

      qs("#burstClose", burst).addEventListener("click", function () {
        burst.remove();
      });
    }

    /* Keyboard controls */
    function onKeydown(e) {
      if (!document.body.contains(overlay)) return;
      if (e.key === "Escape") { confirmClose(); }
      else if (e.key === "ArrowLeft") { goPrev(); }
      else if (e.key === "ArrowRight") { goNext(); }
      else if (e.key === " ") { e.preventDefault(); togglePause(); }
    }
    document.addEventListener("keydown", onKeydown);

    function cleanupKeyboard() {
      document.removeEventListener("keydown", onKeydown);
    }

    /* Start first exercise */
    renderExercise();
  }

  /* Single-exercise session from ?ex= param */
  function openSingleExercise(exKey) {
    var ex = allExercises[exKey];
    if (!ex) { afcToast("Exercise not found", "error"); return; }

    /* Wrap in a pseudo-workout with one exercise */
    openPlayer("__single__");

    /* Override: we need to inject the single exercise into the flow.
       Since openPlayer expects a workout key, let's create a temp approach. */
    /* Actually, let's just call openPlayer logic directly with a fake workout */
    /* Close any existing overlay first */
    var existing = qs(".player-overlay");
    if (existing) existing.remove();

    /* Re-use openPlayer by creating a synthetic workout */
    allWorkouts["__single_ex__"] = {
      name: ex.name,
      exercises: [exKey],
      duration: Math.ceil((ex.duration || 30) / 60),
      goal: "",
      level: ex.difficulty,
      description: "",
      active: true
    };
    openPlayer("__single_ex__");
  }

  /* ---------- Helpers ---------- */
  function formatTime(sec) {
    sec = Math.max(0, Math.floor(sec));
    var m = String(Math.floor(sec / 60)).padStart(2, "0");
    var s = String(sec % 60).padStart(2, "0");
    return m + ":" + s;
  }

  function extractYoutubeId(url) {
    var match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : "";
  }

})();
