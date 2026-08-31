/* ============================================================
   AI FITNESS COACH — AI FITNESS ASSISTANT (chatbot)
   Rule-based responses (student version). Admins can add/edit
   responses in the admin panel; they are stored in Firebase at
   chatbot/{id} with { question, answer, category } and override
   the built-in intents.

   // FUTURE AI API INTEGRATION
   // Replace afcChatResolve() with a call to a secure backend
   // endpoint that forwards the message to an AI API. Never put
   // secret AI API keys in frontend JavaScript.
   ============================================================ */

window.AFC_BUILTIN_INTENTS = [
  {
    id: "workout-tips",
    category: "Workout Tips",
    keywords: ["workout tip", "workout tips", "training tip", "exercise tip", "how to train"],
    answer: "Workout tips: warm up 5 minutes before every session, focus on controlled form over speed, breathe out on the effort, and give each muscle group a rest day. Consistency beats intensity!"
  },
  {
    id: "diet-tips",
    category: "Diet Tips",
    keywords: ["diet tip", "diet tips", "nutrition", "what should i eat", "food tip", "meal tip"],
    answer: "Diet tips: build each plate around lean protein, vegetables and whole grains. Eat slowly, stop when comfortably full, and keep sugary drinks for special occasions. Hydration helps too!"
  },
  {
    id: "water-reminder",
    category: "Water",
    keywords: ["water reminder", "water", "hydrate", "hydration", "drink"],
    answer: "Water reminder: aim for about 8 glasses today. Keep a bottle with you, drink one glass with every meal, and add extra around workouts. You can log glasses on the Water page."
  },
  {
    id: "motivation",
    category: "Motivation",
    keywords: ["motivat", "inspire", "give up", "tired of", "no energy", "lazy"],
    answer: "Remember why you started. Progress is built in small daily wins — one workout, one healthy meal, one glass of water at a time. You have already shown up today. That counts. Keep going!"
  },
  {
    id: "how-to-use",
    category: "App Help",
    keywords: ["how to use", "how does this app", "help", "guide", "get started", "where do i"],
    answer: "How to use this app: check your Dashboard each morning, follow Today's Workout, mark your meals as completed, log water on the Water page, and keep your daily habits going to grow your streak. The Weekly Plan shows workouts and meals for all 4 weeks."
  },
  {
    id: "my-progress",
    category: "My Progress",
    keywords: ["my progress", "progress", "how am i doing", "stats", "results"],
    answer: null // filled dynamically with real user data
  },
  {
    id: "streak",
    category: "App Help",
    keywords: ["streak"],
    answer: "Your streak grows by one for each day you complete your workout. Miss a day and it resets — so keep the chain alive!"
  },
  {
    id: "bmi-help",
    category: "App Help",
    keywords: ["bmi", "body mass"],
    answer: "BMI is a general screening estimate based on your height and weight — it is not a medical diagnosis. Find yours on the BMI page."
  },
  {
    id: "greeting",
    category: "App Help",
    keywords: ["hello", "hi", "hey", "good morning", "good evening"],
    answer: "Hello! I am your AI Fitness Coach. Ask me about workouts, diet, water, motivation, or how to use this app."
  }
];

let _afcChatCache = null;

/* Load admin-defined answers (overrides built-ins when keywords match). */
async function _afcLoadChatRules() {
  if (_afcChatCache) return _afcChatCache;
  try {
    const data = await afcDbGet("chatbot");
    _afcChatCache = data
      ? Object.keys(data).map(function (k) {
          return { question: data[k].question || "", answer: data[k].answer || "", category: data[k].category || "General" };
        })
      : [];
  } catch (e) {
    _afcChatCache = [];
  }
  return _afcChatCache;
}

/* Core reply resolver. */
window.afcChatResolve = async function (message) {
  const q = String(message || "").toLowerCase().trim();
  const rules = await _afcLoadChatRules();

  /* Admin rules take priority. */
  for (const rule of rules) {
    const kw = String(rule.question || "").toLowerCase();
    if (kw && q && (q.includes(kw) || kw.split(/\s+/).some(function (w) { return w.length > 3 && q.includes(w); }))) {
      return rule.answer;
    }
  }

  for (const intent of AFC_BUILTIN_INTENTS) {
    if (intent.keywords.some(function (k) { return q.includes(k); })) {
      if (intent.id === "my-progress") return await _afcProgressAnswer();
      return intent.answer;
    }
  }
  return "I am a simple rule-based coach for now, but I can help with: workout tips, diet tips, water reminders, motivation, your progress, and how to use this app. Try one of the quick buttons below!";
};

async function _afcProgressAnswer() {
  try {
    if (!window.AFC_SESSION) return "Log in to see your progress summary.";
    const [daily, streak, health] = await Promise.all([
      afcUserGet("daily"),
      afcUserGet("progress/streak"),
      afcUserGet("health")
    ]);
    const today = (daily || {})[afcTodayKey()] || {};
    const workouts = Object.keys(daily || {}).filter(function (k) { return daily[k] && daily[k].workoutCompleted; }).length;
    const parts = [];
    parts.push("Today you drank " + (today.water || 0) + " glasses of water and completed " + ((today.meals || {}) ? Object.keys(today.meals || {}).length : 0) + " meals.");
    parts.push("Total workouts completed: " + workouts + ".");
    if (streak) parts.push("Current streak: " + (streak.current || 0) + " days.");
    if (health && health.bmi) parts.push("Your last BMI was " + health.bmi + ".");
    return parts.join(" ");
  } catch (e) {
    return "I could not load your progress right now. Check the Progress page for details.";
  }
}

