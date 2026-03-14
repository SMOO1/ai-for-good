const API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
const MODEL = process.env.NEXT_PUBLIC_OR_MODEL ?? 'google/gemma-3-4b-it:free'

export interface LLMEvalResult {
  correct: boolean
  feedback: string
}

export async function evalWithLLM(target: string, spoken: string): Promise<LLMEvalResult> {
  if (!API_KEY) {
    console.warn('NEXT_PUBLIC_OPENROUTER_API_KEY not set, falling back to rule-based eval')
    return fallback(target, spoken)
  }

  const prompt = `You are evaluating an English language learner's spoken response. Be lenient with minor errors like missing or wrong articles (a/the), slight word order differences, or filler words.

Target: "${target}"
Learner said: "${spoken}"

Reply ONLY with JSON. Example: {"correct": true, "feedback": "Great job!"}
If wrong, give a short hint. Keep feedback under 10 words.`

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 80,
      }),
    })

    if (!res.ok) return fallback(target, spoken)

    const data = await res.json()
    const text: string = data.choices?.[0]?.message?.content ?? ''

    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      const parsed = JSON.parse(match[0])
      return {
        correct: !!parsed.correct,
        feedback: parsed.feedback ?? '',
      }
    }
  } catch {
    // network error or parse failure — fall through to rule-based
  }

  return fallback(target, spoken)
}

// Rule-based fallback (original logic)
function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim()
}

function fallback(target: string, spoken: string): LLMEvalResult {
  const a = normalize(target).split(' ')
  const b = normalize(spoken).split(' ')
  const minLen = Math.min(a.length, b.length)
  let matches = 0
  for (let i = 0; i < minLen; i++) {
    if (a[i] === b[i]) matches++
  }
  const ratio = a.length ? matches / a.length : 0
  return { correct: ratio >= 0.5, feedback: '' }
}
