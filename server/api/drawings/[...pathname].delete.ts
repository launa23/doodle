import { blob } from 'hub:blob'

export default eventHandler(async (event) => {
  // Require logged in user
  const { user } = await requireUserSession(event)

  // Get pathname parameter
  const pathname = getRouterParam(event, 'pathname')
  if (!pathname) {
    throw createError({
      statusCode: 400,
      message: 'Pathname parameter is required.',
    })
  }

  const fullPathname = pathname.startsWith('drawings/') ? pathname : `drawings/${pathname}`

  // Get blob head info to verify ownership and find AI image
  const blobInfo = await blob.head(fullPathname).catch(() => null)
  if (!blobInfo) {
    throw createError({
      statusCode: 404,
      message: 'Drawing not found.',
    })
  }

  // Check ownership (only the author can delete their drawing)
  const authorId = blobInfo.customMetadata?.userId || blobInfo.customMetadata?.userid || blobInfo.customMetadata?.user_id
  if (authorId && authorId !== user.id) {
    throw createError({
      statusCode: 403,
      message: 'You are not authorized to delete this drawing.',
    })
  }

  // Delete associated AI image if present
  const aiImage = blobInfo.customMetadata?.aiImage || blobInfo.customMetadata?.aiimage || blobInfo.customMetadata?.ai_image
  if (aiImage) {
    const aiPath = aiImage.startsWith('ai/') ? aiImage : `ai/${aiImage}`
    await blob.del(aiPath).catch(() => null)
  }

  // Delete main drawing blob
  await blob.del(fullPathname)

  return {
    success: true,
    message: 'Drawing deleted successfully.',
  }
})
