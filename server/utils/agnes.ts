function getAgnesConfig() {
  const config = useRuntimeConfig()
  const baseUrl = config.agnesAi?.baseUrl || process.env.AGNES_AI_BASE_URL || 'https://apihub.agnes-ai.com/v1'
  const apiKey = config.agnesAi?.apiKey || process.env.AGNES_AI_API_KEY || ''
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

function getRandomArtStyle(): string {
  const styles = [
    'Japanese anime animation style with vibrant colors and expressive character lighting',
    '3D Pixar-style digital animation render with soft volumetric lighting and cute textures',
    'Studio Ghibli watercolor digital painting style with whimsical atmosphere and rich natural background',
    'Vibrant cyberpunk sci-fi digital art with glowing neon highlights and futuristic atmosphere',
    'Classic comic book pop-art illustration with vivid colors and expressive shading',
    'Rich oil painting artwork on canvas with visible brushstrokes and dramatic lighting',
    'Retro 80s fantasy digital art with rich colorful gradients and dreamy atmosphere',
    'Charming storybook fantasy illustration with hand-painted textures and warm lighting',
    'Modern vector concept art style with sleek shapes, bold palettes, and clean shading',
  ]
  return styles[Math.floor(Math.random() * styles.length)]
}

export async function generateAgnesImage(base64Image: string, description?: string): Promise<string | null> {
  const { baseUrl, apiKey } = getAgnesConfig()
  const randomStyle = getRandomArtStyle()

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
        prompt: `Completely re-imagine, transform, and redraw the subject and composition from this crude sketch into a complete standalone artwork rendered in ${randomStyle}. Creatively interpret any abstract or simple doodle lines as a full subject with detailed body, background, and environment. Do NOT simply copy, trace, or overlay the original black marker lines or add just a background; fully transform the drawing into a rich, finished masterpiece in this style.`,
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
