# FLUE — Learn English Through Pictures

**FLUE** is a visual and oral-first English language learning app designed for Rohingya learners. It teaches practical, survival-level English phrases through a multi-sensory, mobile-first experience that combines drawing, listening, speaking, and real-world video role-play — without requiring literacy in any language.

--- 

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Learning Flow](#learning-flow)
- [Scenarios & Vocabulary](#scenarios--vocabulary)
- [Technical Deep Dive](#technical-deep-dive)
- [Design System](#design-system)

---

## Overview

Rohingya refugees often need to communicate in English in high-stakes real-world situations — clinics, bus stops, schools, workplaces. Traditional text-based language apps are inaccessible to people with low literacy. FLUE takes a different approach:

- **No reading required** to start learning
- Rohingya translations provided in both romanized and Arabic script
- Words are learned through drawing (visual memory), listening (audio), and speaking (speech recognition)
- Real-world scenarios are practiced through video dialogues
- LLM-powered evaluation for both speech and drawing — not just rule-based matching

---

## Key Features

### 6-Step Learning Progression
Each vocabulary topic takes the learner through a structured sequence:

| Step | Name | What Happens |
|------|------|--------------|
| 1 | **Word** | Introduced to the English word with audio + Rohingya translation |
| 2 | **Draw** | Draws the word on a canvas; LLM vision model checks if it matches |
| 3 | **Phrase** | Word expands into a useful phrase; learner listens and repeats |
| 4 | **Pattern** | Fill-in-the-blank grammar exercise with 3 multiple-choice options |
| 5 | **Sentence** | Full sentence in real-world context; learner speaks it aloud |
| 6 | **Situation** | Video role-play: watch a prompt, speak a response, see the answer |

### LLM-Powered Speech Evaluation
- After speech recognition captures text, an LLM judges whether the response is correct
- **Semantic matching**: "I need the doctor" passes even though it differs from "I need a doctor"
- Short, encouraging feedback returned when incorrect (e.g. "Missing the word 'doctor'")
- Rule-based fallback if the API is unavailable
- `evaluating` state shown with ⏳ while waiting for LLM response
- Powered by OpenRouter (`google/gemma-3-4b-it:free` by default)

### LLM-Powered Drawing Recognition
- Canvas exported as PNG → sent to a vision-capable LLM
- Prompt instructs the model to be lenient — rough sketches and stick figures pass
- Feedback shown on the result overlay (pass or fail)
- Graceful fallback if network is unavailable
- Uses the same OpenRouter model (Gemma 3 is multimodal)

### Drawing Canvas
- Full-featured HTML5 canvas with color picker (black / red / blue), eraser, clear, and brush size slider
- High-DPI rendering (respects `devicePixelRatio`)
- Smooth strokes with rounded line caps and joins

### Video Dialogue (Situation Step)
- Plays a prompt video (a character asks a question)
- User speaks their response; real-time transcript shown
- Plays answer video if correct; retry option if wrong
- `onError` handler: if video file is missing, automatically advances to next phase
- Demo skip button for testing

### Navigation
- **Horizontal swipe / arrow keys**: Move between the 6 learning steps
- **Vertical swipe / arrow keys**: Cycle through vocabulary topics
- Reels-style infinite scroll feel on mobile
- Step progress indicators and completion checkmarks

### Text-to-Speech
- English: prioritizes Google US English, Microsoft Neural voices, then macOS Samantha
- Rohingya: prioritizes South Asian–accented voices (Woodrow, Microsoft Ravi/Heera, macOS Lekha/Rishi) for more natural romanized phonetics
- Dual-speed audio playback: normal + 🐢 half-speed

### Onboarding
- First-time popup explaining the swipe-based navigation
- Auto-dismisses; can be re-triggered

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3.4 |
| Animations | Framer Motion 11 |
| Speech Input | Web Speech Recognition API |
| Speech Output | Web Speech Synthesis API |
| Drawing | HTML5 Canvas API |
| LLM Evaluation | OpenRouter API (speech + vision) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Chromium-based browser (Chrome, Edge) for full Web Speech API support
- An [OpenRouter](https://openrouter.ai) API key

### Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_OPENROUTER_API_KEY` | Your OpenRouter API key |
| `NEXT_PUBLIC_OR_MODEL` | Model for speech eval (default: `google/gemma-3-4b-it:free`) |

> The drawing recognition reuses `NEXT_PUBLIC_OR_MODEL` since Gemma 3 is multimodal.

### Installation

```bash
git clone <repo-url>
cd draw-to-speak
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## Project Structure

```
draw-to-speak/
├── public/
│   └── videos/                      # Video assets for role-play scenarios
│       ├── doctor-prompt.mov
│       ├── doctor-answer.mov
│       ├── bus-prompt.mov
│       └── bus-answer.mov
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Welcome / landing page
│   │   ├── learn/page.tsx           # Main learning interface
│   │   ├── lesson/[topic]/page.tsx  # Dynamic lesson routes
│   │   ├── topics/page.tsx          # Topics listing
│   │   ├── layout.tsx               # Root layout with metadata
│   │   └── globals.css              # Global styles
│   ├── components/
│   │   ├── AppLayout.tsx            # Mobile-optimized max-width wrapper
│   │   ├── DrawingCanvas.tsx        # Canvas + toolbar + LLM drawing eval
│   │   ├── WordCard.tsx             # Vocabulary introduction card
│   │   ├── PhraseCard.tsx           # Phrase expansion card
│   │   ├── PatternBuilder.tsx       # Fill-in-the-blank exercise
│   │   ├── SentenceCard.tsx         # Full sentence practice
│   │   ├── VideoDialogue.tsx        # Video role-play component
│   │   ├── SpeakAndCheck.tsx        # Reusable speech recognition widget
│   │   ├── AudioButton.tsx          # Dual-speed audio playback
│   │   ├── MicrophoneButton.tsx     # State-driven mic button (idle/listening/evaluating)
│   │   ├── FlueLogo.tsx             # App branding
│   │   ├── OnboardingPopup.tsx      # First-time user overlay
│   │   └── LessonProgress.tsx       # Progress tracker
│   ├── data/
│   │   ├── scenarios.ts             # 10 learning scenarios with all content
│   │   └── vocabulary.ts            # 17 vocabulary items
│   └── lib/
│       ├── useSpeechRecognition.ts  # Custom speech recognition hook
│       ├── speak.ts                 # Text-to-speech (English + Rohingya voices)
│       ├── llmEval.ts               # LLM-based speech evaluation via OpenRouter
│       └── drawingRecognition.ts    # LLM vision-based drawing recognition
├── .env.local.example
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Learning Flow

### Step 1 — Word
The learner sees a reference emoji and the English word. Audio plays automatically. A Rohingya translation is shown in both romanized text and Arabic script. The learner must speak the word; an LLM judges the response (threshold guide: 0.5 similarity).

### Step 2 — Draw
The learner draws the word on a canvas to build a visual memory anchor. Tools: color picker, eraser, clear, brush size slider. When done, the canvas PNG is sent to an LLM vision model which checks whether the drawing resembles the target word. Rough sketches pass — the goal is engagement, not artistry.

### Step 3 — Phrase
The word animates into a useful phrase (e.g., `doctor` → `need doctor`). Audio available at normal and half speed (🐢). Rohingya translation shown. LLM evaluates the spoken phrase.

### Step 4 — Pattern
A fill-in-the-blank template (e.g., `I need ___`) with 3 choices. Selecting an option plays its audio. The learner speaks the completed sentence; LLM evaluates.

### Step 5 — Sentence
The full sentence is shown with scenario context (e.g., `🏥 Clinic`). The learner speaks it aloud. LLM evaluates with stricter intent matching.

### Step 6 — Situation (Video Dialogue)
1. **Prompt phase**: Video character asks a question. Missing video auto-skips to speak phase.
2. **Speak phase**: Learner speaks into mic; real-time interim transcript shown. Tap "Done ✓" to submit.
3. **Answer phase**: Correct → answer video plays. Wrong → encouraging retry screen with target sentence shown.

---

## Scenarios & Vocabulary

### 10 Learning Scenarios

| Scenario | Key Sentence | Context |
|----------|-------------|---------|
| Doctor | "I need a doctor." | 🏥 Clinic |
| Bus | "Where is the bus stop?" | 🛣️ Street |
| School | "My child is sick." | 📋 School Office |
| Grocery | "I need food." | 🏪 Store |
| Work | "I work at a store." | 🤝 Interview |
| Money | "I have no money." | 🏪 Market |
| House | "I need a house." | 🏠 Shelter |
| Police | "Please call the police." | 🚨 Emergency |
| Name | "My name is Ali." | 📋 Registration |
| Sick | "I feel sick." | 🏥 Clinic |

### 17 Vocabulary Items
doctor, bus, school, water, food, child, book, phone, bag, work, teacher, help, money, house, police, name, sick

---

## Technical Deep Dive

### LLM Speech Evaluation (`llmEval.ts`)
- Sends `targetText` + `spokenText` to OpenRouter chat completion
- Prompt instructs the model to be lenient on articles, word order, filler words
- Parses `{"correct": bool, "feedback": string}` from the response
- If JSON parsing fails or network errors occur, falls back to word-level similarity scoring
- `RecognitionState` includes `'evaluating'` to show loading UI during async call

### LLM Drawing Recognition (`drawingRecognition.ts`)
- Exports canvas as `image/png` via `canvas.toDataURL()`
- Sends base64 image + word prompt to OpenRouter vision API
- Model: reuses `NEXT_PUBLIC_OR_MODEL` (Gemma 3 supports multimodal input)
- Returns `{"correct": bool, "feedback": string}`
- On any error: returns `correct: false` with an error message (no silent auto-pass)

### Speech Recognition (`useSpeechRecognition.ts`)
- Uses `webkitSpeechRecognition` or `SpeechRecognition`
- `isSupported` initialized via `useEffect` to avoid SSR hydration mismatch
- Continuous interim results for live transcript
- Timeout: requires 600ms+ input before accepting
- Three states: `idle` | `listening` | `evaluating`

### Text-to-Speech (`speak.ts`)
**English voice priority:**
1. Google US English
2. Microsoft Aria / Jenny / Guy (Neural)
3. Samantha / Karen / Daniel (macOS)
4. Any en-US voice

**Rohingya voice priority** (South Asian phonetics suit romanized Rohingya):
1. Woodrow
2. Microsoft Ravi / Heera (Indian English)
3. Google हिन्दी
4. Lekha / Rishi (macOS Indian English)
5. Falls back to English voice

Speech rates: `0.85x` for English, `0.9x` for Rohingya.

### Drawing Canvas (`DrawingCanvas.tsx`)
- High-DPI canvas scaled by `window.devicePixelRatio`
- Smooth strokes: `lineJoin: round`, `lineCap: round`
- Eraser is 3× the current brush width
- Brush size: 2–20px

### Gesture & Navigation
- Minimum swipe distance: 45px, minimum velocity: 250px/s
- Direction lock: first dominant axis determines horizontal vs. vertical
- Keyboard: ←/→ for steps, ↑/↓ for topics

### Animations (Framer Motion)
- Card transitions: 420px directional slide
- Duration: 0.32s tween
- Mic button: red pulse while listening, gray pulse while evaluating

---

## Design System

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#2E7D5E` | Buttons, active states, progress |
| `primary-light` | `#E8F5EE` | Card backgrounds, highlights |
| `accent` | `#F4A261` | Warnings, slow-speech button |
| `soft` | `#F8F9FA` | Page backgrounds |

### Layout
- Max width: **428px** (mobile-first, single-column)
- Full viewport height, portrait orientation
- No horizontal scrolling

### Typography
- System font stack via Tailwind defaults
- Rohingya Arabic script rendered right-to-left

---

## Hackathon Context

FLUE was built as a hackathon project targeting English language accessibility for Rohingya refugees. Design decisions prioritize:

1. **Literacy-independence**: Audio-first, visual-first — no reading required to begin
2. **Mobile accessibility**: Works on low-end Android phones in portrait mode
3. **Encouraging UX**: Wrong answers show "Let's learn this! 📖" rather than failure states
4. **LLM-augmented evaluation**: Semantic speech matching and vision-based drawing checks replace brittle rule-based systems
5. **Culturally grounded scenarios**: Phrases chosen for real survival needs — medical, transport, shelter, emergency, identity

---

## License

Private — hackathon project.
