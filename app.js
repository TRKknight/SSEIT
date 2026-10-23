const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz1pSjjxhUc52_U3iEIAQ7JRWHj0CFbL2pYtr5n79fwdj_rmYDUpPiAg8gCBBGtkoFDUg/exec";
const FORM_TOKEN = "7d21373b7d61c439a587a4eabe2800d9";
const CONSENT_URL = "PASTE_INFORMED_CONSENT_FORM_URL_HERE";

const ITEMS = [
  "I know when to speak about my personal problems to others.",
  "When you are faced with obstacles, you remember times you overcame similar obstacles.",
  "I expect that I will do well on most things I try.",
  "Other people find it easy to confide in me.",
  "I find it hard to understand the non-verbal messages of other people.",
  "Some major events in my life have led me to re-evaluate what is important and not important.",
  "When my mood changes, I see new possibilities.",
  "Emotions are one of the things that make my life worth living.",
  "I am aware of my emotions as I experience them.",
  "I expect good things to happen.",
  "I like to share my emotions with others.",
  "When I experience a positive emotion, I know how to make it last.",
  "I arrange events that others enjoy.",
  "I seek out activities that make me happy.",
  "I am aware of the non-verbal messages I send to others.",
  "I present myself in a way that makes a good impression on others.",
  "When I am in a positive mood, solving problems is easy for me.",
  "By looking at people's facial expressions, I can recognize the emotions they are experiencing.",
  "I know why my emotions change.",
  "When I am in a positive mood, I am able to come up with new ideas.",
  "I have control over my emotions.",
  "I easily recognize my emotions as I experience them.",
  "I motivate myself by imagining a good outcome to the tasks I take on.",
  "I compliment others when they have done something well.",
  "I am aware of the non-verbal messages other people send.",
  "When another person tells me about an important event in their life, I almost feel as though I have experienced it myself.",
  "When I feel a change in emotions, I tend to come up with new ideas.",
  "When I am faced with a challenge, I give up because I believe I will fail.",
  "I know what other people are feeling just by looking at them.",
  "I help other people feel better when they are down.",
  "I use good moods to help myself keep trying in the face of obstacles.",
  "I can tell how people are feeling by listening to the tone of their voice.",
  "It is difficult for me to understand why people feel the way they do."
];

const DEMOGRAPHIC_OPTIONS = {
  sex: ["Male", "Female"],
  year: ["1st Year", "2nd Year", "3rd Minor Year", "3rd Major Year", "Internship"]
};

const LIFESTYLE = [
  {
    name: "sleep",
    label: "On average, how many hours do you sleep?",
    options: ["< 6 hours", "6 - 8 hours", "> 8 hours"]
  },
  {
    name: "study",
    label: "How many hours do you spend studying/working every day?",
    hint: "Studying includes college hours and other academically productive activities.",
    options: ["4 - 6 hours", "6 - 8 hours", "8 - 10 hours", "10+ hours"]
  },
  {
    name: "exercise",
    label: "Do you exercise regularly?",
    options: ["Yes", "No"]
  },
  {
    name: "screenTime",
    label: "What is your average screen time?",
    options: ["≤ 2 hours/day", "2 - 4 hours/day", "4 - 6 hours/day", "> 6 hours/day"]
  },
  {
    name: "stress",
    label: "Overall, how stressful was your past week?",
    hint: "1 = Relaxed, not at all stressful; 10 = Very stressful.",
    options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    scale: true,
    anchors: ["Relaxed", "Very stressful"]
  },
  {
    name: "overwhelmed",
    label: "How often do you feel completely overwhelmed or emotionally drained by your academic responsibilities?",
    options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    scale: true,
    anchors: ["Never", "Always"]
  },
  {
    name: "field",
    label: "Why did you choose your field?",
    options: [
      "I have a genuine interest in the subject matter",
      "I wanted a career that helps others or contributes to society",
      "I prioritized salary, job security, or lifestyle",
      "I was attracted to the respect associated with this profession",
      "I was pressured into pursuing it"
    ]
  }
];

