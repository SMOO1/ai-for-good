// Simple drawing game logic for "Draw the Word"
// This file is designed so you can easily plug in
// a real TensorFlow.js sketch model or a cloud API.

// Core nouns with specific images.
const BASE_VOCAB = [
  {
    id: "hammer",
    en: "hammer",
    rohingya: "হামার (example)", // TODO: replace with correct Rohingya
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Hammer.svg/512px-Hammer.svg.png",
  },
  {
    id: "phone",
    en: "phone",
    rohingya: "ফোন (example)", // TODO: replace with correct Rohingya
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/3/30/Iphone_12_vector.svg",
  },
  {
    id: "glasses",
    en: "glasses",
    rohingya: "চশমা (example)", // TODO: replace with correct Rohingya
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Glasses_green.svg/512px-Glasses_green.svg.png",
  },
];

// Extra simple nouns so the game can run "forever".
// For hackathon purposes we reuse a generic icon;
// you can later attach specific images and Rohingya translations.
const EXTRA_NOUNS = [
  "chair",
  "table",
  "cup",
  "spoon",
  "plate",
  "door",
  "window",
  "bed",
  "book",
  "bag",
  "shoe",
  "shirt",
  "ball",
  "car",
  "bus",
  "house",
  "tree",
  "flower",
  "fish",
  "bird",
  "cat",
  "dog",
  "clock",
  "key",
  "pen",
  "pencil",
  "bottle",
  "hat",
  "basket",
];

const GENERIC_ICON =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/OOjs_UI_icon_edit-ltr-progressive.svg/512px-OOjs_UI_icon_edit-ltr-progressive.svg.png";

const VOCAB = [
  ...BASE_VOCAB,
  ...EXTRA_NOUNS.map((word) => ({
    id: word,
    en: word,
    rohingya: "[add Rohingya here]",
    imageUrl: GENERIC_ICON,
  })),
];

const state = {
  index: 0,
  score: 0,
  model: null,
  modelLabels: null,
  checking: false, // used by manual "Check" button
  history: [], // { id, correct, usedHelp, ts }
  currentCorrect: false,
  usedHelpCurrent: false,
  liveIntervalId: null,
  predicting: false,
  consecutiveMatches: 0,
  lastStrokeTime: 0,
};

const elements = {
  canvas: document.getElementById("draw-canvas"),
  feedback: document.getElementById("feedback"),
  clearButton: document.getElementById("clear-button"),
  checkButton: document.getElementById("check-button"),
  skipButton: document.getElementById("skip-button"),
  nextButton: document.getElementById("next-button"),
  scoreCircle: document.getElementById("score-circle"),
  scoreText: document.getElementById("score-text"),
  roundLabel: document.getElementById("round-label"),
  targetWord: document.getElementById("target-word"),
  targetTranslation: document.getElementById("target-translation"),
  helpModeLabel: document.getElementById("help-mode-label"),
  refPlaceholder: document.getElementById("ref-placeholder"),
  refImage: document.getElementById("ref-image"),
  refMeta: document.getElementById("ref-meta"),
  refWord: document.getElementById("ref-word"),
  refTranslation: document.getElementById("ref-translation"),
  audioButton: document.getElementById("audio-button"),
};

// Canvas drawing setup (mouse + touch)
const ctx = elements.canvas.getContext("2d");
let drawing = false;
let lastX = 0;
let lastY = 0;
let totalDrawnLength = 0;

function resizeCanvas() {
  const rect = elements.canvas.getBoundingClientRect();
  const pixelRatio = window.devicePixelRatio || 1;
  elements.canvas.width = rect.width * pixelRatio;
  elements.canvas.height = rect.height * pixelRatio;
  ctx.scale(pixelRatio, pixelRatio);
  clearCanvas();
}

function clearCanvas() {
  const rect = elements.canvas.getBoundingClientRect();
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, rect.width, rect.height);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#f9fafb";
  ctx.lineWidth = 4;
  totalDrawnLength = 0;
}

function getCanvasPos(evt) {
  const rect = elements.canvas.getBoundingClientRect();
  const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
  const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
}

function startDraw(evt) {
  evt.preventDefault();
  drawing = true;
  const pos = getCanvasPos(evt);
  lastX = pos.x;
  lastY = pos.y;
  ensureLivePrediction();
  state.lastStrokeTime = Date.now();
}

function draw(evt) {
  if (!drawing) return;
  evt.preventDefault();
  const pos = getCanvasPos(evt);
  const dx = pos.x - lastX;
  const dy = pos.y - lastY;
  totalDrawnLength += Math.hypot(dx, dy);
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
  lastX = pos.x;
  lastY = pos.y;
}

function endDraw(evt) {
  if (!drawing) return;
  evt.preventDefault();
  drawing = false;
}

elements.canvas.addEventListener("mousedown", startDraw);
elements.canvas.addEventListener("mousemove", draw);
window.addEventListener("mouseup", endDraw);

elements.canvas.addEventListener("touchstart", startDraw, { passive: false });
elements.canvas.addEventListener("touchmove", draw, { passive: false });
elements.canvas.addEventListener("touchend", endDraw, { passive: false });
elements.canvas.addEventListener("touchcancel", endDraw, { passive: false });

