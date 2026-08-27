function getAgnesConfig() {
  const config = useRuntimeConfig()
  const baseUrl = config.agnesAi?.baseUrl || process.env.AGNES_AI_BASE_URL
  const apiKey = config.agnesAi?.apiKey || process.env.AGNES_AI_API_KEY
  return { baseUrl, apiKey }
}

export async function describeDrawing(base64Image: string): Promise<string> {
  const { baseUrl, apiKey } = getAgnesConfig()

  const agnesRes = await $fetch<{ choices?: Array<{ message?: { content?: string } }> }>(
    `${baseUrl}/chat/completions`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: {
        model: 'agnes-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Describe this drawing in one short simple sentence. Do not use markdown or bullet points.' },
              { type: 'image_url', image_url: { url: base64Image } },
            ],
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      },
    }
  ).catch((err) => {
    console.error('Agnes AI description error:', err)
    return null
  })

  const rawText = agnesRes?.choices?.[0]?.message?.content || ''
  return rawText.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim()
}

export async function generateAgnesImage(base64Image: string, description: string): Promise<string | null> {
  const { baseUrl, apiKey } = getAgnesConfig()

  const aiImageRes = await $fetch<{ data?: Array<{ url?: string, b64_json?: string }> }>(
    `${baseUrl}/images/generations`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: {
        model: 'agnes-image-2.1-flash',
        prompt: `Create a clean, highly-detailed, beautiful digital artwork based on this concept: ${description || 'a drawing'}. Fully replace all crude black sketch lines, marker strokes, and doodle outlines with realistic textures, smooth shading, and natural lighting. Do NOT retain, overlay, or draw any black marker lines or sketch strokes in the final artwork.`,
        size: '512x512',
        extra_body: {
          image: [base64Image],
          response_format: 'url',
        },
      },
    }
  ).catch((err) => {
    console.error('Agnes AI image generation error:', err)
    return null
  })

  return aiImageRes?.data?.[0]?.url || null
}
