# AI FITNESS COACH

A complete, premium fitness web application: personalized workouts, diet plans, a 4-week weekly planner, water & habit tracking, streaks, progress charts, before/after photo comparison, an AI fitness assistant, a 7-day free trial with premium plans — plus a full admin panel.

**Brand:** AI FITNESS COACH — *Train. Eat. Evolve.*

> General wellness application. BMI/calorie results are estimates, not medical advice.

---

## 1. Technology Stack (strict)

| Layer     | Technology                                  |
|-----------|---------------------------------------------|
| Markup    | HTML5                                        |
| Styling   | CSS3 (custom design system, CSS variables)   |
| Logic     | Vanilla JavaScript (modular SDK via CDN ESM) |
| UI kit    | Bootstrap 5.3.3 (CDN) + Bootstrap Icons      |
| Backend   | Firebase: Auth + Realtime Database + Storage |

No React/Vue/Angular/jQuery/Tailwind/backend servers — pure frontend + Firebase.

---

## 2. Firebase Setup (step by step)

### 2.1 Create the project
1. Go to https://console.firebase.google.com → **Add project**.
2. Name it (e.g. `ai-fitness-coach`). Analytics optional → **Create project**.

### 2.2 Register the web app
1. Project overview → click the **Web** icon `</>`.
2. Register app → copy the `firebaseConfig` values.
3. Open `js/firebase-config.js` and **paste your values** into the placeholder object:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
};
```

### 2.3 Enable Authentication
1. **Build → Authentication → Get started**.
2. *Sign-in method* tab → enable **Email/Password** and **Google**.
3. For Google: add your support email under *Settings*.

### 2.4 Create the Realtime Database
1. **Build → Realtime Database → Create database**.
2. Choose your region → start in **locked mode** (we deploy rules in step 2.6).

### 2.5 Create Storage
1. **Build → Storage → Get started** → locked mode → **Create**.

### 2.6 Deploy security rules
The repo ships two rule files:

- `firebase-database-rules.json` → Realtime Database → **Rules** tab → paste → **Publish**.
- `firebase-storage-rules.txt` → Storage → **Rules** tab → paste → **Publish**.

The rules let each signed-in user read/write only their own `users/{uid}` tree, allow everyone to read public content (`exercises`, `workouts`, `meals`, `dietPlans`, `weeklyPlans`, `goals`, `pricing`, `chatbot`, `settings`, `adminGallery`), and restrict writes to those collections to admins (`admins/{uid}` must exist). For production, use **Firebase Custom Claims** for admin rights instead of a client-readable node.

### 2.7 Authorized domains
Authentication → Settings → **Authorized domains** → add your hosting domain
(`localhost` is already authorized for local development).

---

## 3. Running the project locally

This is a static site, but it must be served over HTTP (Firebase ESM imports and Google popups do not work from `file://`).

**Option A — Node:**
```bash
npx serve .
# or
npx http-server -p 8080
```

**Option B — Python:**
```bash
python -m http.server 8080
```

Then open `http://localhost:8080` (the splash screen starts everything).

---

## 4. Creating the admin account

1. Open `signup.html` (or the SIGN UP button) and create a normal account with your email.
2. In the Firebase console → **Realtime Database**, add this node:

```
admins
  └── <your-uid>
        role: "admin"
        email: "you@example.com"
        createdAt: 1700000000000
```

   Find your UID under **Authentication → Users**.
3. Log in at `admin/admin-login.html`. The panel verifies `admins/{uid}` on every page load; unauthorized users are redirected back to the admin login.

> No password is hard-coded anywhere. Never put real credentials in code.

---

## 5. First-run demo data

Admin → **Settings → Reset demo data** seeds:
exercises, workouts, meals, diet plans, 4 weekly plans (4 weeks × 7 days, workouts + all meals), goals, pricing, chatbot rules and site settings.

You can also **Export** the database to JSON there and **Import** it later.

---

## 6. Database structure (Realtime Database)

```
users/{uid}
  name, email, photoURL, role, createdAt, lastLogin, profileCompleted, status
  profile/          { age, gender, height, weight, activityLevel }
  goal              lose-weight | gain-muscle | stay-healthy | improve-fitness
  fitnessLevel      beginner | intermediate | advanced
  health/
    bmi             { value, category, height, weight, date }
    calories        { bmr, maintenanceCalories, target }
  subscription/     { planId, planName, status, startDate, endDate }
  trial/            { startDate, endDate, days }
  daily/{YYYY-MM-DD}/
    water, meals/{category}, habits/{key}, workoutCompleted, workoutMinutes, calories
  progress/
    streak          { current, best, lastDate }
    streakHistory/{date}
    weight/{date}
    lastWorkout
  beforeAfter/{front|back|left|right}/{before|after}  { url, date }
  beforeAfter/notes
  settings/theme    light | dark
  chatHistory/{pushId}  { text, who, at }
  plan/currentWeek  1..4

exercises/{key}     exercise library
workouts/{key}      workout programs (goal/level/exercises)
dietPlans/{key}     diet plans (meal key lists)
meals/{key}         meals with macros
weeklyPlans/week{1-4}/{monday..sunday}
                    { restDay, notes, workout{key,exercises}, diet{breakfast,lunch,snack,dinner} }
goals/{key}         goal cards
pricing/{key}       subscription plans
chatbot/{key}       assistant Q/A overrides
admins/{uid}        { role: "admin" }
settings            site-wide settings (trialDays, waterGoal, siteName, ...)
adminGallery/{id}   admin-managed before/after gallery
```

