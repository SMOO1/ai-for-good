// Photo-to-word demo using TensorFlow.js MobileNet (ImageNet classes).
// Runs fully in the browser; no backend or cloud calls.

const elements = {
  fileInput: document.getElementById("file-input"),
  cameraButton: document.getElementById("camera-button"),
  uploadButton: document.getElementById("upload-button"),
  preview: document.getElementById("preview"),
  placeholder: document.getElementById("placeholder"),
  mainWord: document.getElementById("main-word"),
  translation: document.getElementById("translation"),
  confidence: document.getElementById("confidence"),
  status: document.getElementById("status"),
  labels: document.getElementById("labels"),
  speakButton: document.getElementById("speak-button"),
};

// Simple noun vocabulary and mapping rules.
// We map from MobileNet class names (e.g. "cellular telephone, cellular phone, cellphone, cell, mobile phone")
// to our simple English nouns like "phone".
const VOCAB = [
  { en: "phone", rohingya: "[phone Rohingya here]" },
  { en: "cup", rohingya: "[cup Rohingya here]" },
  { en: "chair", rohingya: "[chair Rohingya here]" },
  { en: "table", rohingya: "[table Rohingya here]" },
  { en: "bottle", rohingya: "[bottle Rohingya here]" },
  { en: "shoe", rohingya: "[shoe Rohingya here]" },
  { en: "bag", rohingya: "[bag Rohingya here]" },
  { en: "book", rohingya: "[book Rohingya here]" },
  { en: "fork", rohingya: "[fork Rohingya here]" },
  { en: "spoon", rohingya: "[spoon Rohingya here]" },
  { en: "knife", rohingya: "[knife Rohingya here]" },
  { en: "ball", rohingya: "[ball Rohingya here]" },
  { en: "car", rohingya: "[car Rohingya here]" },
  { en: "bus", rohingya: "[bus Rohingya here]" },
  { en: "laptop", rohingya: "[laptop Rohingya here]" },
  { en: "keyboard", rohingya: "[keyboard Rohingya here]" },
  { en: "mouse", rohingya: "[mouse Rohingya here]" },
  { en: "glasses", rohingya: "[glasses Rohingya here]" },
  { en: "watch", rohingya: "[watch Rohingya here]" },
  { en: "bowl", rohingya: "[bowl Rohingya here]" },
];

// Keywords we look for inside ImageNet class names to map into our simple VOCAB.
// Each entry: { keyword: "phone", target: "phone" } etc.
const KEYWORD_RULES = [
  { keyword: "cellular telephone", target: "phone" },
  { keyword: "cellular phone", target: "phone" },
  { keyword: "cellphone", target: "phone" },
  { keyword: "mobile phone", target: "phone" },
  { keyword: "phone", target: "phone" },
  { keyword: "cup", target: "cup" },
  { keyword: "mug", target: "cup" },
  { keyword: "teapot", target: "cup" },
  { keyword: "bottle", target: "bottle" },
  { keyword: "water bottle", target: "bottle" },
  { keyword: "wine bottle", target: "bottle" },
  { keyword: "chair", target: "chair" },
  { keyword: "table", target: "table" },
  { keyword: "desk", target: "table" },
  { keyword: "plate", target: "bowl" },
  { keyword: "bowl", target: "bowl" },
  { keyword: "fork", target: "fork" },
  { keyword: "spoon", target: "spoon" },
  { keyword: "knife", target: "knife" },
  { keyword: "ball", target: "ball" },
  { keyword: "football", target: "ball" },
  { keyword: "soccer ball", target: "ball" },
  { keyword: "basketball", target: "ball" },
  { keyword: "car", target: "car" },
  { keyword: "sports car", target: "car" },
  { keyword: "minivan", target: "car" },
  { keyword: "bus", target: "bus" },
  { keyword: "school bus", target: "bus" },
  { keyword: "backpack", target: "bag" },
  { keyword: "suitcase", target: "bag" },
  { keyword: "handbag", target: "bag" },
  { keyword: "laptop", target: "laptop" },
  { keyword: "notebook computer", target: "laptop" },
  { keyword: "keyboard", target: "keyboard" },
  { keyword: "computer keyboard", target: "keyboard" },
  { keyword: "mouse", target: "mouse" },
  { keyword: "computer mouse", target: "mouse" },
  { keyword: "sunglass", target: "glasses" },
  { keyword: "sunglasses", target: "glasses" },
  { keyword: "spectacles", target: "glasses" },
  { keyword: "glasses", target: "glasses" },
  { keyword: "watch", target: "watch" },
  { keyword: "analog clock", target: "watch" },
  { keyword: "shoe", target: "shoe" },
  { keyword: "sneaker", target: "shoe" },
  { keyword: "running shoe", target: "shoe" },
];

