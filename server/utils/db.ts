import pg from 'pg';
const { Pool } = pg;

// Конфигурация тестовых данных (теперь это единственный источник правды)
export const TEST_DATA = [
  { daysAgo: 1, price: 42000 },
  { daysAgo: 2, price: 43000 },
  { daysAgo: 3, price: 44000 },
  { daysAgo: 4, price: 45000 },
  { daysAgo: 5, price: 46000 }
];

export const dbPool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || 'db',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  max: 10,
  idleTimeoutMillis: 30000
});

export async function populateTestData() {
  try {
    await dbPool.query('BEGIN');
    
    for (const item of TEST_DATA) {
      const timestamp = new Date(Date.now() - item.daysAgo * 86400000).toISOString();
      await dbPool.query(
        `INSERT INTO bitcoin_prices (date, price) 
         VALUES ($1, $2) 
         ON CONFLICT (date) DO NOTHING`,
        [timestamp, item.price]
      );
    }

    await dbPool.query('COMMIT');
    console.log('Test data loaded into database');
  } catch (error) {
    await dbPool.query('ROLLBACK');
    console.error('Database seeding failed:', error);
    throw error; // Пробрасываем ошибку дальше
  }
}

// Инициализация БД
async function initializeDatabase() {
  try {
    const { rows } = await dbPool.query(`
      SELECT COUNT(*) as count FROM bitcoin_prices
    `);
      
    if (parseInt(rows[0].count) === 0) {
      console.log('Initializing database with test data...');
      await populateTestData();
    }
  } catch (err) {
    console.error('Database initialization failed:', err);
  }
}

// Даем PostgreSQL 5 секунд на запуск
setTimeout(initializeDatabase, 5000);