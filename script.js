const WEBHOOK_URL = "http://localhost:5678/webhook/hr-assistant";

const form = document.getElementById("chatForm");
const questionInput = document.getElementById("question");
const sendBtn = document.getElementById("sendBtn");
const messages = document.getElementById("messages");

let isLoading = false;

function addMessage(text, type) {
  const row = document.createElement("div");
  row.className = `message-row ${type}`;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  row.appendChild(bubble);
  messages.appendChild(row);
  scrollToBottom();

  return row;
}

function showTyping() {
  const row = document.createElement("div");
  row.className = "message-row assistant";
  row.id = "typingIndicator";

  row.innerHTML = `
    <div class="bubble typing-bubble">
      <div class="typing" aria-label="Assistant is typing">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;

  messages.appendChild(row);
  scrollToBottom();
}

function hideTyping() {
  document.getElementById("typingIndicator")?.remove();
}

function scrollToBottom() {
  messages.scrollTop = messages.scrollHeight;
}

function setLoading(loading) {
  isLoading = loading;
  sendBtn.disabled = loading;
  questionInput.disabled = loading;

  if (!loading) {
    questionInput.focus();
  }
}

function autoResize() {
  questionInput.style.height = "auto";
  questionInput.style.height =
    Math.min(questionInput.scrollHeight, 130) + "px";
}

async function sendMessage() {
  const question = questionInput.value.trim();

  if (!question || isLoading) return;

  addMessage(question, "user");

  questionInput.value = "";
  autoResize();
  setLoading(true);
  showTyping();

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    hideTyping();

    const answer =
      typeof data.answer === "string"
        ? data.answer
        : data.output || "Sorry, I could not generate an answer.";

    addMessage(answer, "assistant");

  } catch (error) {
    console.error(error);
    hideTyping();

    addMessage(
      "Sorry, something went wrong. Please try again.",
      "assistant"
    );

  } finally {
    setLoading(false);
  }
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  sendMessage();
});

questionInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

questionInput.addEventListener("input", autoResize);

questionInput.focus();