window.addEventListener("resize", () => {
  resizeCanvas();
});

// Game logic
function currentWord() {
  return VOCAB[state.index % VOCAB.length];
}

function updateWordUI() {
  const word = currentWord();
  elements.roundLabel.textContent = `Word ${state.index + 1}`;
  elements.targetWord.textContent = word.en.toUpperCase();
  elements.targetTranslation.textContent = word.rohingya;
  elements.refWord.textContent = word.en.toUpperCase();
  elements.refTranslation.textContent = word.rohingya;
  elements.refImage.src = word.imageUrl;
  elements.refImage.alt = word.en;
  hideReference();
}

function updateScoreUI() {
  elements.scoreCircle.textContent = String(state.score);
  elements.scoreText.textContent = state.score === 1 ? "Correct drawing" : "Correct drawings";
}

function setFeedbackSuccess() {
  elements.feedback.innerHTML = `
    <span class="feedback-pill success">
      <span class="feedback-icon">👍</span>
      Great! That looks like a ${currentWord().en}.
    </span>
  `;
}

function setFeedbackTryAgain() {
  elements.feedback.innerHTML = `
    <span class="feedback-pill error">
      <span class="feedback-icon">✨</span>
      Nice try. Add more details or try a different angle.
    </span>
  `;
}

function setFeedbackMuted(message) {
  elements.feedback.textContent = message;
}

function setGuessFeedback(label, score) {
  if (!label) {
    setFeedbackMuted("Keep drawing. We are thinking…");
    return;
  }
  const target = currentWord().en.toLowerCase();
  const predicted = label.toLowerCase();
  const isMatch = predicted === target;
  const confidence = Math.round((score || 0) * 100);
  elements.feedback.innerHTML = `
    <span class="feedback-pill ${isMatch ? "success" : ""}">
      <span class="feedback-icon">🤖</span>
      Our guess: <strong>${label}</strong>${confidence ? ` (${confidence}%)` : ""}
    </span>
  `;
}

function showReference() {
  elements.helpModeLabel.textContent = "Showing";
  elements.helpModeLabel.style.color = "#fbbf24";
  elements.refPlaceholder.style.display = "none";
  elements.refImage.style.display = "block";
  elements.refMeta.style.display = "block";
}

function hideReference() {
  elements.helpModeLabel.textContent = "Hidden";
  elements.helpModeLabel.style.color = "";
  elements.refPlaceholder.style.display = "block";
  elements.refImage.style.display = "none";
  elements.refMeta.style.display = "none";
}

