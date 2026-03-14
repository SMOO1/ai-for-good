/**
 * Sends a canvas drawing to OpenRouter vision API and checks
 * whether it matches the given English word.
 *
 * Uses google/gemini-flash-1.5 by default — fast and cheap vision model.
 * Change VITE_OR_MODEL in .env.local to override.
 *
 * Requires VITE_OPENROUTER_API_KEY in .env.local
 */
export async function checkDrawing(dataURL, word) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('Missing VITE_OPENROUTER_API_KEY in .env.local')
  }

  const model = import.meta.env.VITE_OR_MODEL || 'google/gemini-1.5-flash'

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 120,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: dataURL },
            },
            {
              type: 'text',
              text: `A child drew this picture trying to draw "${word}".
Does this drawing look like "${word}"?
Answer with YES or NO on the first line, then one short encouraging sentence (max 12 words).`,
            },
          ],
        },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `API error ${res.status}`)
  }

  const data = await res.json()
  const text = (data.choices?.[0]?.message?.content ?? '').trim()
  const passed = text.toUpperCase().startsWith('YES')
  const lines = text.split('\n').filter(Boolean)
  const message = lines.slice(1).join(' ') || (passed ? 'Great job!' : 'Nice try!')

  return { passed, message }
}
