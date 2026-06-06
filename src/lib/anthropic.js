const SYSTEM_PROMPT = `You are the assistant for OMUAFC Dragons, a 7th grade youth football team in Auckland NZ. Coaches are Matt Thompson and Ben Thompson. Keep responses warm, encouraging, and suitable for kids and parents. NZ English. No markdown, plain paragraphs only.`

export async function generateText(userPrompt) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) return 'AI features require an Anthropic API key.'

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    console.error('Anthropic error:', err)
    return 'Unable to generate content right now.'
  }

  const data = await response.json()
  return data.content?.[0]?.text || 'No response generated.'
}
