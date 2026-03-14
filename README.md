# Rohingya Words

A mobile-first language learning app for Rohingya refugee children, built for the **AI for Good Hackathon**. Children learn vocabulary in both English and Rohingya through flashcards, drawing, and quizzes — with AI-powered feedback.

---

## What It Does

Rohingya is a language spoken by over a million refugees, primarily in Bangladesh and Southeast Asia. Many Rohingya children are growing up in camps with limited access to formal education. This app provides an engaging, visual, and interactive way to learn everyday vocabulary in both English and Rohingya — helping bridge the language gap and support literacy in both languages simultaneously.

The app contains **238 words** across **10 categories** and works entirely in the browser with no installation required.

---

## Features

### 📖 Learn
Flashcard-based vocabulary learning with a 3D flip animation.
- Browse words by category or all at once
- Card front shows the English word and emoji
- Flip to reveal Rohingya script (Arabic-based), romanized pronunciation, and a 🔊 **Listen** button (Web Speech API TTS)
- Progress bar tracks position within the word list
- **Draw this word** button jumps directly to the Draw tab for practice

### 🎨 Draw
Draw vocabulary words freehand on a canvas and get AI feedback.
- Filter by category — only see words from a specific group
- The word is shown as text only (no emoji hint) to encourage genuine recall
- **Progressive hints**: tap once for a black silhouette 🖤, tap again to reveal the color emoji 🍎
- Prev / Next navigation to skip words
- Submit your drawing → an AI vision model checks whether it matches the word
  - ✅ **Pass**: the emoji is revealed with an encouraging message, option to save to Gallery
  - ❌ **Fail**: feedback message, option to try again or move on
- Drawings saved to the Gallery are persistent across sessions

### 🖼️ Gallery
A personal collection of saved drawings.
- 2-column grid of thumbnail images
- Each thumbnail shows the English word and Rohingya script label
- Tap to open a fullscreen lightbox
- Delete individual drawings with the ✕ button

### ⭐ Quiz
Multiple-choice vocabulary quiz — Rohingya → English direction.
- Shown: large Arabic-script Rohingya word + romanized pronunciation
- Task: pick the correct English meaning from 4 options (each with emoji)
- Filter by category to focus on a specific topic
- Green highlight for correct, red for wrong
- TTS reads the answer aloud after each question
- Score tracker (✓ correct / ✗ wrong) persists across sessions
- 🎉 Celebration overlay every 5 correct answers

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite |
| Styling | Vanilla CSS with custom properties (no UI library) |
| Drawing | HTML5 Canvas API with HiDPI (`devicePixelRatio`) scaling |
| TTS | Web Speech API (`window.speechSynthesis`) |
| AI Vision | [OpenRouter](https://openrouter.ai) — any vision-capable model |
| Persistence | `localStorage` (gallery, word index, quiz score) |
| Font | Noto Nastaliq Urdu (Google Fonts) for Rohingya script rendering |

---

## AI Drawing Checker

When a child submits a drawing, the app sends the canvas image (PNG, base64) to an AI vision model via OpenRouter. The model answers:

> *"A child drew this picture trying to draw 'apple'. Does this drawing look like 'apple'? Answer YES or NO, then one short encouraging sentence."*

The response drives the pass/fail UI. The default model is `google/gemini-1.5-flash`, but any vision model on OpenRouter works.

---

## Getting Started

### Prerequisites
- Node.js 18+
- An [OpenRouter](https://openrouter.ai) API key (free tier available)

### Install

```bash
git clone https://github.com/SMOO1/ai-for-good.git
cd ai-for-good
npm install
```

### Configure

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
VITE_OPENROUTER_API_KEY=sk-or-...

# Optional: override the vision model (default: google/gemini-1.5-flash)
# VITE_OR_MODEL=google/gemini-2.0-flash-exp:free
```

### Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

> **Note:** The Learn, Quiz, and Gallery tabs work without an API key. The drawing checker (Draw tab → Check button) requires `VITE_OPENROUTER_API_KEY`.

---

## Project Structure

```
src/
├── components/
│   ├── LearnTab.jsx      # Flashcard with flip animation
│   ├── DrawTab.jsx       # Canvas drawing + AI check
│   ├── GalleryTab.jsx    # Saved drawings grid + lightbox
│   ├── QuizTab.jsx       # Multiple-choice quiz
│   └── NavTabs.jsx       # Bottom navigation bar
├── hooks/
│   ├── useDrawing.js     # Canvas state (color, brush, strokes, HiDPI)
│   └── useTTS.js         # Web Speech API wrapper
├── utils/
│   └── checkDrawing.js   # OpenRouter API call for drawing validation
├── data/
│   └── words.js          # 238 words with en, roh, arabic, emoji, cat fields
├── App.jsx               # Root component, global state, localStorage
└── App.css               # All styles (CSS custom properties, mobile-first)
```

---

## Word Data Format

```js
{ en: "apple", roh: "sép", arabic: "سیپ", emoji: "🍎", cat: "food" }
```

| Field | Description |
|-------|-------------|
| `en` | English word |
| `roh` | Romanized Rohingya pronunciation |
| `arabic` | Rohingya written in Arabic script |
| `emoji` | Representative emoji |
| `cat` | Category (`food`, `animals`, `nature`, `family`, `colors`, `actions`, `places`, `body`, `numbers`, `feelings`) |

---

## Recommended Free Vision Models (OpenRouter)

| Model ID | Notes |
|----------|-------|
| `google/gemini-2.0-flash-exp:free` | Fast, good accuracy |
| `mistralai/mistral-small-3.1-24b-instruct:free` | Reliable vision support |
| `nvidia/nemotron-nano-12b-v2-vl:free` | Lightweight vision-language model |

Free models have rate limits. For production use, add a small OpenRouter credit balance.

---

## Built With ❤️ for the AI for Good Hackathon
