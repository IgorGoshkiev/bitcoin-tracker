import { defineEventHandler } from 'h3';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: 'user',
  host: 'db', // Имя сервиса в Docker Compose
  database: 'bitcoin',
  password: 'user',
  port: 5432,
});

export default defineEventHandler(async (event) => {
  const { period, startDate, endDate } = getQuery(event);

  let query = 'SELECT * FROM bitcoin_prices';

  if (period === 'custom' && startDate && endDate) {
    query += ` WHERE date BETWEEN '${startDate}' AND '${endDate}'`;
  } else {
    const intervals = {
      day: '1 DAY',
      week: '1 WEEK',
      month: '1 MONTH',
      year: '1 YEAR',
    };
    query += ` WHERE date >= NOW() - INTERVAL '${intervals[period]}'`;
  }

  const result = await pool.query(query);
  const labels = result.rows.map((row) => row.date);
  const prices = result.rows.map((row) => row.price);

  return { labels, prices };
});