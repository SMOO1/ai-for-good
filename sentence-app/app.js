// Sentence repetition game using the browser's SpeechRecognition (Web Speech API).
// No server or cloud calls – everything stays in the browser.

const SENTENCES = [
  {
    id: "apple_red",
    text: "This apple is red.",
    focusWord: "apple",
  },
  {
    id: "phone_new",
    text: "This phone is new.",
    focusWord: "phone",
  },
  {
    id: "chair_big",
    text: "This chair is big.",
    focusWord: "chair",
  },
  {
    id: "cup_full",
    text: "This cup is full.",
    focusWord: "cup",
  },
  {
    id: "book_long",
    text: "This book is long.",
    focusWord: "book",
  },
];

const elements = {
  sentenceText: document.getElementById("sentence-text"),
  roundLabel: document.getElementById("round-label"),
  playButton: document.getElementById("play-button"),
  micButton: document.getElementById("mic-button"),
  nextButton: document.getElementById("next-button"),
  feedback: document.getElementById("feedback"),
  transcriptBox: document.getElementById("transcript-box"),
  scoreCount: document.getElementById("score-count"),
  scoreText: document.getElementById("score-text"),
};

const state = {
  index: 0,
  listening: false,
  score: 0,
  history: [], // { id, correct, transcript }
  listenStartedAt: 0,
  lastResultHandled: false,
};

let recognition = null;
let recognitionSupported = false;

