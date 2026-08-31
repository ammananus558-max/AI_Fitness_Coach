/* ============================================================
   AI FITNESS COACH — ASSISTANT PAGE (full-page chat)
   Reuses afcChatResolve from chatbot.js. Mounted with noChat
   so there is no floating widget duplicate.
   ============================================================ */
(async function () {
  let session;
  try { session = await requireAuth(); } catch (e) { return; }
  afcMountLayout("assistant", { noChat: true });

  var body = qs("#chatBody");
  var form = qs("#chatForm");
  var input = qs("#chatInput");
  var quickWrap = qs("#chatQuick");
  var historyLoaded = false;

  function timeStr() {
    return new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }

  function bubbleHtml(text, who) {
    return '<div class="chat-bubble ' + who + '">' +
      afcEscape(text).replace(/\n/g, "<br>") +
      '<span class="time">' + timeStr() + "</span></div>";
  }

  function scrollBottom() {
    requestAnimationFrame(function () { body.scrollTop = body.scrollHeight; });
  }

  function addBubble(text, who) {
    body.insertAdjacentHTML("beforeend", bubbleHtml(text, who));
    scrollBottom();
  }

  function showTyping() {
    body.insertAdjacentHTML("beforeend",
      '<div class="chat-bubble bot" data-typing>' +
      '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>');
    scrollBottom();
  }

  function hideTyping() {
    var t = body.querySelector("[data-typing]");
    if (t) t.remove();
  }

  function saveHistory(text, who) {
    if (!afcUid()) return;
    afcDbPush("users/" + afcUid() + "/chatHistory", {
      text: text, who: who, at: Date.now()
    }).catch(function () {});
  }

  async function loadHistory() {
    if (historyLoaded) return;
    historyLoaded = true;
    try {
      var hist = await afcUserGet("chatHistory");
      if (!hist) {
        addBubble("Hi! I am your AI Fitness Coach. Ask me about workouts, diet, water, motivation, or how to use this app.", "bot");
        return;
      }
      var items = Object.keys(hist).map(function (k) { return hist[k]; })
        .sort(function (a, b) { return (a.at || 0) - (b.at || 0); })
        .slice(-50);
      if (items.length === 0) {
        addBubble("Hi! I am your AI Fitness Coach. Ask me about workouts, diet, water, motivation, or how to use this app.", "bot");
        return;
      }
      items.forEach(function (m) {
        addBubble(m.text, m.who === "user" ? "user" : "bot");
      });
    } catch (e) {
      addBubble("Hi! I am your AI Fitness Coach. Ask me about workouts, diet, water, motivation, or how to use this app.", "bot");
    }
  }

  async function sendMessage(text) {
    text = String(text || "").trim();
    if (!text) return;
    addBubble(text, "user");
    saveHistory(text, "user");
    input.value = "";
    showTyping();
    var delay = 500 + Math.random() * 600;
    var reply;
    try {
      var results = await Promise.all([
        afcChatResolve(text),
        new Promise(function (r) { setTimeout(r, delay); })
      ]);
      reply = results[0];
    } catch (e) {
      reply = "Sorry, something went wrong. Please try again.";
    }
    hideTyping();
    addBubble(reply, "bot");
    saveHistory(reply, "bot");
  }

  /* Form submit */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    sendMessage(input.value);
  });

  /* Quick chips */
  quickWrap.addEventListener("click", function (e) {
    var btn = e.target.closest("button");
    if (btn) sendMessage(btn.textContent);
  });

  /* Enter key handled by form submit; focus input on load */
  await loadHistory();
  input.focus();
})();
