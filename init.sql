CREATE TABLE IF NOT EXISTS bitcoin_prices (
  id SERIAL PRIMARY KEY,
  price DECIMAL NOT NULL,
  date TIMESTAMP UNIQUE,  -- Уникальный индекс для предотвращения дублей
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Время создания записи
);