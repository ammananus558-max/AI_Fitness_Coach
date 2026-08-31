/* ============================================================
   AI FITNESS COACH — DEMO / SEED DATA
   afcSeedDemoData() writes sample content to the top-level
   collections. Triggered from Admin → Settings → "Reset demo
   data". Safe to run multiple times (overwrites collections).
   ============================================================ */

window.AFC_DEMO = {
  settings: {
    siteName: "AI FITNESS COACH",
    primaryColor: "#ff2e63",
    trialDays: 7,
    waterGoal: 8,
    contactEmail: "support@aifitnesscoach.example",
    logoURL: ""
  },

  goals: [
    { key: "lose-weight", title: "Lose Weight", icon: "bi-fire", description: "Burn fat with cardio, full-body circuits and a smart calorie target.", level: "Beginner", workout: "workouts/fat-burn-basics", diet: "dietPlans/balanced-deficit" },
    { key: "gain-muscle", title: "Gain Muscle", icon: "bi-trophy-fill", description: "Build strength with progressive resistance training and protein-rich meals.", level: "Intermediate", workout: "workouts/strength-foundations", diet: "dietPlans/high-protein" },
    { key: "stay-healthy", title: "Stay Healthy", icon: "bi-heart-pulse-fill", description: "Balanced movement and nutrition to feel great every day.", level: "Beginner", workout: "workouts/wellness-basics", diet: "dietPlans/balanced-deficit" },
    { key: "improve-fitness", title: "Improve Fitness", icon: "bi-lightning-charge-fill", description: "Boost endurance, energy and overall conditioning.", level: "Intermediate", workout: "workouts/conditioning-mix", diet: "dietPlans/high-protein" }
  ],

  exercises: [
    { key: "squats", name: "Squats", category: "Legs", difficulty: "Beginner", sets: 3, reps: 15, duration: 0, rest: 30, instructions: "Stand with feet shoulder-width apart. Lower your hips back and down until thighs are parallel to the floor, then drive through your heels to stand.", image: "", videoURL: "" },
    { key: "push-ups", name: "Push Ups", category: "Chest", difficulty: "Beginner", sets: 3, reps: 12, duration: 0, rest: 30, instructions: "Keep your body in a straight line. Lower your chest toward the floor, then push back up.", image: "", videoURL: "" },
    { key: "plank", name: "Plank", category: "Core", difficulty: "Beginner", sets: 3, reps: 0, duration: 30, rest: 20, instructions: "Hold a straight-line position on your forearms. Keep your core tight and breathe steadily.", image: "", videoURL: "" },
    { key: "jumping-jacks", name: "Jumping Jacks", category: "Cardio", difficulty: "Beginner", sets: 3, reps: 30, duration: 0, rest: 20, instructions: "Jump your feet wide while raising your arms overhead, then return. Keep a steady rhythm.", image: "", videoURL: "" },
    { key: "lunges", name: "Lunges", category: "Legs", difficulty: "Intermediate", sets: 3, reps: 12, duration: 0, rest: 30, instructions: "Step forward and lower your hips until both knees are at 90 degrees. Alternate legs.", image: "", videoURL: "" },
    { key: "mountain-climbers", name: "Mountain Climbers", category: "Cardio", difficulty: "Intermediate", sets: 3, reps: 20, duration: 0, rest: 25, instructions: "From a plank, drive your knees toward your chest alternately at a quick pace.", image: "", videoURL: "" },
    { key: "burpees", name: "Burpees", category: "Full Body", difficulty: "Advanced", sets: 3, reps: 10, duration: 0, rest: 40, instructions: "Squat, kick back to a plank, return, and jump up with arms overhead.", image: "", videoURL: "" },
    { key: "glute-bridge", name: "Glute Bridge", category: "Legs", difficulty: "Beginner", sets: 3, reps: 15, duration: 0, rest: 25, instructions: "Lie on your back, knees bent. Drive hips up, squeeze glutes at the top, then lower slowly.", image: "", videoURL: "" },
    { key: "russian-twist", name: "Russian Twist", category: "Core", difficulty: "Intermediate", sets: 3, reps: 20, duration: 0, rest: 25, instructions: "Sit leaning back slightly, rotate your torso side to side with control.", image: "", videoURL: "" },
    { key: "superman", name: "Superman", category: "Back", difficulty: "Beginner", sets: 3, reps: 12, duration: 0, rest: 20, instructions: "Lie face down, lift arms and legs off the floor, hold briefly, then lower.", image: "", videoURL: "" },
    { key: "triceps-dips", name: "Triceps Dips", category: "Arms", difficulty: "Intermediate", sets: 3, reps: 12, duration: 0, rest: 30, instructions: "Using a sturdy chair, lower your body by bending your elbows, then press back up.", image: "", videoURL: "" },
    { key: "bicep-curls", name: "Bicep Curls", category: "Arms", difficulty: "Beginner", sets: 3, reps: 15, duration: 0, rest: 25, instructions: "Curl the weight toward your shoulder while keeping elbows tucked. Lower with control.", image: "", videoURL: "" },
    { key: "high-knees", name: "High Knees", category: "Cardio", difficulty: "Beginner", sets: 3, reps: 30, duration: 0, rest: 20, instructions: "Run in place lifting your knees to hip height. Pump your arms.", image: "", videoURL: "" },
    { key: "dead-bug", name: "Dead Bug", category: "Core", difficulty: "Beginner", sets: 3, reps: 12, duration: 0, rest: 20, instructions: "Lie on your back, extend opposite arm and leg, return, and alternate. Keep your lower back pressed down.", image: "", videoURL: "" },
    { key: "incline-pushups", name: "Incline Push Ups", category: "Chest", difficulty: "Beginner", sets: 3, reps: 12, duration: 0, rest: 30, instructions: "Hands on a raised surface, lower your chest toward it, then push up.", image: "", videoURL: "" },
    { key: "wall-sit", name: "Wall Sit", category: "Legs", difficulty: "Intermediate", sets: 3, reps: 0, duration: 40, rest: 30, instructions: "Slide down a wall until thighs are parallel to the floor and hold.", image: "", videoURL: "" }
  ],

  workouts: [
    { key: "fat-burn-basics", name: "Fat Burn Basics", goal: "lose-weight", level: "Beginner", day: "full", duration: 20, description: "A simple full-body circuit to get moving and burning.", exercises: ["squats", "push-ups", "jumping-jacks", "plank"], media: "", active: true },
    { key: "strength-foundations", name: "Strength Foundations", goal: "gain-muscle", level: "Intermediate", day: "full", duration: 30, description: "Build a base of strength with classic bodyweight moves.", exercises: ["squats", "push-ups", "lunges", "triceps-dips", "bicep-curls"], media: "", active: true },
    { key: "wellness-basics", name: "Wellness Basics", goal: "stay-healthy", level: "Beginner", day: "full", duration: 15, description: "Gentle daily movement for long-term health.", exercises: ["glute-bridge", "superman", "dead-bug", "wall-sit"], media: "", active: true },
    { key: "conditioning-mix", name: "Conditioning Mix", goal: "improve-fitness", level: "Intermediate", day: "full", duration: 25, description: "Mix cardio and strength to boost overall fitness.", exercises: ["mountain-climbers", "high-knees", "squats", "russian-twist", "burpees"], media: "", active: true },
    { key: "core-crusher", name: "Core Crusher", goal: "improve-fitness", level: "Intermediate", day: "core", duration: 15, description: "Focused core circuit for stability and strength.", exercises: ["plank", "russian-twist", "dead-bug", "mountain-climbers"], media: "", active: true },
    { key: "cardio-blast", name: "Cardio Blast", goal: "lose-weight", level: "Advanced", day: "cardio", duration: 20, description: "High-energy intervals to raise your heart rate.", exercises: ["jumping-jacks", "high-knees", "burpees", "mountain-climbers"], media: "", active: true }
  ],

  meals: [
    { key: "oatmeal-banana", name: "Oatmeal + Banana", category: "breakfast", calories: 320, protein: 10, carbs: 58, fat: 6, description: "Rolled oats with sliced banana and a drizzle of honey.", image: "", active: true },
    { key: "veggie-eggs", name: "Veggie Scrambled Eggs", category: "breakfast", calories: 290, protein: 20, carbs: 8, fat: 19, description: "Eggs scrambled with spinach, tomato and onion.", image: "", active: true },
    { key: "greek-yogurt-bowl", name: "Greek Yogurt Bowl", category: "breakfast", calories: 280, protein: 22, carbs: 30, fat: 6, description: "Greek yogurt with berries and granola.", image: "", active: true },
    { key: "avocado-toast", name: "Avocado Toast + Egg", category: "breakfast", calories: 340, protein: 14, carbs: 34, fat: 18, description: "Whole-grain toast with avocado and a poached egg.", image: "", active: true },
    { key: "chicken-rice", name: "Chicken + Rice + Salad", category: "lunch", calories: 520, protein: 42, carbs: 55, fat: 12, description: "Grilled chicken breast, steamed rice and fresh salad.", image: "", active: true },
    { key: "turkey-wrap", name: "Turkey Veggie Wrap", category: "lunch", calories: 430, protein: 30, carbs: 42, fat: 14, description: "Whole-wheat wrap with turkey, lettuce, tomato and yogurt sauce.", image: "", active: true },
    { key: "quinoa-bowl", name: "Quinoa Power Bowl", category: "lunch", calories: 480, protein: 18, carbs: 60, fat: 16, description: "Quinoa with roasted vegetables, chickpeas and tahini.", image: "", active: true },
    { key: "tuna-pasta", name: "Tuna Pasta", category: "lunch", calories: 510, protein: 34, carbs: 58, fat: 13, description: "Whole-grain pasta with tuna, peas and olive oil.", image: "", active: true },
    { key: "fruit-yogurt", name: "Fruit + Yogurt", category: "snack", calories: 180, protein: 12, carbs: 24, fat: 3, description: "Seasonal fruit with natural yogurt.", image: "", active: true },
    { key: "nuts-fruit", name: "Nuts + Apple", category: "snack", calories: 220, protein: 6, carbs: 22, fat: 13, description: "A handful of mixed nuts with an apple.", image: "", active: true },
    { key: "protein-shake", name: "Protein Shake", category: "snack", calories: 200, protein: 25, carbs: 12, fat: 4, description: "Protein shake with milk or a plant-based alternative.", image: "", active: true },
    { key: "hummus-carrots", name: "Hummus + Carrots", category: "snack", calories: 160, protein: 6, carbs: 18, fat: 8, description: "Carrot sticks with two tablespoons of hummus.", image: "", active: true },
    { key: "chicken-veg", name: "Chicken + Vegetables", category: "dinner", calories: 450, protein: 40, carbs: 20, fat: 18, description: "Baked chicken with roasted seasonal vegetables.", image: "", active: true },
    { key: "salmon-potato", name: "Salmon + Sweet Potato", category: "dinner", calories: 520, protein: 36, carbs: 38, fat: 22, description: "Baked salmon fillet with sweet potato wedges and greens.", image: "", active: true },
    { key: "veggie-stirfry", name: "Veggie Stir-Fry + Rice", category: "dinner", calories: 420, protein: 14, carbs: 62, fat: 12, description: "Mixed vegetables stir-fried with tofu and rice.", image: "", active: true },
    { key: "lean-beef-salad", name: "Lean Beef Salad", category: "dinner", calories: 460, protein: 38, carbs: 18, fat: 24, description: "Grilled lean beef over a big mixed salad.", image: "", active: true }
  ],

  dietPlans: [
    { key: "balanced-deficit", name: "Balanced Deficit", description: "Moderate calorie deficit with balanced macros for steady fat loss.", meals: ["oatmeal-banana", "chicken-rice", "fruit-yogurt", "chicken-veg"], active: true },
    { key: "high-protein", name: "High Protein", description: "Protein-forward meals to support muscle growth and recovery.", meals: ["veggie-eggs", "tuna-pasta", "protein-shake", "salmon-potato"], active: true }
  ],

  /* 4 weeks × 7 days. Each day: workout + diet (or restDay). */
  weeklyPlans: {},

  pricing: [
    { key: "plan-1m", name: "1 Month", price: 9.99, durationDays: 30, featured: false, active: true, features: ["Full workout library", "Personalized diet plans", "Progress tracking", "AI assistant"] },
    { key: "plan-3m", name: "3 Months", price: 24.99, durationDays: 90, featured: false, active: true, features: ["Everything in 1 Month", "Weekly plan updates", "Priority support"] },
    { key: "plan-6m", name: "6 Months", price: 39.99, durationDays: 180, featured: true, active: true, features: ["Everything in 3 Months", "Save 33% vs monthly", "New plans monthly"] },
    { key: "plan-12m", name: "1 Year", price: 59.99, durationDays: 365, featured: false, active: true, features: ["Everything in 6 Months", "Save 50% vs monthly", "Exclusive programs"] }
  ],

  chatbot: [
    { key: "warmup", question: "warm up", answer: "Always warm up for about 5 minutes: light jogging, arm circles and dynamic stretches prepare your body and reduce injury risk.", category: "Workout Tips" },
    { key: "protein", question: "protein", answer: "Good protein sources include eggs, chicken, fish, Greek yogurt, legumes and tofu. Aim to include protein in every main meal.", category: "Diet Tips" },
    { key: "rest-day", question: "rest day", answer: "Rest days are when your body adapts and gets stronger. Light walking or stretching is perfect — intense training is not required every day.", category: "Workout Tips" }
  ]
};

