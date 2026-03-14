const API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
// gemma-3-4b-it is multimodal — reuse the same model as text eval
const VISION_MODEL =
  process.env.NEXT_PUBLIC_OR_MODEL ?? 'google/gemma-3-4b-it:free'

export interface DrawingEvalResult {
  correct: boolean
  feedback: string
}

export async function evalDrawing(
  canvasDataUrl: string,
  word: string
): Promise<DrawingEvalResult> {
  if (!API_KEY) {
    console.error('[drawingRecognition] NEXT_PUBLIC_OPENROUTER_API_KEY is not set')
    return { correct: false, feedback: 'API key missing.' }
  }

  const prompt = `This is a simple drawing made by an English language learner. They were asked to draw: "${word}".

Does this drawing resemble a "${word}"? Be lenient — rough sketches and stick figures count.

Reply ONLY with JSON, nothing else. Example: {"correct": true, "feedback": "Looks like a ${word}!"}
Keep feedback under 8 words.`

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: VISION_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: canvasDataUrl } },
              { type: 'text', text: prompt },
            ],
          },
        ],
        max_tokens: 80,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('[drawingRecognition] API error:', data)
      return { correct: false, feedback: 'Could not check drawing.' }
    }

    const text: string = data.choices?.[0]?.message?.content ?? ''
    console.log('[drawingRecognition] raw response:', text)

    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      const parsed = JSON.parse(match[0])
      return {
        correct: !!parsed.correct,
        feedback: parsed.feedback ?? '',
      }
    }

    console.warn('[drawingRecognition] could not parse JSON from:', text)
    return { correct: false, feedback: 'Try drawing again.' }
  } catch (err) {
    console.error('[drawingRecognition] fetch error:', err)
    return { correct: false, feedback: 'Network error. Try again.' }
  }
}
