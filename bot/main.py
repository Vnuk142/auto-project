"""Один процесс запускает aiogram polling и aiohttp HTTP-сервер."""
import asyncio
import logging
import os
import signal

from aiohttp import web
from aiogram import Bot, Dispatcher
from aiogram.exceptions import TelegramNetworkError, TelegramRetryAfter
from aiogram.webhook.aiohttp_server import SimpleRequestHandler, setup_application
from sqlalchemy.exc import SQLAlchemyError

from api.server import create_app
from bot.config import get_settings
from bot.db import Base, make_session_factory
from bot.handlers import payments, start, webapp_data

logger = logging.getLogger(__name__)


async def prepare_database(engine) -> None:
    for attempt in range(1, 31):
        try:
            async with engine.begin() as connection:
                await connection.run_sync(Base.metadata.create_all)
            logger.info("Схема PostgreSQL готова")
            return
        except (SQLAlchemyError, OSError):
            logger.warning("База не готова (попытка %s/30)", attempt)
            if attempt == 30:
                raise
            await asyncio.sleep(2)


async def start_setup_server() -> None:
    """Публичная страница готовности, пока секреты не внесены в Render Environment.

    Здесь нет API игры или оплаты, и мы не имитируем рабочий Telegram-бот.
    После добавления BOT_TOKEN и DATABASE_URL обычная сборка стартует автоматически.
    """
    async def health(_):
        return web.json_response({"status": "setup_required"})

    async def index(_):
        return web.Response(
            text=(
                "<!doctype html><html lang='ru'><meta charset='utf-8'>"
                "<meta name='viewport' content='width=device-width,initial-scale=1'>"
                "<title>Фанты для двоих — настройка</title>"
                "<body style='background:#1a1a1a;color:white;font:18px sans-serif;"
                "max-width:520px;margin:60px auto;padding:16px'>"
                "<h1>Фанты для двоих</h1>"
                "<p>Сервер подключён к Render. Игра ожидает настройки "
                "Telegram-бота и базы данных.</p>"
                "</body></html>"
            ),
            content_type="text/html",
        )

    app = web.Application()
    app.router.add_get("/health", health)
    app.router.add_get("/", index)
    runner = web.AppRunner(app, access_log=None)
    await runner.setup()
    port = int(os.getenv("PORT", "10000"))
    await web.TCPSite(runner, host="0.0.0.0", port=port).start()
    missing = [name for name in ("BOT_TOKEN", "DATABASE_URL") if not os.getenv(name)]
    logger.warning("Настройка не завершена. Отсутствуют переменные: %s", ", ".join(missing))
    stop_event = asyncio.Event()
    loop = asyncio.get_running_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        try:
            loop.add_signal_handler(sig, stop_event.set)
        except NotImplementedError:
            pass
    try:
        await stop_event.wait()
    finally:
        await runner.cleanup()