/* Build 4 weeks of weekly plans programmatically with variation. */
(function () {
  const weekWorkouts = [
    ["fat-burn-basics", "core-crusher", "rest", "strength-foundations", "cardio-blast", "wellness-basics", "rest"],
    ["conditioning-mix", "rest", "fat-burn-basics", "core-crusher", "strength-foundations", "cardio-blast", "rest"],
    ["strength-foundations", "cardio-blast", "rest", "conditioning-mix", "core-crusher", "fat-burn-basics", "rest"],
    ["cardio-blast", "strength-foundations", "wellness-basics", "rest", "conditioning-mix", "core-crusher", "rest"]
  ];
  const mealDays = [
    { breakfast: "oatmeal-banana", lunch: "chicken-rice", snack: "fruit-yogurt", dinner: "chicken-veg" },
    { breakfast: "veggie-eggs", lunch: "turkey-wrap", snack: "nuts-fruit", dinner: "salmon-potato" },
    { breakfast: "greek-yogurt-bowl", lunch: "quinoa-bowl", snack: "hummus-carrots", dinner: "veggie-stirfry" },
    { breakfast: "avocado-toast", lunch: "tuna-pasta", snack: "protein-shake", dinner: "lean-beef-salad" }
  ];
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const exNames = {
    "fat-burn-basics": ["Squats", "Push Ups", "Jumping Jacks", "Plank"],
    "strength-foundations": ["Squats", "Push Ups", "Lunges", "Triceps Dips", "Bicep Curls"],
    "wellness-basics": ["Glute Bridge", "Superman", "Dead Bug", "Wall Sit"],
    "conditioning-mix": ["Mountain Climbers", "High Knees", "Squats", "Russian Twist", "Burpees"],
    "core-crusher": ["Plank", "Russian Twist", "Dead Bug", "Mountain Climbers"],
    "cardio-blast": ["Jumping Jacks", "High Knees", "Burpees", "Mountain Climbers"]
  };
  for (let w = 0; w < 4; w++) {
    const week = {};
    for (let d = 0; d < 7; d++) {
      const workoutKey = weekWorkouts[w][d];
      const meal = mealDays[(w + d) % 4];
      const rest = workoutKey === "rest";
      week[days[d]] = {
        restDay: rest,
        notes: rest ? "Recovery: hydrate, stretch and sleep well." : "Warm up 5 minutes before starting.",
        workout: rest ? null : {
          key: workoutKey,
          exercises: exNames[workoutKey] || []
        },
        diet: {
          breakfast: meal.breakfast,
          lunch: meal.lunch,
          snack: meal.snack,
          dinner: meal.dinner
        }
      };
    }
    AFC_DEMO.weeklyPlans["week" + (w + 1)] = week;
  }
})();