/* ---------------- Chat UI ---------------- */

function _timeStr() {
  return new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function _bubble(text, who) {
  return '<div class="chat-bubble ' + who + '">' + afcEscape(text).replace(/\n/g, "<br>") +
    '<span class="time">' + _timeStr() + "</span></div>";
}

/* Floating widget used across user pages. */
window.afcMountChatWidget = function () {
  if (qs(".chat-fab")) return;

  const fab = document.createElement("button");
  fab.className = "chat-fab";
  fab.setAttribute("aria-label", "Open AI Fitness Assistant");
  fab.innerHTML = '<i class="bi bi-robot" aria-hidden="true"></i>';

  const panel = document.createElement("div");
  panel.className = "chat-panel tile";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "AI Fitness Assistant");
  panel.innerHTML =
    '<div class="chat-head">' +
    '<i class="bi bi-robot" style="font-size:1.4rem" aria-hidden="true"></i>' +
    "<div style=\"flex:1\"><b>AI FITNESS COACH</b><div style=\"font-size:.7rem;opacity:.85\">Your fitness assistant</div></div>" +
    '<button class="btn btn-sm text-white" data-chat-close aria-label="Close chat"><i class="bi bi-x-lg"></i></button>' +
    "</div>" +
    '<div class="chat-body" id="afcChatBody"></div>' +
    '<div class="chat-quick" id="afcChatQuick">' +
    ['WORKOUT TIPS', 'DIET TIPS', 'WATER REMINDER', 'MOTIVATION', 'HOW TO USE APP', 'MY PROGRESS'].map(function (t) {
      return '<button type="button">' + t + "</button>";
    }).join("") +
    "</div>" +
    '<form class="chat-input-row" id="afcChatForm">' +
    '<input class="form-control form-control-sm" id="afcChatInput" placeholder="Ask me anything..." aria-label="Message" autocomplete="off">' +
    '<button class="btn btn-fire btn-sm px-3" type="submit" aria-label="Send"><i class="bi bi-send-fill"></i></button>' +
    "</form>";

  document.body.appendChild(fab);
  document.body.appendChild(panel);

  const body = panel.querySelector("#afcChatBody");
  let historyLoaded = false;

  function scrollBottom() { body.scrollTop = body.scrollHeight; }

  function addBubble(text, who) {
    body.insertAdjacentHTML("beforeend", _bubble(text, who));
    scrollBottom();
  }

  function showTyping() {
    body.insertAdjacentHTML("beforeend",
      '<div class="chat-bubble bot" data-typing><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>');
    scrollBottom();
  }
  function hideTyping() {
    const t = body.querySelector("[data-typing]");
    if (t) t.remove();
  }

  window.afcChatSend = async function (text) {
    text = String(text || "").trim();
    if (!text) return;
    addBubble(text, "user");
    _afcSaveHistory(text, "user");
    showTyping();
    const delay = 500 + Math.random() * 600;
    const [reply] = await Promise.all([
      afcChatResolve(text),
      new Promise(function (r) { setTimeout(r, delay); })
    ]);
    hideTyping();
    addBubble(reply, "bot");
    _afcSaveHistory(reply, "bot");
  };

  function _afcSaveHistory(text, who) {
    if (!window.AFC_SESSION || !window.afcDbPush) return;
    afcDbPush("users/" + afcUid() + "/chatHistory", {
      text: text, who: who, at: Date.now()
    }).catch(function () {});
  }

  async function loadHistory() {
    if (historyLoaded || !window.AFC_SESSION) {
      if (!historyLoaded) addBubble("Hi! I am your AI Fitness Coach. How can I help you today?", "bot");
      historyLoaded = true;
      return;
    }
    historyLoaded = true;
    try {
      const hist = await afcUserGet("chatHistory");
      if (!hist) {
        addBubble("Hi! I am your AI Fitness Coach. How can I help you today?", "bot");
        return;
      }
      const items = Object.keys(hist).map(function (k) { return hist[k]; }).sort(function (a, b) { return (a.at || 0) - (b.at || 0); }).slice(-30);
      items.forEach(function (m) { addBubble(m.text, m.who === "user" ? "user" : "bot"); });
    } catch (e) {
      addBubble("Hi! I am your AI Fitness Coach. How can I help you today?", "bot");
    }
  }

  fab.addEventListener("click", function () {
    const open = panel.classList.toggle("open");
    if (open) loadHistory();
  });
  panel.querySelector("[data-chat-close]").addEventListener("click", function () {
    panel.classList.remove("open");
  });
  panel.querySelector("#afcChatForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const input = panel.querySelector("#afcChatInput");
    afcChatSend(input.value);
    input.value = "";
  });
  panel.querySelector("#afcChatQuick").addEventListener("click", function (e) {
    const btn = e.target.closest("button");
    if (btn) afcChatSend(btn.textContent);
  });
};
