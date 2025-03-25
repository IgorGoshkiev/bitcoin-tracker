export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  
  runtimeConfig: {
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
    dbHost: process.env.DB_HOST,
    dbName: process.env.DB_NAME,
    dbPort: process.env.DB_PORT || '5432',
    coingeckoApiKey: process.env.COINGECKO_API_KEY,
    public: {
      apiBase: '/api'
    }
  },

  app: {
    // Упрощаем настройку root элемента
    rootId: 'nuxt-app',
    rootTag: 'body',
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      // Добавляем обязательные теги
      htmlAttrs: {
        lang: 'en'
      },
      bodyAttrs: {
        class: 'min-h-screen bg-gray-50'
      }
    }
  },

  nitro: {
    hooks: {
      'close': async () => {
        const { dbPool } = await import('./server/utils/db')
        await dbPool.end()
      }
    },
    // Добавляем настройки для SSR
    preset: 'node-server'
  },

  // SSR настройки
  ssr: true,
  
  build: {
    transpile: [
      'chart.js',
      // Добавляем другие зависимости, если нужно
      '@vuepic/vue-datepicker'
    ],
    // Оптимизация сборки
    optimizeDeps: {
      include: ['chart.js/auto']
    }
  },

  vite: {
    define: {
      'process.env.DEBUG': false,
      // Добавляем глобальные переменные
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
    },
    // Оптимизация для chart.js
    optimizeDeps: {
      include: [
        'chart.js',
        'chart.js/auto'
      ]
    }
  },

  // Улучшенная настройка совместимости
  compatibility: {
    build: {
      // Отключаем проблемные трансформации
      template: false,
      renderer: false
    }
  },

  // Дополнительные настройки для работы с графиками
  experimental: {
    payloadExtraction: false,
    componentIslands: true,
    reactivityTransform: true
  },

  // Настройки sourcemap для отладки
  sourcemap: {
    server: true,
    client: true
  }
})