import { defineEventHandler } from 'h3';
import axios from 'axios';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: 'user',
  host: 'db', // Имя сервиса в Docker Compose
  database: 'bitcoin',
  password: 'user',
  port: 5432,
});

export default defineEventHandler(async () => {
  try {
    // Получаем текущую цену биткоина
    const response = await axios.get('https://api.coindesk.com/v1/bpi/currentprice.json');
    console.log('response', response)
    const price = response.data.bpi.USD.rate_float;
    console.log('price', price)

    // Сохраняем цену в базу данных
    await pool.query('INSERT INTO bitcoin_prices (price) VALUES ($1)', [price]);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});