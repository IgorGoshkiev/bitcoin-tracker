# Bitcoin Price Tracker

Приложение для отслеживания исторических цен на биткоин с графиком и выбором периода.

## Технологии
- Nuxt 3 (Vue 3)
- PostgreSQL
- Chart.js
- Docker

## Требования
- Docker (20.10+)
- Docker Compose (2.0+)

## Установка и запуск

1. Склонируйте репозиторий:
```bash
git clone https://github.com/ваш-репозиторий.git
cd bitcoin-tracker

2. создайте файл .env в корне проекта:
    # Настройки базы данных
    DB_USER=user
    DB_PASSWORD=user
    DB_NAME=bitcoin
    DB_HOST=db

    # Ключ CoinGecko API 
    COINGECKO_API_KEY=ваш_ключ

3. docker-compose up --build
4. Приложение будет доступно по адресу:
http://localhost:3000