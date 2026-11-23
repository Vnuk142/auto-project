"""aiohttp API: HMAC initData, проверка прав, безопасная выдача заданий."""
import logging
from pathlib import Path

from aiohttp import web
from aiogram import Bot
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from sqlalchemy.exc import SQLAlchemyError

from bot.config import Settings
from bot.db import User, unlocked_levels
from bot.payments_service import PurchaseNotAllowed, send_level_invoice
from bot.security import validate_init_data
from bot.tasks import TASKS

logger = logging.getLogger(__name__)
WEB_DIR = Path(__file__).resolve().parent.parent / "web"


@web.middleware
async def api_error_middleware(request: web.Request, handler):
    try:
        return await handler(request)
    except web.HTTPException as exc:
        if request.path.startswith("/api/"):
            return web.json_response({"error": exc.text}, status=exc.status)
        raise
    except SQLAlchemyError:
        logger.exception("Ошибка PostgreSQL при обработке %s", request.path)
        return web.json_response({"error": "Database temporarily unavailable"}, status=503)
    except Exception:
        logger.exception("Необработанная ошибка API: %s", request.path)
        return web.json_response({"error": "Internal server error"}, status=500)


@web.middleware
async def cors_middleware(request: web.Request, handler):
    settings: Settings = request.app["settings"]
    origin = request.headers.get("Origin")
    if origin and origin != settings.origin:
        raise web.HTTPForbidden(text="Origin not allowed")
    if request.method == "OPTIONS":
        response = web.Response(status=204)
    else:
        response = await handler(request)
    if origin:
        response.headers["Access-Control-Allow-Origin"] = settings.origin
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        response.headers["Vary"] = "Origin"
    if request.path.startswith("/api/"):
        response.headers["Cache-Control"] = "no-store"
    return response


async def json_body(request: web.Request) -> dict:
    try:
        body = await request.json()
    except (ValueError, UnicodeDecodeError):
        raise web.HTTPBadRequest(text="Invalid JSON") from None
    if not isinstance(body, dict):
        raise web.HTTPBadRequest(text="Body must be a JSON object")
    return body


async def auth_context(request: web.Request) -> tuple[dict, User | None]:
    data = await json_body(request)
    raw = data.get("initData")
    settings: Settings = request.app["settings"]
    validated = validate_init_data(raw, settings.bot_token, settings.max_init_data_age_seconds)
    if validated is None:
        raise web.HTTPUnauthorized(text="Invalid or expired Telegram initData")
    user_id = validated["user"]["id"]
    async with request.app["session_factory"]() as session:
        user = await session.get(User, user_id)
    return data, user


async def health(_: web.Request):
    return web.json_response({"status": "ok"})


async def index(_: web.Request):
    return web.FileResponse(WEB_DIR / "index.html", headers={"Cache-Control": "no-store"})


async def me(request: web.Request):
    _, user = await auth_context(request)
    if not user or not user.age_confirmed_at:
        raise web.HTTPForbidden(text="Confirm 18+ with /start")
    async with request.app["session_factory"]() as session:
        levels = await unlocked_levels(session, user)
    return web.json_response({"user_id": user.user_id, "levels": levels, "prices": request.app["settings"].prices})


async def tasks(request: web.Request):
    body, user = await auth_context(request)
    if not user or not user.age_confirmed_at:
        raise web.HTTPForbidden(text="18+ confirmation required")
    level = body.get("level")
    if not isinstance(level, str) or level not in TASKS:
        raise web.HTTPBadRequest(text="Unknown level")
    async with request.app["session_factory"]() as session:
        levels = await unlocked_levels(session, user)
    if not levels[level]:
        raise web.HTTPForbidden(text="Level is locked")
    return web.json_response({"level": level, "tasks": TASKS[level]})


async def buy(request: web.Request):
    body, user = await auth_context(request)
    if not user or not user.age_confirmed_at:
        raise web.HTTPForbidden(text="18+ confirmation required")
    level = body.get("level")
    if level not in ("medium", "hard"):
        raise web.HTTPBadRequest(text="Only paid levels can be purchased")
    try:
        await send_level_invoice(
            request.app["bot"], request.app["settings"],
            request.app["session_factory"], user.user_id, level,
        )
        return web.json_response({"status": "invoice_sent"})
    except PurchaseNotAllowed as exc:
        raise web.HTTPConflict(text=str(exc)) from exc
    except Exception:
        logger.exception("Ошибка отправки Stars-инвойса через HTTP")
        raise web.HTTPBadGateway(text="Invoice delivery failed") from None


async def options(_: web.Request):
    return web.Response(status=204)


def create_app(settings: Settings, bot: Bot, session_factory: async_sessionmaker[AsyncSession]) -> web.Application:
    app = web.Application(middlewares=[cors_middleware, api_error_middleware], client_max_size=16 * 1024)
    app["settings"] = settings
    app["bot"] = bot
    app["session_factory"] = session_factory
    app.router.add_get("/health", health)
    app.router.add_get("/", index)
    app.router.add_post("/api/me", me)
    app.router.add_post("/api/tasks", tasks)
    app.router.add_post("/api/buy", buy)
    app.router.add_options("/api/me", options)
    app.router.add_options("/api/tasks", options)
    app.router.add_options("/api/buy", options)
    app.router.add_static("/static", WEB_DIR, show_index=False)
    return app
