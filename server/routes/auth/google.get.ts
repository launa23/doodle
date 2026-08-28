export default defineOAuthGoogleEventHandler({
  config: {
    redirectURL: process.env.NUXT_OAUTH_GOOGLE_REDIRECT_URL || undefined,
  },
  async onSuccess(event, { user }) {
    await setUserSession(event, {
      user: {
        provider: 'google',
        id: user.sub,
        name: user.name,
        email: user.email,
        avatar: user.picture,
        url: '',
      },
    })

    return sendRedirect(event, '/draw')
  },
})
