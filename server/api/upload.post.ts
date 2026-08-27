import { blob, ensureBlob } from 'hub:blob'

export default eventHandler(async (event) => {
  // Make sure the user is authenticated to upload
  const { user } = await requireUserSession(event)

  // Check last image author
  const { blobs } = await blob.list({
    prefix: 'drawings/',
    limit: 1,
  })
  if (!import.meta.dev && blobs.length) {
    const [lastDrawing] = blobs
    if (lastDrawing.customMetadata?.userId === user.id) {
      throw createError({
        statusCode: 400,
        message: 'You cannot upload two drawings in a row. Please wait for someone else to draw an image.',
      })
    }
  }

  // useUpload send a formData
  const form = await readFormData(event)
  const drawing = form.get('drawing') as File
  const drawingArrayBuffer = await drawing.arrayBuffer()

  ensureBlob(drawing, {
    maxSize: '1MB',
    types: ['image/jpeg'],
  })

  // Describe drawing and generate AI image using Agnes AI helpers
  const base64Image = `data:image/jpeg;base64,${Buffer.from(drawingArrayBuffer).toString('base64')}`
  const description = await describeDrawing(base64Image)

  if (description.toLowerCase().includes('penis')) {
    throw createError({
      statusCode: 400,
      message: 'You cannot upload this kind of drawings.',
    })
  }

  // Create a new pathname to be smaller than the last one uploaded
  // So the blob listing will send the last uploaded image at first
  // We use the timestamp in 2050 minus the current timestamp
  // So this project will start to be buggy in 2050, sorry for that
  const name = `${new Date('2050-01-01').getTime() - Date.now()}`

  // Generate an image with Agnes AI
  let aiImage = null
  const imageUrl = await generateAgnesImage(base64Image, description)
  if (imageUrl) {
    const imageArrayBuffer = await $fetch<ArrayBuffer>(imageUrl, { responseType: 'arrayBuffer' }).catch(() => null)
    if (imageArrayBuffer) {
      aiImage = await blob.put(`${name}.jpg`, new Uint8Array(imageArrayBuffer), {
        prefix: 'ai/',
        addRandomSuffix: true,
        contentType: 'image/jpeg',
      })
    }
  }

  console.log('blob put', `${name}.jpg`, drawing)
  return blob.put(`${name}.jpg`, drawing, {
    prefix: 'drawings/',
    addRandomSuffix: true,
    customMetadata: {
      userProvider: user.provider,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      userUrl: user.url,
      description,
      aiImage: aiImage ? aiImage.pathname : '',
      aiImageUrl: aiImage?.customMetadata?.url || '',
    },
  })

})