---

## 7. Storage structure

```
users/{uid}/profile/profile.jpg
users/{uid}/before-after/front-before.jpg   ... front-after.jpg
users/{uid}/before-after/back-before.jpg    ... back-after.jpg
users/{uid}/before-after/left-before.jpg    ... left-after.jpg
users/{uid}/before-after/right-before.jpg   ... right-after.jpg
exercises/{key}/image.jpg
meals/{key}/image.jpg
admin-gallery/{id}/front-before.jpg ... (8 views)
```

---

## 8. Project structure

```
index.html                  splash screen → welcome.html
welcome.html                premium landing page
login.html / signup.html / forgot-password.html
onboarding.html             6-step profile setup
goal.html                   goal + fitness level
bmi.html / calories.html    calculators (part of setup flow)
dashboard.html              daily overview
weekly-plan.html            4-week plan viewer
workout.html                workout cards + full workout player
exercises.html              exercise library
diet.html / meals.html      diet plans + today's meals
water.html / habits.html    trackers
progress.html               stats + SVG charts
before-after.html           photo uploads + comparison slider
assistant.html              AI fitness assistant (rule-based)
subscription.html           7-day trial + premium plans (simulated checkout)
settings.html               theme, data reset, logout

admin/                      13-page admin panel (login + CRUD for everything)

css/style.css               design system (light/dark CSS variables, components)
css/responsive.css          desktop / tablet / mobile rules
css/admin.css               admin panel styling
css/animations.css          keyframes & utility animations

js/firebase-config.js       >>> PASTE YOUR FIREBASE CONFIG HERE <<<
js/firebase-auth.js         auth wrappers (signup/login/google/reset)
js/firebase-db.js           RTDB wrappers + user shortcuts
js/firebase-storage.js      upload with progress
js/app.js                   layout, route guards, toasts, loader, modals, trial
js/utils.js                 dates, BMI/calorie math, validation, helpers
js/theme.js                 dark/light mode (localStorage + Firebase sync)
js/chatbot.js               rule-based assistant (+ admin overrides)
js/streak.js                real calendar-date streak logic
js/demo-data.js             seed data + afcSeedDemoData()
js/*.js                     one module per page

firebase-database-rules.json / firebase-storage-rules.txt
README.md
```

---

## 9. How to customize

| Change                     | Where                                                            |
|----------------------------|------------------------------------------------------------------|
| Branding / colors          | `css/style.css` `:root` variables (`--primary`, gradients) or Admin → Settings → Primary color |
| Pricing                    | Admin → Pricing (or `pricing/` in the database)                  |
| Workouts / exercises       | Admin → Workouts / Exercises                                     |
| Diet plans / meals         | Admin → Diet Plans / Meals                                       |
| Weekly plans               | Admin → Weekly Plans (4 weeks × 7 days, workout + diet per day) |
| Trial length / water goal  | Admin → Settings (`settings/trialDays`, `settings/waterGoal`)    |
| Chatbot answers            | Admin → Chatbot                                                  |

---

## 10. User flow

Splash → Welcome → Login/Signup/Google → Onboarding (6 steps) → Goal + Level →
BMI → Calories → Dashboard → Daily workout/meals/water/habits → Streak →
Progress → Before & After → AI Assistant → 7-day trial → Premium.

## 11. Admin flow

Admin login → Dashboard → Users / Exercises / Workouts / Diet / Meals /
Weekly Plans / Before & After / Goals / Pricing / Chatbot / Settings.
All CRUD writes directly to Firebase and user pages update via realtime listeners.

---

## 12. Security & safety notes

- Route protection: user pages redirect to `login.html`; admin pages verify `admins/{uid}` on every load (client-side gate) — the **database rules** are the real enforcement layer.
- Production authorization should use **Firebase Custom Claims** set by trusted backend code; never trust client-readable flags alone.
- The premium checkout is **simulated** (student project) — no real payment processing.
- The AI assistant is rule-based. A future real AI integration must go through a secure backend; secret API keys must never appear in frontend JavaScript.
- The app provides general wellness guidance only — no medical diagnosis, extreme dieting, or unsafe weight-loss advice.