/* Seed everything into the database. */
window.afcSeedDemoData = async function (onStep) {
  const step = function (t) { if (onStep) onStep(t); };
  step("Writing settings...");
  await afcDbSet("settings", AFC_DEMO.settings);
  step("Writing goals...");
  await afcDbSet("goals", Object.fromEntries(AFC_DEMO.goals.map(function (g) { return [g.key, { ...g, active: true }]; })));
  step("Writing exercises...");
  await afcDbSet("exercises", Object.fromEntries(AFC_DEMO.exercises.map(function (e) { return [e.key, e]; })));
  step("Writing workouts...");
  await afcDbSet("workouts", Object.fromEntries(AFC_DEMO.workouts.map(function (w) { return [w.key, w]; })));
  step("Writing meals...");
  await afcDbSet("meals", Object.fromEntries(AFC_DEMO.meals.map(function (m) { return [m.key, m]; })));
  step("Writing diet plans...");
  await afcDbSet("dietPlans", Object.fromEntries(AFC_DEMO.dietPlans.map(function (d) { return [d.key, d]; })));
  step("Writing weekly plans...");
  await afcDbSet("weeklyPlans", AFC_DEMO.weeklyPlans);
  step("Writing pricing...");
  await afcDbSet("pricing", Object.fromEntries(AFC_DEMO.pricing.map(function (p) { return [p.key, p]; })));
  step("Writing chatbot rules...");
  await afcDbSet("chatbot", Object.fromEntries(AFC_DEMO.chatbot.map(function (c) { return [c.key, c]; })));
  step("Done");
};

/* Export demo data (JSON string) for Admin → Settings → Export. */
window.afcDemoDataJSON = function () {
  return JSON.stringify(AFC_DEMO, null, 2);
};