const DIETARY = [
  {
    name: "diet",
    label: "Dietary preference",
    options: ["Vegetarian", "Non-Vegetarian", "Vegan", "Other (Eggetarian, Pescetarian, etc)"]
  },
  {
    name: "water",
    label: "How much water do you drink?",
    options: ["1 - 2 litres", "2 - 3 litres", "> 3 litres"]
  },
  {
    name: "meals",
    label: "How many meals do you eat in a day?",
    hint: "Meals - Breakfast, Lunch, Dinner, etc.",
    options: ["1", "2", "3", "> 3"]
  },
  {
    name: "junkFood",
    label: "In a regular week, how often do you consume junk food?",
    options: ["Never", "1–2 days per week", "3–4 days per week", "> 4 days per week"]
  }
];

const REQUIRED_NAMES = [
  "sex",
  "year",
  ...LIFESTYLE.map((question) => question.name),
  ...DIETARY.map((question) => question.name),
  ...ITEMS.map((_, index) => `q${index + 1}`)
];

const TOTAL_REQUIRED = REQUIRED_NAMES.length + 2;
const REVERSED = new Set([5, 28, 33]);
const MIN_TOTAL = ITEMS.length;
const MAX_TOTAL = ITEMS.length * 5;
const MIDPOINT = ITEMS.length * 3;

const SCALE = [
  { value: 1, label: "Strongly disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly agree" }
];

const els = {
  form: document.getElementById("survey"),
  items: document.getElementById("items"),
  lifestyle: document.getElementById("lifestyle"),
  dietary: document.getElementById("dietary"),
  consent: document.getElementById("consent"),
  consentWrap: document.getElementById("consent-wrap"),
  age: document.getElementById("age"),
  answered: document.getElementById("answered-count"),
  progress: document.querySelector(".progress"),
  progressBar: document.getElementById("progress-bar"),
  steps: Array.from(document.querySelectorAll(".stepper span")),
  pages: Array.from(document.querySelectorAll(".page")),
  submit: document.getElementById("submit-btn"),
  result: document.getElementById("result"),
  total: document.getElementById("total-score"),
  mean: document.getElementById("mean-score"),
  meter: document.getElementById("meter-fill"),
  interpretation: document.getElementById("interpretation"),
  saveStatus: document.getElementById("save-status")
};

let currentPage = 1;
let startedAt = null;

function isChecked(name) {
  return Boolean(document.querySelector(`input[name="${name}"]:checked`));
}

function checkedValue(name) {
  const input = document.querySelector(`input[name="${name}"]:checked`);
  return input ? input.value : null;
}

function readAge() {
  const raw = els.age.value.trim();
  if (raw === "") return { ok: false, reason: "empty" };
  if (!/^\d{1,3}$/.test(raw)) return { ok: false, reason: "format" };
  const value = Number(raw);
  if (value < 18 || value > 27) return { ok: false, reason: "range" };
  return { ok: true, value };
}

function buildChoiceGroup(container, name, options) {
  options.forEach((option) => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "radio";
    input.name = name;
    input.value = option;
    input.setAttribute("aria-label", option);

    const span = document.createElement("span");
    span.textContent = option;

    label.append(input, span);
    container.append(label);
  });
}

function buildQuestion(question) {
  const fieldset = document.createElement("fieldset");
  fieldset.className = "q";
  fieldset.dataset.name = question.name;

  const legend = document.createElement("legend");
  legend.textContent = question.label;
  fieldset.append(legend);

  if (question.hint) {
    const hint = document.createElement("p");
    hint.className = "hint";
    hint.textContent = question.hint;
    fieldset.append(hint);
  }

  if (question.scale) {
    const anchors = document.createElement("div");
    anchors.className = "scale-anchors";
    question.anchors.forEach((text) => {
      const span = document.createElement("span");
      span.textContent = text;
      anchors.append(span);
    });
    fieldset.append(anchors);
  }

  const options = document.createElement("div");
  options.className = question.scale ? "options scale10" : "options";

  question.options.forEach((option) => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "radio";
    input.name = question.name;
    input.value = String(option);
    input.setAttribute(
      "aria-label",
      question.scale
        ? `${question.anchors[0]} to ${question.anchors[1]}: ${option}`
        : `${question.label}: ${option}`
    );

    const span = document.createElement("span");
    span.textContent = String(option);

    label.append(input, span);
    options.append(label);
  });

  fieldset.append(options);
  return fieldset;
}

