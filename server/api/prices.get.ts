import { dbPool } from '../utils/db'

export default defineEventHandler(async (event) => {
  const { period, startDate, endDate } = getQuery(event)
  
  try {
    let query = 'SELECT date, price FROM bitcoin_prices'
    const params = []

    if (period === 'custom' && startDate && endDate) {
      query += ' WHERE date BETWEEN $1 AND $2'
      params.push(
        new Date(startDate as string).toISOString(),
        new Date(endDate as string).toISOString()
      )
    } else {
      const intervals: Record<string, string> = {
        day: '1 DAY',
        week: '1 WEEK',
        month: '1 MONTH',
        year: '1 YEAR'
      }
      
      if (intervals[period as string]) {
        query += ` WHERE date >= NOW() - INTERVAL '${intervals[period as string]}'`
      } else {
        query += ' ORDER BY date DESC LIMIT 100'
      }
    }

    const { rows } = await dbPool.query(query, params)
    
    if (!rows.length) {
      return { labels: [], prices: [] }
    }

    return {
      labels: rows.map(row => new Date(row.date).toLocaleDateString()),
      prices: rows.map(row => Number(row.price))
    }
  } catch (error) {
    console.error('Database error:', error)
    return { labels: [], prices: [] }
  }
})