let model = null;
let modelReady = false;
let lastResult = null;

function setStatus(message) {
  elements.status.textContent = message;
}

function setConfidence(text, ok = false) {
  elements.confidence.textContent = text;
  elements.confidence.className = ok ? "badge" : "badge badge-secondary";
}

function speakWord(word) {
  if (!word) return;
  if (!("speechSynthesis" in window)) return;
  const utter = new SpeechSynthesisUtterance(word);
  utter.lang = "en-US";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

elements.speakButton.addEventListener("click", () => {
  if (lastResult && lastResult.simpleWord) {
    speakWord(lastResult.simpleWord);
  }
});

async function loadModelOnce() {
  if (modelReady) return;
  if (!window.mobilenet || !window.tf) {
    setStatus("Could not load TensorFlow model. Check your connection.");
    return;
  }
  setStatus("Loading vision model (one time)…");
  model = await mobilenet.load({ version: 2, alpha: 1.0 });
  modelReady = true;
  setStatus("Model loaded. Take a photo of one object.");
  setConfidence("Waiting for a photo…", false);
}

function mapToSimpleWord(mobilenetClassName) {
  const lc = mobilenetClassName.toLowerCase();

  // Look for the first keyword that appears in the class name.
  for (const rule of KEYWORD_RULES) {
    if (lc.includes(rule.keyword.toLowerCase())) {
      const vocabEntry = VOCAB.find((v) => v.en === rule.target);
      if (vocabEntry) {
        return vocabEntry;
      }
    }
  }

  // Fallback: try simple whole-word match on our vocab.
  for (const v of VOCAB) {
    if (lc.includes(v.en.toLowerCase())) {
      return v;
    }
  }

  return null;
}

function showLabels(predictions) {
  if (!predictions || !predictions.length) {
    elements.labels.style.display = "none";
    elements.labels.innerHTML = "";
    return;
  }
  const list = predictions
    .slice(0, 3)
    .map(
      (p) =>
        `<div class="label-item">${p.className}</div>`
    )
    .join("");
  elements.labels.innerHTML = `<div class="secondary-text" style="margin-bottom:4px;">Top model guesses:</div>${list}`;
  elements.labels.style.display = "block";
}

async function classifyCurrentImage() {
  if (!modelReady || !model) {
    await loadModelOnce();
    if (!modelReady) return;
  }

  if (!elements.preview.src) {
    return;
  }

  setStatus("Looking at the object…");
  setConfidence("Thinking…", false);

  try {
    const predictions = await model.classify(elements.preview);
    if (!predictions || predictions.length === 0) {
      setStatus("I could not see any clear object.");
      setConfidence("No prediction", false);
      elements.mainWord.textContent = "—";
      elements.translation.textContent = "Try taking another photo, closer to one object.";
      elements.speakButton.disabled = true;
      showLabels(null);
      lastResult = null;
      return;
    }

    showLabels(predictions);

    const top = predictions[0];
    const simple = mapToSimpleWord(top.className) || {
      en: top.className.split(",")[0],
      rohingya: "",
    };

    lastResult = {
      simpleWord: simple.en,
      rohingya: simple.rohingya,
      rawClass: top.className,
      probability: top.probability,
    };

    elements.mainWord.textContent = simple.en.toUpperCase();
    elements.translation.textContent = simple.rohingya || "[add Rohingya translation here]";
    const reasonable = top.probability >= 0.6;
    setConfidence(
      reasonable ? "This looks like that object." : "We are not very sure yet.",
      reasonable
    );
    setStatus("If this is correct, tap “Say it”. If not, try another photo a bit closer.");
    elements.speakButton.disabled = false;
  } catch (err) {
    console.error("Classification error:", err);
    setStatus("Something went wrong while reading the photo.");
    setConfidence("Error", false);
    elements.speakButton.disabled = true;
  }
}

function onFileSelected(file) {
  if (!file) return;
  const url = URL.createObjectURL(file);
  elements.preview.src = url;
  elements.preview.onload = () => {
    elements.preview.style.display = "block";
    elements.placeholder.style.display = "none";
    classifyCurrentImage();
  };
}

elements.fileInput.addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  onFileSelected(file);
});

elements.cameraButton.addEventListener("click", () => {
  elements.fileInput.click();
});

elements.uploadButton.addEventListener("click", () => {
  // On many mobile browsers this will still open the same picker,
  // but it's nice to label it separately.
  elements.fileInput.click();
});

window.addEventListener("load", () => {
  // Lazy-load the model in the background.
  loadModelOnce();
});

