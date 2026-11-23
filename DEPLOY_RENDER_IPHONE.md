# Запуск Render: «Фанты для двоих»

1. Через Render используется бесплатный Web Service, у него HTTPS и адрес `https://fanty-telegram-bot.onrender.com`.
2. Через Render Environment задаются `BOT_TOKEN` и `DATABASE_URL`, без вставки секретов в GitHub.
3. Для базы Neon или Render PostgreSQL схема создаётся автоматически. Render Free Postgres действует 30 дней.
4. `WEBHOOK_MODE=true` заменяет polling на Telegram webhook; /telegram/webhook доступен только с правильным заголовком Telegram secret token.
5. Проверка `GET /health`, затем `/start`, 18+, `easy`, команды покупки.
6. Платные Stars на Render Free нельзя считать надёжными из-за перехода сервиса в спящий режим, pre_checkout требует ответа за 10 секунд.
7. В BotFather Menu Button задайте https://fanty-telegram-bot.onrender.com
