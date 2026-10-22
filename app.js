const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz1pSjjxhUc52_U3iEIAQ7JRWHj0CFbL2pYtr5n79fwdj_rmYDUpPiAg8gCBBGtkoFDUg/exec";

const SCALE = [
  { value: 1, label: "Strongly disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly agree" }
];

const ITEMS = [
  "I know when to speak about my personal problems to others.",
  "When I am faced with obstacles, I remember times I faced similar obstacles and overcame them.",
  "I expect that I will do well on most things I try.",
  "Other people find it easy to confide in me.",
  "I find it hard to understand the non-verbal messages of other people.",
  "Some of the major events of my life have led me to re-evaluate what is good and bad.",
  "When my mood changes, I see new possibilities.",
  "Emotions are one of the things that make my life worth living.",
  "I am aware of my emotions as I experience them.",
  "I expect good things to happen.",
  "I like to share my emotions with others.",
  "When I experience a positive emotion, I know how to make it last.",
  "I arrange events others enjoy.",
  "I seek out activities that make me happy.",
  "I am aware of the non-verbal messages I send to others.",
  "I present myself in a way that makes a good impression on others.",
  "When I am in a positive mood, solving problems is easy for me.",
  "By looking at their facial expressions, I recognize the emotions people are experiencing.",
  "I know why my emotions change.",
  "When I am in a positive mood, I am able to come up with new ideas.",
  "I have control over my emotions.",
  "I easily recognize my emotions as I experience them.",
  "I motivate myself by imagining a good outcome to tasks I take on.",
  "I compliment others when they have done something well.",
  "I am aware of the non-verbal messages other people send.",
  "When another person tells me about an important event in his or her life, I almost feel as though I experienced this event myself.",
  "When I feel a change in emotions, I tend to come up with new ideas.",
  "When I am faced with a challenge, I give up because I believe I will fail.",
  "I know what other people are feeling just by looking at them.",
  "I help other people feel better when they are down.",
  "I use good moods to help myself keep trying in the face of obstacles.",
  "I can tell how people are feeling by listening to the tone of their voice.",
  "It is difficult for me to understand why people feel the way they do."
];

const REVERSED = new Set([5, 28, 33]);
const MIN_TOTAL = ITEMS.length;
const MAX_TOTAL = ITEMS.length * 5;
const MIDPOINT = ITEMS.length * 3;

const els = {
  intro: document.getElementById("intro"),
  form: document.getElementById("survey"),
  items: document.getElementById("items"),
  answered: document.getElementById("answered-count"),
  percent: document.getElementById("percent"),
  progress: document.querySelector(".progress"),
  progressBar: document.getElementById("progress-bar"),
  error: document.getElementById("form-error"),
  submit: document.getElementById("submit-btn"),
  result: document.getElementById("result"),
  total: document.getElementById("total-score"),
  mean: document.getElementById("mean-score"),
  meter: document.getElementById("meter-fill"),
  interpretation: document.getElementById("interpretation"),
  saveStatus: document.getElementById("save-status")
};

let startedAt = null;

function buildItems() {
  const fragment = document.createDocumentFragment();

  ITEMS.forEach((text, index) => {
    const number = index + 1;
    const fieldset = document.createElement("fieldset");
    fieldset.className = "item";
    fieldset.dataset.index = String(index);

    const legend = document.createElement("legend");
    legend.innerHTML = `<span class="num">${number}.</span><span>${text}</span>`;
    fieldset.append(legend);

    const scale = document.createElement("div");
    scale.className = "scale";

    SCALE.forEach((option) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `q${number}`;
      input.value = String(option.value);
      input.setAttribute("aria-label", `Question ${number}: ${option.label}`);

      const pill = document.createElement("span");
      pill.textContent = String(option.value);

      label.append(input, pill);
      scale.append(label);
    });

    fieldset.append(scale);
    fragment.append(fieldset);
  });

  els.items.append(fragment);
}

function collectAnswers() {
  return ITEMS.map((_, index) => {
    const checked = els.form.querySelector(`input[name="q${index + 1}"]:checked`);
    return checked ? Number(checked.value) : null;
  });
}

