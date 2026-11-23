"""Запасной путь покупки через WebApp.sendData (только reply keyboard)."""
import json
import logging

from aiogram import Bot, F, Router
from aiogram.types import Message
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from bot.config import Settings
from bot.payments_service import PurchaseNotAllowed, send_level_invoice

router = Router(name="webapp_data")
logger = logging.getLogger(__name__)


@router.message(F.web_app_data)
async def handle_webapp_data(message: Message, bot: Bot, settings: Settings,
                             session_factory: async_sessionmaker[AsyncSession]):
    if not message.from_user or message.chat.type != "private" or not message.web_app_data:
        return
    try:
        payload = json.loads(message.web_app_data.data)
        if not isinstance(payload, dict) or payload.get("action") != "buy":
            raise ValueError("Некорректное действие")
        level = payload.get("level")
        if level not in ("medium", "hard"):
            raise ValueError("Некорректный уровень")
        await send_level_invoice(bot, settings, session_factory, message.from_user.id, level)
    except (ValueError, json.JSONDecodeError):
        await message.answer("Некорректный запрос покупки.")
    except PurchaseNotAllowed as exc:
        await message.answer(str(exc))
    except Exception:
        logger.exception("Ошибка приёма WebAppData")
        await message.answer("Не удалось выставить счёт. Попробуйте /buy_medium или /buy_hard.")