// Audio (browser speech synthesis as a simple option)
function speakWord() {
  const word = currentWord();
  if (!("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(word.en);
  utterance.lang = "en-US";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

elements.audioButton.addEventListener("click", speakWord);

// Sketch recognition
// ----------------------------------------------------------
// This is the main plug-in point for your ML model or API.
// The function should return:
//   { label: string, score: number }
// where "label" is an English word/class like "hammer".
// ----------------------------------------------------------

async function recognizeDrawing() {
  // If you have plugged in a real TensorFlow.js model and label list,
  // use it here for true Quick Draw–style recognition.
  if (state.model && Array.isArray(state.modelLabels) && state.modelLabels.length > 0) {
    const rect = elements.canvas.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);

    // Convert canvas to a small grayscale tensor, e.g. 28x28.
    // Adjust these sizes to match your model.
    const TARGET_SIZE = 28;

    const imgTensor = tf.tidy(() => {
      // Read pixels from the visible canvas.
      const pixels = tf.browser.fromPixels(elements.canvas, 1); // 1 channel grayscale
      const resized = tf.image.resizeBilinear(pixels, [TARGET_SIZE, TARGET_SIZE]);
      const normalized = resized.toFloat().div(255.0);
      // Shape: [1, H, W, 1]
      return normalized.expandDims(0);
    });

    try {
      const logits = state.model.predict(imgTensor);
      const probs = logits.softmax ? logits.softmax() : logits;
      const data = await probs.data();
      let bestIdx = 0;
      let bestScore = data[0];
      for (let i = 1; i < data.length; i++) {
        if (data[i] > bestScore) {
          bestScore = data[i];
          bestIdx = i;
        }
      }
      imgTensor.dispose();
      if (probs !== logits) probs.dispose();
      logits.dispose();

      const label = state.modelLabels[bestIdx] || "";
      return { label, score: bestScore };
    } catch (err) {
      console.warn("Model prediction failed, falling back to stub:", err);
      imgTensor.dispose();
    }
  }

  // Fallback stub if no model is configured.
  const fakeDelay = 250 + Math.random() * 200;
  await new Promise((resolve) => setTimeout(resolve, fakeDelay));

  // Placeholder logic: only consider the drawing if there is enough ink.
  const nonEmpty = canvasHasInk();
  const MIN_LENGTH = 220; // stricter stroke-length threshold
  if (!nonEmpty || totalDrawnLength < MIN_LENGTH) {
    return { label: "", score: 0.1 };
  }

  // Without a real model we cannot truly distinguish hammer vs phone vs glasses.
  // For demo purposes we still guess the current word, but the main strictness
  // comes from the live-prediction logic (multiple consistent matches required).
  const maxBoost = 0.25;
  const boost = Math.min(maxBoost, totalDrawnLength / 900); // more drawing => higher confidence
  const base = 0.65 + boost;
  return { label: currentWord().en, score: base };
}

function canvasHasInk() {
  const rect = elements.canvas.getBoundingClientRect();
  const imageData = ctx.getImageData(0, 0, rect.width, rect.height);
  const data = imageData.data;
  // Check a small sample of pixels for non-background content.
  // Background is dark; we look for any fairly bright pixel.
  const step = 16 * 4;
  for (let i = 0; i < data.length; i += step) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = (r + g + b) / 3;
    if (brightness > 40) return true;
  }
  return false;
}

async function runLivePrediction(force = false) {
  if (state.currentCorrect) return;
  if (state.predicting && !force) return;
  if (!canvasHasInk() && !force) return;

  // Give the learner a bit of time before we start judging.
  const now = Date.now();
  const MIN_TIME_MS = 1200;
  if (!force && (!state.lastStrokeTime || now - state.lastStrokeTime < MIN_TIME_MS)) {
    return;
  }

  state.predicting = true;
  try {
    const result = await recognizeDrawing();
    const label = result.label || "";
    const score = result.score || 0;
    if (!label) {
      if (force) setFeedbackMuted("We need a bit more drawing.");
      state.predicting = false;
      return;
    }

    const target = currentWord().en.toLowerCase();
    const predicted = label.toLowerCase();
    const isMatch = predicted === target && score >= 0.9;

    if (isMatch) {
      state.consecutiveMatches += 1;
    } else {
      state.consecutiveMatches = 0;
    }

    setGuessFeedback(label, score);

    // Require several consistent "correct" guesses in a row
    // before we accept the answer, to avoid it feeling too easy.
    const REQUIRED_MATCHES = 5;
    if (state.consecutiveMatches >= REQUIRED_MATCHES) {
      onWordRecognized();
    }
  } catch (err) {
    console.error("Live prediction error:", err);
    if (force) {
      setFeedbackMuted("We could not check this drawing. Please try again.");
    }
  } finally {
    state.predicting = false;
  }
}

function onWordRecognized() {
  if (state.currentCorrect) return;
  state.currentCorrect = true;
  state.consecutiveMatches = 0;
  state.score += 1;
  updateScoreUI();
  setFeedbackSuccess();
  elements.nextButton.disabled = false;
  elements.skipButton.disabled = true;
  speakWord();
}

function ensureLivePrediction() {
  if (state.liveIntervalId != null) return;
  state.liveIntervalId = window.setInterval(() => {
    runLivePrediction(false);
  }, 1500);
}

function stopLivePrediction() {
  if (state.liveIntervalId != null) {
    window.clearInterval(state.liveIntervalId);
    state.liveIntervalId = null;
  }
}

function recordAndAdvance() {
  const word = currentWord();
  state.history.push({
    id: word.id,
    correct: state.currentCorrect,
    usedHelp: state.usedHelpCurrent,
    ts: Date.now(),
  });

  state.index = (state.index + 1) % VOCAB.length;
  state.currentCorrect = false;
  state.usedHelpCurrent = false;
  state.consecutiveMatches = 0;
  state.lastStrokeTime = 0;
  elements.nextButton.disabled = true;
  elements.skipButton.disabled = false;

  stopLivePrediction();
  clearCanvas();
  updateWordUI();
  setFeedbackMuted("New word. Draw what you see.");
}

// Button wiring
elements.clearButton.addEventListener("click", () => {
  clearCanvas();
  setFeedbackMuted("Canvas cleared. Try again.");
});

elements.checkButton.addEventListener("click", () => {
  // Manual "check now", on top of continuous prediction
  runLivePrediction(true);
});

elements.skipButton.addEventListener("click", () => {
  showReference();
  state.usedHelpCurrent = true;
  elements.skipButton.disabled = true;
  elements.nextButton.disabled = true;
  setFeedbackMuted("Look at the picture. We will show a new word.");
  setTimeout(() => {
    recordAndAdvance();
  }, 1300);
});

elements.nextButton.addEventListener("click", () => {
  recordAndAdvance();
});

// Optional: load a TensorFlow.js model on startup.
// You can put your model files in /web/models and update the URL here.
async function maybeLoadModel() {
  if (!window.tf) return;
  try {
    // Example (uncomment and update path once you have a model):
    //
    // state.model = await tf.loadLayersModel("./models/model.json");
    // state.modelLabels = [...]; // Array of label strings, same order as model outputs.
    //
    // Then update recognizeDrawing() to use state.model.
  } catch (err) {
    console.warn("Could not load sketch model:", err);
  }
}

// Init
window.addEventListener("load", async () => {
  resizeCanvas();
  updateWordUI();
  updateScoreUI();
  setFeedbackMuted("Start drawing. We will guess your word as you draw.");
  await maybeLoadModel();
});

