## English drawing game for Rohingya learners

This is a very small web app prototype for a hackathon project: a drawing game to help Rohingya refugees learn basic English nouns.

### What it does

- Shows a simple English noun (e.g. "hammer", "phone", "glasses").
- Lets the learner draw the object on a canvas.
- Uses a pre-trained sketch recognition model (TensorFlow.js compatible) **or** any image-recognition API you configure to decide if the drawing matches the target word.
- If correct, shows a green thumbs-up and moves to the next word.
- If the learner taps **"I don't know"**, shows a reference picture and the word (plus optional Rohingya translation/audio).

### Quick start

1. Install a simple static server (or use any you like):

   ```bash
   npm install -g serve
   ```

2. From the project root, run:

   ```bash
   serve web
   ```

3. Open the printed URL in your browser (typically `http://localhost:3000` or similar).

### Integrating a sketch model

The frontend expects a TensorFlow.js model to be available at `web/models/model.json` (you can change this in `web/app.js`).

You can:

- Use any Quick Draw / doodle classifier converted to TensorFlow.js format (e.g. from public GitHub repos based on Google's Quick, Draw! dataset).
- Or replace the `recognizeDrawing` function in `web/app.js` to call a cloud vision API instead.

Because this is a hackathon prototype, the default implementation in `web/app.js` includes:

- A simple, pluggable `recognizeDrawing` function with clear TODO markers where you pipe your model or API in.
- Fallback behavior so the UI still works even before you plug a real model in.

