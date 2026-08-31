/* ============================================================
   AI FITNESS COACH — STREAK
   Real calendar-date streak logic. Never hard-coded.

   Stored at users/{uid}/progress/streak:
     { current, best, lastDate }

   A "target day" is a day where users/{uid}/daily/{date}/
   workoutCompleted === true. afcTouchStreak() is called after
   a workout completion.
   ============================================================ */

window.afcGetStreak = async function () {
  const s = await afcUserGet("progress/streak");
  return s || { current: 0, best: 0, lastDate: null };
};

/* Recompute streak from full daily history (robust source of truth). */
window.afcRecalcStreak = async function () {
  const daily = (await afcUserGet("daily")) || {};
  const doneDays = Object.keys(daily).filter(function (k) {
    return daily[k] && daily[k].workoutCompleted === true;
  }).sort();

  if (!doneDays.length) return { current: 0, best: 0, lastDate: null };

  let current = 1;
  for (let i = doneDays.length - 1; i > 0; i--) {
    if (afcDaysBetween(doneDays[i - 1], doneDays[i]) === 1) current++;
    else break;
  }
  /* If the latest completed day is not today or yesterday, streak is broken. */
  const gap = afcDaysBetween(doneDays[doneDays.length - 1], afcTodayKey());
  if (gap > 1) current = 0;

  let best = 0, run = 1;
  for (let i = 1; i < doneDays.length; i++) {
    if (afcDaysBetween(doneDays[i - 1], doneDays[i]) === 1) run++;
    else run = 1;
    best = Math.max(best, run);
  }
  best = Math.max(best, doneDays.length ? run : 0);

  const out = { current: current, best: Math.max(best, current), lastDate: doneDays[doneDays.length - 1] };
  try { await afcUserSet("progress/streak", out); } catch (e) { /* non-fatal */ }
  return out;
};

/* Call after completing today's workout:
   yesterday completed → +1, otherwise 1. */
window.afcTouchStreak = async function () {
  const today = afcTodayKey();
  const streak = await afcGetStreak();
  if (streak.lastDate === today) return streak; // already counted today

  const yesterday = afcAddDays(today, -1);
  const current = streak.lastDate === yesterday ? (streak.current || 0) + 1 : 1;
  const out = {
    current: current,
    best: Math.max(streak.best || 0, current),
    lastDate: today
  };
  await afcUserSet("progress/streak", out);
  /* Keep a history entry so admin/debug can inspect growth. */
  try { await afcUserSet("progress/streakHistory/" + today, current); } catch (e) { /* non-fatal */ }
  return out;
};
