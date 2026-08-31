/* Before & After page logic */
(async function () {
  var session;
  try { session = await requireAuth(); } catch (e) { return; }
  afcMountLayout("before");

  var viewTabs = qs("#viewTabs");
  var slotBefore = qs("#slotBefore");
  var slotAfter = qs("#slotAfter");
  var beforeDateIn = qs("#beforeDate");
  var afterDateIn = qs("#afterDate");
  var notesIn = qs("#notesInput");
  var saveBtn = qs("#saveDetailsBtn");
  var baStage = qs("#baStage");
  var sliderEmpty = qs("#sliderEmpty");
  var baBeforeImg = qs("#baBeforeImg");
  var baAfterImg = qs("#baAfterImg");
  var baHandle = qs("#baHandle");

  var activeView = "front";
  var baData = {};

  afcLoader("Loading photos...");

  /* Load existing before/after data */
  try {
    baData = await afcUserGet("beforeAfter") || {};
  } catch (e) { /* ignore */ }

  afcLoaderOff();
  renderView();
  loadDetails();

  /* View tab switching */
  viewTabs.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-view]");
    if (!btn) return;
    activeView = btn.dataset.view;
    qsa("[data-view]", viewTabs).forEach(function (b) {
      b.classList.remove("fire", "active-view");
      b.setAttribute("aria-selected", "false");
    });
    btn.classList.add("fire", "active-view");
    btn.setAttribute("aria-selected", "true");
    renderView();
  });

  /* Upload handlers */
  slotBefore.addEventListener("click", function () { uploadPhoto("before"); });
  slotBefore.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); uploadPhoto("before"); } });
  slotAfter.addEventListener("click", function () { uploadPhoto("after"); });
  slotAfter.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); uploadPhoto("after"); } });

  /* Save details */
  saveBtn.addEventListener("click", async function () {
    afcBusy(saveBtn, true, "Saving...");
    try {
      var viewNode = baData[activeView] || {};
      if (beforeDateIn.value && viewNode.before) {
        viewNode.before.date = beforeDateIn.value;
      }
      if (afterDateIn.value && viewNode.after) {
        viewNode.after.date = afterDateIn.value;
      }
      await afcUserSet("beforeAfter/" + activeView, viewNode);
      await afcUserSet("beforeAfter/notes", notesIn.value);
      baData = await afcUserGet("beforeAfter") || {};
      afcToast("Details saved!", "success");
    } catch (err) {
      afcToast("Could not save.", "error");
    } finally {
      afcBusy(saveBtn, false);
    }
  });

  async function uploadPhoto(type) {
    try {
      var file = await afcPickImage();
      if (!file) return;
      var err = afcValidateImage(file);
      if (err) { afcToast(err, "error"); return; }

      var ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      var path = "users/" + session.uid + "/before-after/" + activeView + "-" + type + "." + ext;

      afcLoader("Uploading... 0%");
      var url = await afcUpload(path, file, function (pct) {
        var el = qs("#afc-loader-text");
        if (el) el.textContent = "Uploading... " + pct + "%";
      });
      afcLoaderOff();

      var viewNode = baData[activeView] || {};
      viewNode[type] = { url: url, date: afcTodayKey() };
      await afcUserSet("beforeAfter/" + activeView, viewNode);
      baData = await afcUserGet("beforeAfter") || {};

      afcToast("Uploaded!", "success");
      renderView();
    } catch (err) {
      afcLoaderOff();
      afcToast("Upload failed. Try again.", "error");
    }
  }

  function renderView() {
    var viewNode = baData[activeView] || {};
    var beforeInfo = viewNode.before || null;
    var afterInfo = viewNode.after || null;

    renderSlot(slotBefore, beforeInfo, "before");
    renderSlot(slotAfter, afterInfo, "after");
    updateSlider(beforeInfo, afterInfo);
  }

  function renderSlot(slot, info, type) {
    if (info && info.url) {
      slot.innerHTML = '<img src="' + afcEscape(info.url) + '" alt="' + type + ' photo">' +
        '<div class="upload-actions">' +
        '<button class="btn btn-sm btn-fire replace-btn" data-type="' + type + '">REPLACE</button>' +
        '<button class="btn btn-sm btn-danger remove-btn" data-type="' + type + '">REMOVE</button>' +
        '</div>';

      var replaceBtn = slot.querySelector(".replace-btn");
      var removeBtn = slot.querySelector(".remove-btn");

      replaceBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        uploadPhoto(type);
      });

      removeBtn.addEventListener("click", async function (e) {
        e.stopPropagation();
        var ok = await afcConfirm({ title: "Remove photo?", body: "This will delete the " + type + " photo for this view.", danger: true });
        if (!ok) return;
        try {
          var viewNode = baData[activeView] || {};
          delete viewNode[type];
          await afcUserSet("beforeAfter/" + activeView, viewNode);
          baData = await afcUserGet("beforeAfter") || {};
          afcToast("Photo removed.", "info");
          renderView();
        } catch (err) {
          afcToast("Could not remove.", "error");
        }
      });
    } else {
      slot.innerHTML = '<i class="bi bi-camera-fill" style="font-size:2rem" aria-hidden="true"></i>' +
        '<span>Tap to upload ' + type.toUpperCase() + ' photo</span>';
    }
  }

  function updateSlider(beforeInfo, afterInfo) {
    if (beforeInfo && beforeInfo.url && afterInfo && afterInfo.url) {
      sliderEmpty.style.display = "none";
      baStage.style.display = "";
      baBeforeImg.src = beforeInfo.url;
      baAfterImg.src = afterInfo.url;
      baStage.style.setProperty("--split", "50%");
    } else {
      sliderEmpty.style.display = "";
      baStage.style.display = "none";
    }
  }

  function loadDetails() {
    var viewNode = baData[activeView] || {};
    if (viewNode.before && viewNode.before.date) beforeDateIn.value = viewNode.before.date;
    else beforeDateIn.value = "";
    if (viewNode.after && viewNode.after.date) afterDateIn.value = viewNode.after.date;
    else afterDateIn.value = "";
    notesIn.value = baData.notes || "";
  }

  /* Comparison slider drag logic */
  var dragging = false;

  function getSplitFromEvent(e) {
    var rect = baStage.getBoundingClientRect();
    var clientX = e.touches ? e.touches[0].clientX : e.clientX;
    var pct = ((clientX - rect.left) / rect.width) * 100;
    return afcClamp(pct, 0, 100);
  }

  baHandle.addEventListener("pointerdown", function (e) {
    e.preventDefault();
    dragging = true;
    baHandle.setPointerCapture(e.pointerId);
  });

  baStage.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    e.preventDefault();
    baStage.style.setProperty("--split", getSplitFromEvent(e) + "%");
  });

  baStage.addEventListener("pointerup", function () { dragging = false; });
  baStage.addEventListener("pointercancel", function () { dragging = false; });

  /* Touch fallback */
  baHandle.addEventListener("touchstart", function (e) {
    dragging = true;
  }, { passive: true });

  baStage.addEventListener("touchmove", function (e) {
    if (!dragging) return;
    baStage.style.setProperty("--split", getSplitFromEvent(e) + "%");
  }, { passive: true });

  baStage.addEventListener("touchend", function () { dragging = false; });
})();