async def main() -> None:
    if not os.getenv("BOT_TOKEN") or not os.getenv("DATABASE_URL"):
        await start_setup_server()
        return
    settings = get_settings()
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    engine, session_factory = make_session_factory(settings.database_url)
    await prepare_database(engine)
    bot = Bot(token=settings.bot_token)
    dispatcher = Dispatcher()
    dispatcher.include_router(start.router)
    dispatcher.include_router(payments.router)
    dispatcher.include_router(webapp_data.router)

    app = create_app(settings, bot, session_factory)
    telegram_status = {
        "bot_id": bot.id,
        "username": None,
        "webhook": "pending" if settings.webhook_mode else "polling",
        "attempt": 0,
        "last_method": None,
        "retry_after_seconds": None,
    }

    async def ops_status(_: web.Request) -> web.Response:
        # Только публичная техническая информация, без токенов и паролей.
        return web.json_response(telegram_status, headers={"Cache-Control": "no-store"})

    app.router.add_get("/ops", ops_status)

    async def probe_outbound_network() -> None:
        """Один раз проверяем сеть без токенов, чтобы отличить 429 от блокировки egress."""
        from aiohttp import ClientSession, ClientTimeout
        async with ClientSession(timeout=ClientTimeout(total=7)) as client:
            for label, url in (
                ("telegram_root", "https://api.telegram.org/"),
                ("internet_control", "https://example.com/"),
            ):
                try:
                    async with client.get(url, allow_redirects=False) as reply:
                        state = f"HTTP {reply.status}"
                except Exception as exc:
                    state = type(exc).__name__
                telegram_status[label] = state
                logger.info("Сетевая проверка %s: %s", label, state)

    app["outbound_probe_task"] = asyncio.create_task(probe_outbound_network())

    if settings.webhook_mode:
        # Оставляем запрос webhook открытым до обработки платежа и pre_checkout.
        SimpleRequestHandler(
            dispatcher=dispatcher, bot=bot,
            secret_token=settings.webhook_secret,
            handle_in_background=False,
            settings=settings,
            session_factory=session_factory,
        ).register(app, path="/telegram/webhook")
        setup_application(app, dispatcher, bot=bot)
    runner = web.AppRunner(app, access_log=None)
    await runner.setup()
    port = int(os.getenv("PORT", str(settings.api_port)))
    site = web.TCPSite(runner, host="0.0.0.0", port=port)
    stop_event = asyncio.Event()
    loop = asyncio.get_running_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        try:
            loop.add_signal_handler(sig, stop_event.set)
        except NotImplementedError:
            pass

    polling_task: asyncio.Task | None = None
    try:
        await site.start()
        logger.info("HTTP запущен на :%s", port)
        if settings.webhook_mode:
            # Один контрольный запрос показывает, к какому боту относится токен.
            # Не блокируем сервер, если Telegram временно ограничивает Bot API.
            try:
                me = await asyncio.wait_for(bot.get_me(), timeout=12)
                telegram_status["username"] = me.username
                logger.info("Telegram-бот по токену: @%s (ID %s)", me.username, me.id)
            except Exception as exc:
                logger.warning("Проверка имени Telegram-бота: %s", type(exc).__name__)

            # Ограничение SetWebhook у Telegram (429) нельзя лечить перезапуском
            # контейнера: при повторном старте лимит только продлевается.
            webhook_url = f"{settings.webapp_url}/telegram/webhook"
            attempt = 0
            while not stop_event.is_set():
                attempt += 1
                telegram_status["attempt"] = attempt
                method = "getWebhookInfo"
                telegram_status["last_method"] = method
                try:
                    # Если webhook уже зарегистрирован, повторно SetWebhook не вызываем:
                    # Telegram может отвечать 429 на каждом старте Render.
                    current = await bot.get_webhook_info()
                    if current.url == webhook_url:
                        telegram_status.update(webhook="registered", retry_after_seconds=None)
                        logger.info(
                            "Webhook уже установлен: %s (ожидают: %s)",
                            current.url, current.pending_update_count,
                        )
                        break
                    logger.info(
                        "Текущий Telegram webhook: %s (ожидают: %s)",
                        current.url or "<пусто>", current.pending_update_count,
                    )
                    method = "setWebhook"
                    telegram_status["last_method"] = method
                    await bot.set_webhook(
                        url=webhook_url,
                        secret_token=settings.webhook_secret,
                        allowed_updates=dispatcher.resolve_used_update_types(),
                        drop_pending_updates=False,
                    )
                    telegram_status.update(webhook="registered", retry_after_seconds=None)
                    logger.info("Webhook Telegram зарегистрирован: %s", webhook_url)
                    break
                except TelegramRetryAfter as exc:
                    # 429 может приходить даже на GetWebhookInfo. Увеличиваем
                    # паузу, чтобы не продлевать блокировку частыми запросами.
                    delay = max(int(exc.retry_after) + 2, min(600, 60 * (2 ** min(attempt - 1, 4))))
                    telegram_status.update(webhook="rate_limited", last_method=method, retry_after_seconds=delay)
                    logger.warning(
                        "Telegram 429 для %s; повтор через %s сек. Попытка %s",
                        method, delay, attempt,
                    )
                    try:
                        await asyncio.wait_for(stop_event.wait(), timeout=delay)
                    except asyncio.TimeoutError:
                        continue
                except (TelegramNetworkError, OSError) as exc:
                    delay = min(60, 2 ** min(attempt, 6))
                    telegram_status.update(webhook="network_error", last_method=method, retry_after_seconds=delay)
                    logger.warning(
                        "Сеть Telegram временно недоступна (%s); повтор через %s сек.",
                        type(exc).__name__, delay,
                    )
                    try:
                        await asyncio.wait_for(stop_event.wait(), timeout=delay)
                    except asyncio.TimeoutError:
                        continue
            await stop_event.wait()
        else:
            await bot.delete_webhook(drop_pending_updates=False)
            polling_task = asyncio.create_task(dispatcher.start_polling(
                bot, settings=settings, session_factory=session_factory,
                handle_signals=False, close_bot_session=False,
            ))
            stop_task = asyncio.create_task(stop_event.wait())
            done, _ = await asyncio.wait({polling_task, stop_task}, return_when=asyncio.FIRST_COMPLETED)
            if polling_task in done:
                await polling_task
            stop_task.cancel()
    finally:
        if polling_task and not polling_task.done():
            polling_task.cancel()
            await asyncio.gather(polling_task, return_exceptions=True)
        await runner.cleanup()
        await bot.session.close()
        await engine.dispose()
        logger.info("Сервис остановлен")


if __name__ == "__main__":
    asyncio.run(main())
