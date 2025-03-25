export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  ssr: true,
  routeRules: {
    '/': { prerender: true }
  },
  experimental: {
    payloadExtraction: false
  },

  runtimeConfig: {
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
    dbHost: process.env.DB_HOST,
    dbName: process.env.DB_NAME,
    dbPort: process.env.DB_PORT || 5432,
    coingeckoApiKey: process.env.COINGECKO_API_KEY,
    public: {
      apiBase: '/api'
    }
  },

  nitro: {
    hooks: {
      'close': async () => {
        const { dbPool } = await import('./server/utils/db')
        await dbPool.end()
      }
    }
  }
})