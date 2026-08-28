// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxthub/core',
    '@nuxt/ui',
    '@nuxt/eslint',
    'nuxt-auth-utils',
  ],
  devtools: { enabled: true },
  css: ['~/assets/main.css'],
  routeRules: {
    '/drawings/**': { isr: true },
  },
  future: { compatibilityVersion: 4 },
  compatibilityDate: '2025-10-14',
  runtimeConfig: {
    session: {
      password: process.env.NUXT_SESSION_PASSWORD || '',
    },
    agnesAi: {
      baseUrl: process.env.AGNES_AI_BASE_URL || 'https://apihub.agnes-ai.com/v1',
      apiKey: process.env.AGNES_AI_API_KEY || '',
    },
    oauth: {
      google: {
        clientId: process.env.NUXT_OAUTH_GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET || '',
        redirectURL: process.env.NUXT_OAUTH_GOOGLE_REDIRECT_URL || undefined,
      },
      github: {
        clientId: process.env.NUXT_OAUTH_GITHUB_CLIENT_ID || '',
        clientSecret: process.env.NUXT_OAUTH_GITHUB_CLIENT_SECRET || '',
        redirectURL: process.env.NUXT_OAUTH_GITHUB_REDIRECT_URL || undefined,
      },
    },
    public: {
      adminEmail: process.env.NUXT_ADMIN_EMAIL || '',
    },
  },
  hub: {
    blob: true,
    ai: true,
  },
  // Development modules
  eslint: {
    config: {
      stylistic: {
        quotes: 'single',
      },
    },
  },
})