function initSpeechRecognition() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition || null;
  if (!SpeechRecognition) {
    recognitionSupported = false;
    elements.micButton.disabled = true;
    setFeedbackMuted(
      "Your browser does not support microphone speech recognition. Try Chrome on desktop or Android."
    );
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  // Keep the mic open a bit longer and wait for a clear final result.
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 3;

  recognition.onstart = () => {
    state.listening = true;
    state.listenStartedAt = Date.now();
    state.lastResultHandled = false;
    // #region agent log
    fetch('http://127.0.0.1:7909/ingest/1ac484f4-e130-4371-8cec-0a5c3bb8cac5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'748154'},body:JSON.stringify({sessionId:'748154',runId:'run1',hypothesisId:'H2',location:'sentence-app/app.js:onstart',message:'SpeechRecognition onstart',data:{listenStartedAt:state.listenStartedAt},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    elements.micButton.textContent = "Listening…";
    elements.micButton.disabled = true;
    setFeedbackMuted("Please say the sentence now.");
  };

  recognition.onend = () => {
    state.listening = false;
    const durationMs = Date.now() - (state.listenStartedAt || Date.now());
    // #region agent log
    fetch('http://127.0.0.1:7909/ingest/1ac484f4-e130-4371-8cec-0a5c3bb8cac5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'748154'},body:JSON.stringify({sessionId:'748154',runId:'run1',hypothesisId:'H2',location:'sentence-app/app.js:onend',message:'SpeechRecognition onend',data:{durationMs, lastResultHandled:state.lastResultHandled},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    // If we never got a usable result, just nudge them softly.
    if (!state.lastResultHandled) {
      setFeedbackMuted(
        "We did not hear a clear sentence. Tap the microphone and try again, a bit closer and a little louder."
      );
      elements.transcriptBox.textContent =
        "We did not catch that. Try again: speak right after the beep and say the whole sentence.";
      elements.nextButton.disabled = true;
    }
    elements.micButton.textContent = "Say it now";
    elements.micButton.disabled = false;
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event);
    // #region agent log
    fetch('http://127.0.0.1:7909/ingest/1ac484f4-e130-4371-8cec-0a5c3bb8cac5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'748154'},body:JSON.stringify({sessionId:'748154',runId:'run1',hypothesisId:'H1',location:'sentence-app/app.js:onerror',message:'SpeechRecognition onerror',data:{error:event.error || null, message:event.message || null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    setFeedbackMuted("We could not hear clearly. Please tap the microphone and try again.");
  };

  recognition.onresult = (event) => {
    state.lastResultHandled = true;
    // Use the last result block, and only when it's marked final.
    const resultIndex = event.results.length - 1;
    const result = event.results[resultIndex];
    if (!result.isFinal) {
      // Show partial text without judging yet.
      const partial = Array.from(result)
        .map((alt) => alt.transcript)
        .join(" ")
        .trim();
      if (partial) {
        elements.transcriptBox.textContent = partial;
      }
      // #region agent log
      fetch('http://127.0.0.1:7909/ingest/1ac484f4-e130-4371-8cec-0a5c3bb8cac5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'748154'},body:JSON.stringify({sessionId:'748154',runId:'run1',hypothesisId:'H3',location:'sentence-app/app.js:onresult',message:'Interim speech result',data:{partial},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return;
    }

    const results = Array.from(result).map((alt) => alt.transcript);
    const transcript = (results[0] || "").trim();

    const durationMs = Date.now() - (state.listenStartedAt || Date.now());
    const tooShort = durationMs < 600 || transcript.length < 3;

    if (tooShort) {
      elements.transcriptBox.textContent =
        "We did not catch that. Please try again, slowly and clearly.";
      // Do not mark this as a wrong attempt – just ask them to repeat.
      setFeedbackMuted("Try once more: listen, then say the sentence slowly.");
      elements.nextButton.disabled = true;
      // #region agent log
      fetch('http://127.0.0.1:7909/ingest/1ac484f4-e130-4371-8cec-0a5c3bb8cac5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'748154'},body:JSON.stringify({sessionId:'748154',runId:'run1',hypothesisId:'H2',location:'sentence-app/app.js:onresult',message:'Final result too short',data:{transcript,durationMs},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return;
    }

    elements.transcriptBox.textContent = transcript;
    // #region agent log
    fetch('http://127.0.0.1:7909/ingest/1ac484f4-e130-4371-8cec-0a5c3bb8cac5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'748154'},body:JSON.stringify({sessionId:'748154',runId:'run1',hypothesisId:'H4',location:'sentence-app/app.js:onresult',message:'Final speech result',data:{transcript,durationMs},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    checkTranscript(transcript, results);
    // Stop listening once we have a final sentence.
    try {
      recognition.stop();
    } catch (e) {
      // ignore
    }
  };

  recognitionSupported = true;
}

function currentSentence() {
  return SENTENCES[state.index % SENTENCES.length];
}

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sentencesSimilar(target, spoken) {
  const a = normalize(target).split(" ");
  const b = normalize(spoken).split(" ");
  if (!a.length || !b.length) return false;

  let matches = 0;
  const minLen = Math.min(a.length, b.length);
  for (let i = 0; i < minLen; i++) {
    if (a[i] === b[i]) matches += 1;
  }

  const ratio = matches / a.length;
  return {
    ratio,
    matches,
    targetLength: a.length,
    spokenLength: b.length,
  };
}

function wordPresent(word, spoken) {
  if (!word) return true;
  const w = normalize(word);
  const s = normalize(spoken);
  return s.split(" ").includes(w);
}

function setFeedbackExactSuccess() {
  elements.feedback.innerHTML = `
    <span class="pill-feedback pill-success">
      <span>✅</span>
      Great job! Correct.
    </span>
  `;
}

function setFeedbackCloseSuccess() {
  elements.feedback.innerHTML = `
    <span class="pill-feedback pill-success">
      <span>🌟</span>
      Nice job! That was very close.
    </span>
  `;
}

function setFeedbackError() {
  elements.feedback.innerHTML = `
    <span class="pill-feedback pill-error">
      <span>↻</span>
      Try again: listen once, then say it slowly.
    </span>
  `;
}

function setFeedbackMuted(message) {
  elements.feedback.textContent = message;
}

function updateScoreUI() {
  elements.scoreCount.textContent = String(state.score);
  elements.scoreText.textContent =
    state.score === 1 ? "Great sentence" : "Great sentences";
}

function renderSentence() {
  const sentence = currentSentence();
  elements.roundLabel.textContent = `Sentence ${state.index + 1}`;

  // Simple render with focus word highlighted.
  const parts = sentence.text.split(sentence.focusWord);
  if (parts.length === 2) {
    elements.sentenceText.innerHTML = `
      ${parts[0]}<span class="sentence-word">${sentence.focusWord}</span>${parts[1]}
    `;
  } else {
    elements.sentenceText.textContent = sentence.text;
  }

  setFeedbackMuted("Tap the speaker to hear it, then the microphone to say it.");
  elements.transcriptBox.textContent =
    "Tap the microphone and speak. We will show the words we heard.";
  elements.nextButton.disabled = true;
}

function playSentence() {
  const sentence = currentSentence();
  if (!("speechSynthesis" in window)) return;
  const utter = new SpeechSynthesisUtterance(sentence.text);
  utter.lang = "en-US";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

function checkTranscript(transcript, alternatives) {
  const sentence = currentSentence();
  const target = sentence.text;
  const spoken = transcript || "";

  const sim = sentencesSimilar(target, spoken);
  const okSentence = sim && sim.ratio >= 0.75;
  const exactSentence =
    sim && sim.ratio === 1 && sim.targetLength === sim.spokenLength;
  const okWord = wordPresent(sentence.focusWord, spoken);

  const correct = okSentence && okWord;
  state.history.push({
    id: sentence.id,
    correct,
    transcript: spoken,
  });

  if (correct) {
    state.score += 1;
    updateScoreUI();
    if (exactSentence) {
      setFeedbackExactSuccess();
    } else {
      setFeedbackCloseSuccess();
    }
    elements.nextButton.disabled = false;
  } else {
    setFeedbackError();
    elements.nextButton.disabled = true;
  }
}

function nextSentence() {
  state.index = (state.index + 1) % SENTENCES.length;
  renderSentence();
}

elements.playButton.addEventListener("click", () => {
  playSentence();
});

elements.micButton.addEventListener("click", () => {
  if (!recognitionSupported || !recognition) return;
  if (state.listening) return;
  // #region agent log
  fetch('http://127.0.0.1:7909/ingest/1ac484f4-e130-4371-8cec-0a5c3bb8cac5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'748154'},body:JSON.stringify({sessionId:'748154',runId:'run1',hypothesisId:'H1',location:'sentence-app/app.js:micClick',message:'Mic button clicked, starting recognition',data:{},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  try {
    recognition.start();
  } catch (e) {
    // #region agent log
    fetch('http://127.0.0.1:7909/ingest/1ac484f4-e130-4371-8cec-0a5c3bb8cac5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'748154'},body:JSON.stringify({sessionId:'748154',runId:'run1',hypothesisId:'H1',location:'sentence-app/app.js:micClick',message:'Error calling recognition.start',data:{name:e.name || null,message:e.message || null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }
});

elements.nextButton.addEventListener("click", () => {
  nextSentence();
});

window.addEventListener("load", () => {
  initSpeechRecognition();
  renderSentence();
  updateScoreUI();
});

