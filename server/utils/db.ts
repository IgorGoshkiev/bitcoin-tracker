import pg from 'pg';
const { Pool } = pg;
import { useRuntimeConfig } from '#imports'

const config = useRuntimeConfig()

export const dbPool = new Pool({
  user: config.dbUser,
  host: config.dbHost || 'db',
  database: config.dbName,
  password: config.dbPassword,
  port: config.dbPort || 5432,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
})

export async function populateHistoricalData() {
  try {
    console.log('⌛ Loading historical BTC data...')
    
    // Fallback тестовые данные
    const fallbackData = [
      [Date.now() - 86400000, 42000],
      [Date.now() - 172800000, 43000],
      [Date.now() - 259200000, 44000]
    ]

    // Пытаемся получить данные с API только если есть ключ
    let apiData = fallbackData
    if (config.coingeckoApiKey) {
      try {
        const response = await $fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart', {
          params: {
            vs_currency: 'usd',
            days: '30',
            interval: 'daily'
          },
          headers: {
            'x-cg-demo-api-key': String(config.coingeckoApiKey)
          },
          timeout: 10000
        })
        apiData = response?.prices || fallbackData
      } catch (e) {
        console.error('API request failed, using fallback:', e)
      }
    }

    // Формируем batch-запрос
    const batch = apiData
      .map(([timestamp, price]) => 
        `('${new Date(timestamp).toISOString()}', ${price})`
      )
      .join(',')

    await dbPool.query(`
      INSERT INTO bitcoin_prices (date, price)
      VALUES ${batch}
      ON CONFLICT (date) DO NOTHING
    `)

    console.log('✅ Data loaded successfully')
  } catch (error) {
    console.error('❌ Database initialization error:', error)
  }
}

// Инициализация БД
setTimeout(async () => {
  try {
    const { rows } = await dbPool.query('SELECT COUNT(*) as count FROM bitcoin_prices')
    if (parseInt(rows[0].count) === 0) {
      await populateHistoricalData()
    }
  } catch (err) {
    console.error('⚠️ Database check failed:', err)
  }
}, 5000)