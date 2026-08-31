/* ============================================================
   AI FITNESS COACH — SUBSCRIPTION PAGE
   Trial banner, plans grid from pricing/, simulated checkout.
   ============================================================ */
(async function () {
  let session;
  try { session = await requireAuth(); } catch (e) { return; }
  afcMountLayout("subscription");

  var FALLBACK_PRICING = [
    { key: "plan-1m", name: "1 Month", price: 9.99, durationDays: 30, featured: false, active: true, features: ["Full workout library", "Personalized diet plans", "Progress tracking", "AI assistant"] },
    { key: "plan-3m", name: "3 Months", price: 24.99, durationDays: 90, featured: false, active: true, features: ["Everything in 1 Month", "Weekly plan updates", "Priority support"] },
    { key: "plan-6m", name: "6 Months", price: 39.99, durationDays: 180, featured: true, active: true, features: ["Everything in 3 Months", "Save 33% vs monthly", "New plans monthly"] },
    { key: "plan-12m", name: "1 Year", price: 59.99, durationDays: 365, featured: false, active: true, features: ["Everything in 6 Months", "Save 50% vs monthly", "Exclusive programs"] }
  ];

  var selectedPlan = null;
  var checkoutModalEl = qs("#checkoutModal");
  var checkoutBody = qs("#checkoutBody");
  var confirmBtn = qs("#confirmPurchaseBtn");
  var modalInstance = null;

  /* ---- Banner rendering ---- */
  async function renderBanner() {
    var banner = qs("#trialBanner");
    var manageSection = qs("#manageSection");
    var manageInfo = qs("#manageInfo");

    var hasPrem = await afcHasPremium();
    if (hasPrem) {
      var sub = await afcUserGet("subscription");
      banner.innerHTML =
        '<div class="tile tile-pad anim-scale" style="border-left:4px solid var(--success)">' +
        '<div class="d-flex align-items-center gap-3">' +
        '<i class="bi bi-patch-check-fill text-success" style="font-size:2rem" aria-hidden="true"></i>' +
        '<div><h5 class="mb-1 text-success">Premium Active</h5>' +
        '<p class="mb-0 text-muted-2">' + afcEscape(sub.planName || "Premium") + ' &middot; Ends ' + afcFmtDate(sub.endDate) + '</p></div>' +
        '</div></div>';
      manageSection.classList.remove("d-none");
      manageInfo.textContent = "Your " + (sub.planName || "premium") + " plan is active until " + afcFmtDate(sub.endDate) + ".";
      return;
    }

    var info = await afcTrialInfo();
    if (!info) {
      banner.innerHTML = "";
      return;
    }

    if (info.active) {
      banner.innerHTML =
        '<div class="tile tile-pad anim-scale" style="border-left:4px solid var(--primary)">' +
        '<div class="d-flex justify-content-between align-items-center mb-2">' +
        '<h5 class="mb-0 gradient-text">FREE TRIAL — DAY ' + info.dayNum + ' / ' + info.totalDays + '</h5>' +
        '<span class="badge rounded-pill bg-primary">' + Math.round(info.pct) + '%</span></div>' +
        '<div class="progress-2"><div class="bar" style="width:' + info.pct + '%"></div></div>' +
        '<p class="text-muted-2 mt-2 mb-0" style="font-size:.85rem">Enjoy full access during your trial. Ends ' + afcFmtDate(info.trial.endDate) + '.</p>' +
        '</div>';
      manageSection.classList.add("d-none");
    } else {
      banner.innerHTML =
        '<div class="tile tile-pad anim-scale" style="border-left:4px solid var(--warning)">' +
        '<div class="d-flex align-items-center gap-3">' +
        '<i class="bi bi-clock-history text-warning" style="font-size:2rem" aria-hidden="true"></i>' +
        '<div><h5 class="mb-1">Your Free Week Is Complete</h5>' +
        '<p class="mb-0 text-muted-2">Choose a plan below to continue your fitness journey.</p></div>' +
        '</div></div>';
      manageSection.classList.add("d-none");
    }
  }

  /* ---- Plans grid ---- */
  function renderPlans(plans) {
    var grid = qs("#plansGrid");
    if (!plans || !plans.length) {
      grid.innerHTML = '<div class="col-12 empty-state"><i class="bi bi-gem" aria-hidden="true"></i><p>No plans available right now.</p></div>';
      return;
    }
    plans.sort(function (a, b) { return (a.durationDays || 0) - (b.durationDays || 0); });
    grid.innerHTML = plans.map(function (p) {
      var featClass = p.featured ? " featured" : "";
      var feats = (p.features || []).map(function (f) {
        return '<li class="mb-1"><i class="bi bi-check-circle-fill text-success me-2" aria-hidden="true"></i>' + afcEscape(f) + "</li>";
      }).join("");
      return '<div class="col-sm-6 col-lg-3 reveal">' +
        '<div class="tile tile-pad plan-card h-100' + featClass + '">' +
        (p.featured ? '<span class="position-absolute top-0 end-0 m-2 badge rounded-pill bg-primary">POPULAR</span>' : "") +
        '<h5 class="fw-bold mb-1">' + afcEscape(p.name) + '</h5>' +
        '<div class="plan-price gradient-text">$' + Number(p.price).toFixed(2) + '</div>' +
        '<div class="text-muted-2 mb-3" style="font-size:.82rem">per ' + (p.durationDays || 30) + ' days</div>' +
        '<ul class="list-unstyled small mb-3" style="line-height:1.7">' + feats + '</ul>' +
        '<button class="btn btn-fire w-100 mt-auto buy-plan-btn" data-key="' + afcEscape(p.key) + '">BUY PLAN</button>' +
        '</div></div>';
    }).join("");
  }

  /* ---- Load pricing (live listener) ---- */
  function loadPricing() {
    afcDbOnValue("pricing", function (data) {
      var plans = [];
      if (data) {
        Object.keys(data).forEach(function (k) {
          var p = data[k];
          if (p && p.active !== false) {
            p.key = k;
            plans.push(p);
          }
        });
      }
      if (plans.length === 0) plans = FALLBACK_PRICING.slice();
      renderPlans(plans);
    }).catch(function () {
      renderPlans(FALLBACK_PRICING.slice());
    });
  }

  /* ---- Checkout flow ---- */
  function openCheckout(planKey) {
    var cards = qsa(".buy-plan-btn");
    var planData = null;
    /* Find plan data from the current rendered grid by re-reading pricing cache or fallback */
    /* We'll look up from the DOM data-key and find in our last-known plans */
    afcDbGet("pricing/" + planKey).then(function (p) {
      if (!p) {
        var fb = FALLBACK_PRICING.find(function (f) { return f.key === planKey; });
        p = fb || null;
      }
      if (!p) { afcToast("Plan not found.", "error"); return; }
      selectedPlan = p;
      var today = afcTodayKey();
      var end = afcAddDays(today, p.durationDays || 30);
      checkoutBody.innerHTML =
        '<div class="mb-3"><strong>Plan:</strong> ' + afcEscape(p.name) + '</div>' +
        '<div class="mb-3"><strong>Price:</strong> $' + Number(p.price).toFixed(2) + '</div>' +
        '<div class="mb-3"><strong>Duration:</strong> ' + (p.durationDays || 30) + ' days</div>' +
        '<div class="mb-3"><strong>Start:</strong> ' + afcFmtDate(today) + '</div>' +
        '<div class="mb-3"><strong>End:</strong> ' + afcFmtDate(end) + '</div>' +
        '<hr><p class="text-muted-2 small mb-0"><i class="bi bi-info-circle me-1" aria-hidden="true"></i>This is a simulated checkout for a student project — no real payment is processed.</p>';
      if (!modalInstance) modalInstance = new bootstrap.Modal(checkoutModalEl);
      modalInstance.show();
    }).catch(function () {
      afcToast("Could not load plan details.", "error");
    });
  }

  confirmBtn.addEventListener("click", async function () {
    if (!selectedPlan) return;
    afcBusy(confirmBtn, true, "Processing...");
    try {
      var today = afcTodayKey();
      var end = afcAddDays(today, selectedPlan.durationDays || 30);
      await afcUserSet("subscription", {
        planId: selectedPlan.key,
        planName: selectedPlan.name,
        price: selectedPlan.price,
        status: "active",
        startDate: today,
        endDate: end
      });
      if (modalInstance) modalInstance.hide();
      afcConfetti();
      afcToast("Premium plan activated!", "success");
      await renderBanner();
    } catch (e) {
      afcToast("Could not activate plan. Please try again.", "error");
    } finally {
      afcBusy(confirmBtn, false);
    }
  });

  /* ---- Buy button delegation ---- */
  qs("#plansGrid").addEventListener("click", function (e) {
    var btn = e.target.closest(".buy-plan-btn");
    if (btn) openCheckout(btn.dataset.key);
  });

  /* ---- Cancel subscription ---- */
  qs("#cancelSubBtn").addEventListener("click", async function () {
    var ok = await afcConfirm({
      title: "Cancel Subscription?",
      body: "Your premium access will be revoked immediately. This cannot be undone easily.",
      okText: "Cancel Subscription",
      danger: true
    });
    if (!ok) return;
    afcLoader("Cancelling...");
    try {
      await afcUserUpdate("subscription", { status: "cancelled" });
      afcToast("Subscription cancelled.", "info");
      await renderBanner();
    } catch (e) {
      afcToast("Could not cancel. Please try again.", "error");
    } finally {
      afcLoaderOff();
    }
  });

  /* ---- Init ---- */
  await renderBanner();
  loadPricing();
})();
