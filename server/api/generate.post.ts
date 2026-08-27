/**
 * Generate a new image based on the drawing using AI
 * Used in the `<AIDraw />` component.
 * Uncomment it in pages/draw.vue to enable the AI description feature.
 */
export default eventHandler(async (event) => {
  await requireUserSession(event)

  // Get the drawing and convert it to a array buffer
  const form = await readFormData(event)
  const drawing = form.get('drawing') as File
  const drawingArrayBuffer = await drawing.arrayBuffer()

  // Describe drawing and generate AI image using Agnes AI helpers
  const base64Image = `data:image/jpeg;base64,${Buffer.from(drawingArrayBuffer).toString('base64')}`
  const description = await describeDrawing(base64Image)
  setHeader(event, 'x-description', description)

  const imageUrl = await generateAgnesImage(base64Image, description)
  if (!imageUrl) {
    throw createError({
      statusCode: 500,
      message: 'Failed to generate image with Agnes AI',
    })
  }

  const imageBuffer = await $fetch<ArrayBuffer>(imageUrl, { responseType: 'arrayBuffer' })
  setHeader(event, 'content-type', 'image/jpeg')
  return new Uint8Array(imageBuffer)
})

