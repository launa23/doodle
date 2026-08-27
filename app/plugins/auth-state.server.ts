export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig(useRequestEvent())

  const googleClientId = config.oauth?.google?.clientId || process.env.NUXT_OAUTH_GOOGLE_CLIENT_ID
  const googleClientSecret = config.oauth?.google?.clientSecret || process.env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET
  const githubClientId = config.oauth?.github?.clientId || process.env.NUXT_OAUTH_GITHUB_CLIENT_ID
  const githubClientSecret = config.oauth?.github?.clientSecret || process.env.NUXT_OAUTH_GITHUB_CLIENT_SECRET

  // Expose the auth providers to the client
  useState('authProviders', () => {
    return {
      google: Boolean(googleClientId && googleClientSecret),
      github: Boolean(githubClientId && githubClientSecret),
    }
  })
})