function scoreAnswers(answers) {
  const total = answers.reduce((sum, value, index) => {
    const number = index + 1;
    const scored = REVERSED.has(number) ? 6 - value : value;
    return sum + scored;
  }, 0);
  return { total, mean: total / ITEMS.length };
}

function describe(total) {
  if (total > MIDPOINT) {
    return `Your total of ${total} is above the scale midpoint of ${MIDPOINT}, meaning your answers overall leaned toward higher emotional intelligence.`;
  }
  if (total < MIDPOINT) {
    return `Your total of ${total} is below the scale midpoint of ${MIDPOINT}, meaning your answers overall leaned toward lower emotional intelligence.`;
  }
  return `Your total of ${total} sits exactly at the scale midpoint of ${MIDPOINT}, meaning your answers were, on average, neutral.`;
}

function updateProgress() {
  const answered = collectAnswers().filter((value) => value !== null).length;
  const percent = Math.round((answered / ITEMS.length) * 100);
  els.answered.textContent = `${answered} of ${ITEMS.length} answered`;
  els.percent.textContent = `${percent}%`;
  els.progressBar.style.width = `${percent}%`;
  els.progress.setAttribute("aria-valuenow", String(answered));
  els.progress.setAttribute("aria-valuetext", `${answered} of ${ITEMS.length} answered`);
}

function showMissing(answers) {
  let firstMissing = null;
  els.form.querySelectorAll(".item").forEach((fieldset, index) => {
    const missing = answers[index] === null;
    fieldset.classList.toggle("missing", missing);
    if (missing && firstMissing === null) firstMissing = fieldset;
  });

  const count = answers.filter((value) => value === null).length;
  els.error.hidden = false;
  els.error.textContent = `Please answer all statements. ${count} ${count === 1 ? "item is" : "items are"} still unanswered.`;

  if (firstMissing) {
    firstMissing.scrollIntoView({ behavior: "smooth", block: "center" });
    const radio = firstMissing.querySelector("input[type=radio]");
    if (radio) radio.focus({ preventScroll: true });
  }
}

function clearMissing() {
  els.error.hidden = true;
  els.form.querySelectorAll(".item.missing").forEach((fieldset) => fieldset.classList.remove("missing"));
}

function showResult(total, mean) {
  els.total.textContent = String(total);
  els.mean.textContent = mean.toFixed(2);
  els.interpretation.textContent = describe(total);

  const position = ((total - MIN_TOTAL) / (MAX_TOTAL - MIN_TOTAL)) * 100;
  els.meter.style.width = `${Math.max(0, Math.min(100, position))}%`;

  els.form.hidden = true;
  els.intro.hidden = true;
  els.result.hidden = false;
  els.result.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function saveResponse(payload) {
  if (!/^https:\/\/script\.google\.com\//.test(SCRIPT_URL)) return false;
  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    return true;
  } catch (error) {
    return false;
  }
}

function startSurvey() {
  startedAt = Date.now();
  els.intro.hidden = true;
  els.form.hidden = false;
  els.result.hidden = true;
  updateProgress();
  els.form.querySelector("input[type=radio]").focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

els.form.addEventListener("change", () => {
  clearMissing();
  updateProgress();
});

els.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const answers = collectAnswers();

  if (answers.includes(null)) {
    showMissing(answers);
    return;
  }

  clearMissing();
  els.submit.disabled = true;
  const { total, mean } = scoreAnswers(answers);
  const durationSeconds = startedAt ? Math.round((Date.now() - startedAt) / 1000) : null;

  showResult(total, mean);
  els.saveStatus.textContent = "Saving your responses...";

  const saved = await saveResponse({
    responses: answers,
    total,
    mean: Number(mean.toFixed(2)),
    durationSeconds
  });

  els.saveStatus.textContent = saved
    ? "Your responses were recorded anonymously. Thank you."
    : "Your score is shown, but your responses could not be saved. Please inform the researcher.";
});

document.getElementById("start-btn").addEventListener("click", startSurvey);

document.getElementById("print-btn").addEventListener("click", () => window.print());

document.getElementById("restart-btn").addEventListener("click", () => {
  els.form.reset();
  clearMissing();
  updateProgress();
  els.submit.disabled = false;
  els.saveStatus.textContent = "";
  els.result.hidden = true;
  els.intro.hidden = false;
  els.form.hidden = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
});

buildItems();