function buildItems() {
  const fragment = document.createDocumentFragment();

  ITEMS.forEach((text, index) => {
    const number = index + 1;
    const fieldset = document.createElement("fieldset");
    fieldset.className = "item";
    fieldset.dataset.index = String(index);

    const legend = document.createElement("legend");
    const num = document.createElement("span");
    num.className = "num";
    num.textContent = `${number}.`;
    const label = document.createElement("span");
    label.textContent = text;
    legend.append(num, label);
    fieldset.append(legend);

    const scale = document.createElement("div");
    scale.className = "scale";

    SCALE.forEach((option) => {
      const optionLabel = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `q${number}`;
      input.value = String(option.value);
      input.setAttribute("aria-label", `Statement ${number}: ${option.label}`);

      const pill = document.createElement("span");
      pill.textContent = String(option.value);

      optionLabel.append(input, pill);
      scale.append(optionLabel);
    });

    fieldset.append(scale);
    fragment.append(fieldset);
  });

  els.items.append(fragment);
}

function buildQuestionGroup(container, questions) {
  questions.forEach((question) => container.append(buildQuestion(question)));
}

function collectAnswers() {
  return ITEMS.map((_, index) => {
    const input = document.querySelector(`input[name="q${index + 1}"]:checked`);
    return input ? Number(input.value) : null;
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

function countAnswered() {
  let answered = 0;
  if (els.consent.checked) answered += 1;
  if (readAge().ok) answered += 1;
  REQUIRED_NAMES.forEach((name) => {
    if (isChecked(name)) answered += 1;
  });
  return answered;
}

function updateProgress() {
  const answered = countAnswered();
  const percent = Math.round((answered / TOTAL_REQUIRED) * 100);
  els.answered.textContent = String(answered);
  els.progressBar.style.width = `${percent}%`;
  els.progress.setAttribute("aria-valuenow", String(answered));
  els.progress.setAttribute("aria-valuemax", String(TOTAL_REQUIRED));
}

function updateStepper(page) {
  els.steps.forEach((step) => {
    const number = Number(step.dataset.step);
    step.classList.toggle("active", number === page);
    step.classList.toggle("done", number < page);
  });
}

function showPage(page) {
  currentPage = page;
  els.pages.forEach((section) => {
    section.hidden = Number(section.dataset.page) !== page;
  });
  updateStepper(page);
  window.scrollTo({ top: 0, behavior: "smooth" });
  const heading = els.pages[page - 1].querySelector("h2");
  if (heading) heading.focus({ preventScroll: true });
}

function clearState() {
  document.querySelectorAll(".invalid").forEach((element) => element.classList.remove("invalid"));
  [1, 2, 3].forEach((page) => {
    const box = document.getElementById(`error-${page}`);
    box.hidden = true;
    box.textContent = "";
  });
}

function markInvalid(container) {
  container.classList.add("invalid");
  container.scrollIntoView({ behavior: "smooth", block: "center" });
  const input = container.matches("input, button, a") ? container : container.querySelector("input");
  if (input) input.focus({ preventScroll: true });
}

function applyError(page, result) {
  if (!result) return false;
  showPage(page);
  const box = document.getElementById(`error-${page}`);
  box.textContent = result.message;
  box.hidden = false;
  markInvalid(result.container);
  return true;
}

function validatePageOne() {
  if (!els.consent.checked) {
    return {
      container: els.consentWrap,
      message: "Please confirm that you have read the consent form and agree to participate."
    };
  }

  const age = readAge();
  if (!age.ok) {
    const messages = {
      empty: "Please enter your age.",
      format: "Please enter your age as a whole number.",
      range: "This study includes participants aged 18 to 27 only."
    };
    return { container: els.age, message: messages[age.reason] };
  }

  if (!isChecked("sex")) {
    return { container: document.getElementById("sex-field"), message: "Please select your sex." };
  }

  if (!isChecked("year")) {
    return { container: document.getElementById("year-field"), message: "Please select your year of study." };
  }

  return null;
}

function validatePageTwo() {
  for (let index = 0; index < ITEMS.length; index += 1) {
    if (!isChecked(`q${index + 1}`)) {
      return {
        container: els.items.children[index],
        message: `Please answer statement ${index + 1}.`
      };
    }
  }
  return null;
}

function validatePageThree() {
  const questions = [...LIFESTYLE, ...DIETARY];
  for (const question of questions) {
    if (!isChecked(question.name)) {
      return {
        container: document.querySelector(`.q[data-name="${question.name}"]`),
        message: `Please answer: ${question.label}`
      };
    }
  }
  return null;
}

function goNext() {
  clearState();
  if (currentPage === 1) {
    if (applyError(1, validatePageOne())) return;
    showPage(2);
    return;
  }
  if (currentPage === 2) {
    if (applyError(2, validatePageTwo())) return;
    showPage(3);
  }
}

function goBack() {
  clearState();
  showPage(Math.max(1, currentPage - 1));
}

function showResult(total, mean) {
  els.total.textContent = String(total);
  els.mean.textContent = mean.toFixed(2);
  els.interpretation.textContent = describe(total);

  const position = ((total - MIN_TOTAL) / (MAX_TOTAL - MIN_TOTAL)) * 100;
  els.meter.style.width = `${Math.max(0, Math.min(100, position))}%`;

  els.form.hidden = true;
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

async function submitSurvey() {
  clearState();

  if (applyError(1, validatePageOne())) return;
  if (applyError(2, validatePageTwo())) return;
  if (applyError(3, validatePageThree())) return;

  const answers = collectAnswers();
  const { total, mean } = scoreAnswers(answers);
  const durationSeconds = startedAt ? Math.round((Date.now() - startedAt) / 1000) : null;

  els.submit.disabled = true;
  showResult(total, mean);
  els.saveStatus.textContent = "Saving your responses...";

  const saved = await saveResponse({
    token: FORM_TOKEN,
    honeypot: document.getElementById("company_website").value,
    consent: true,
    demographics: {
      age: readAge().value,
      sex: checkedValue("sex"),
      year: checkedValue("year")
    },
    lifestyle: {
      sleep: checkedValue("sleep"),
      study: checkedValue("study"),
      exercise: checkedValue("exercise"),
      screenTime: checkedValue("screenTime"),
      stress: Number(checkedValue("stress")),
      overwhelmed: Number(checkedValue("overwhelmed")),
      field: checkedValue("field")
    },
    dietary: {
      diet: checkedValue("diet"),
      water: checkedValue("water"),
      meals: checkedValue("meals"),
      junkFood: checkedValue("junkFood")
    },
    responses: answers,
    total,
    mean: Number(mean.toFixed(2)),
    durationSeconds
  });

  els.saveStatus.textContent = saved
    ? "Your responses were submitted anonymously. Thank you."
    : "Your score is shown, but your responses could not be sent. Please inform the researcher.";
}

function onInteraction() {
  if (!startedAt) startedAt = Date.now();
  clearState();
  updateProgress();
}

function setupConsentLink() {
  const link = document.getElementById("consent-link");
  if (/^https?:\/\//i.test(CONSENT_URL)) {
    link.href = CONSENT_URL;
    return;
  }
  link.removeAttribute("href");
  link.removeAttribute("target");
  link.setAttribute("aria-disabled", "true");
  link.textContent = "Informed consent form (link not configured yet)";
  link.addEventListener("click", (event) => event.preventDefault());
}

buildChoiceGroup(document.getElementById("sex-options"), "sex", DEMOGRAPHIC_OPTIONS.sex);
buildChoiceGroup(document.getElementById("year-options"), "year", DEMOGRAPHIC_OPTIONS.year);
buildQuestionGroup(els.lifestyle, LIFESTYLE);
buildQuestionGroup(els.dietary, DIETARY);
buildItems();
setupConsentLink();
updateStepper(1);
updateProgress();

els.form.addEventListener("input", onInteraction);
els.form.addEventListener("change", onInteraction);

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (currentPage < 3) {
    goNext();
    return;
  }
  submitSurvey();
});

els.pages.forEach((page) => {
  const next = page.querySelector("[data-next]");
  const back = page.querySelector("[data-back]");
  if (next) next.addEventListener("click", goNext);
  if (back) back.addEventListener("click", goBack);
});

document.getElementById("print-btn").addEventListener("click", () => window.print());

document.getElementById("restart-btn").addEventListener("click", () => {
  els.form.reset();
  clearState();
  els.form.hidden = false;
  els.result.hidden = true;
  els.submit.disabled = false;
  els.saveStatus.textContent = "";
  startedAt = null;
  updateProgress();
  showPage(1);
});
