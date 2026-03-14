# Draw to Link 🎨

"Draw to Link" is a mobile-first visual vocabulary-learning tool designed specifically for Rohingya refugees with low or no literacy. 

## 🌟 Core Idea
Instead of traditional text-heavy language study, "Draw to Link" helps users connect hand-drawn pictures to spoken English vocabulary through a simple, tap-and-voice experience. 

The updated flow emphasizes **visual adaptation**: 
1. The user is shown a target word with audio.
2. The user draws the object on a large, spacious canvas.
3. The app gently checks the drawing.
4. The user receives visual reinforcement (a reference illustration) and audio playback, with zero harsh "wrong answer" penalties.

## 🎯 Target User
- Rohingya refugees in Bangladesh.
- Users who may have limited literacy in any script (Hanifi Rohingya, Arabic, or Latin).
- Users who rely heavily on visual and auditory cues.
- Unfamiliar with complex apps; needs big buttons and tap-first design.

## 🚀 MVP Scope & Flow
- **Prompt**: Displays a clear English word and high-quality audio prompt.
- **Draw**: A very large canvas dominating the mobile screen for easy drawing.
- **Recognize/Evaluate**: Simulated gentle evaluation logic.
- **Link & Learn**: Connects the drawing to a clean reference image and positive audio feedback.
- **Practice**: Simple replay loops to encourage familiarity over testing.

## 🛠️ Technical Stack
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (Mobile-first design)
- **Framer Motion** (Smooth transitions and animations)
- **Lucide React** (Accessible icons)
- **Web Speech API** (Mock audio synthesis)

## 🎨 Design Principles
- **Minimal Text**: UI is driven by icons and audio ("Draw this", "Next", "Listen").
- **Canvas-Focused**: The drawing area is intentionally large to prevent cramped interactions.
- **Calm & Friendly**: Soft colors, supportive feedback, no red "X" marks.
- **Fast Loop**: The core "prompt -> draw -> check -> reference" loop takes under 1 minute.

## 🔮 Future Directions
- **Offline Mode**: Essential for refugee camp environments with unstable internet.
- **On-device AI**: Real image recognition using TensorFlow.js or similar lightweight models.
- **Localized Audio**: Support for Rohingya audio explanations.
- **Progress Syncing**: Minimalist syncing for group learning environments without complex accounts.

---

Built with ❤️ for the AI for Good hackathon. Focus on one excellent loop.
