/**
 * Sends a canvas drawing to Claude vision API and checks
 * whether it matches the given English word.
 *
 * Uses claude-haiku-4-5 for fast, low-latency feedback — this is
 * a simple image classification task that needs real-time UX response.
 *
 * Requires VITE_ANTHROPIC_API_KEY in .env.local
 */
export async function checkDrawing(dataURL, word) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('Missing VITE_ANTHROPIC_API_KEY in .env.local')
  }

  const base64 = dataURL.split(',')[1]

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-request-from-browser': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 120,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/png', data: base64 },
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
  const text = (data.content?.[0]?.text ?? '').trim()
  const passed = text.toUpperCase().startsWith('YES')
  // Extract the encouraging sentence (second line or after YES/NO)
  const lines = text.split('\n').filter(Boolean)
  const message = lines.slice(1).join(' ') || (passed ? 'Great job!' : 'Nice try!')

  return { passed, message }
}
