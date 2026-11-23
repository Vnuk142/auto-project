"""Единая функция выдачи счёта для чата, WebApp и API."""
import logging

from aiogram import Bot
from aiogram.exceptions import TelegramAPIError
from aiogram.types import LabeledPrice
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from bot.config import Settings
from bot.db import User, has_purchase

logger = logging.getLogger(__name__)
LEVEL_NAMES = {"medium": "Средний", "hard": "Смелый"}


class PurchaseNotAllowed(Exception):
    pass


async def send_level_invoice(
    bot: Bot,
    settings: Settings,
    session_factory: async_sessionmaker[AsyncSession],
    user_id: int,
    level: str,
) -> None:
    if level not in LEVEL_NAMES:
        raise PurchaseNotAllowed("Неизвестный платный уровень")
    async with session_factory() as session:
        user = await session.get(User, user_id)
        if not user or not user.age_confirmed_at:
            raise PurchaseNotAllowed("Сначала подтвердите 18+ командой /start")
        if await has_purchase(session, user_id, level):
            raise PurchaseNotAllowed("Этот уровень уже куплен")
    try:
        await bot.send_invoice(
            chat_id=user_id,
            title=f"Фанты для двоих — {LEVEL_NAMES[level]}",
            description="Постоянный доступ к уровню игры для совершеннолетних.",
            payload=f"level:{level}:{user_id}",
            currency="XTR",
            prices=[LabeledPrice(label=f"Уровень {LEVEL_NAMES[level]}", amount=settings.prices[level])],
            # Для XTR provider_token по текущей спецификации Bot API ОПУСКАЕТСЯ.
        )
        logger.info("Счёт отправлен: user=%s, level=%s", user_id, level)
    except TelegramAPIError:
        logger.exception("Не удалось отправить инвойс: user=%s level=%s", user_id, level)
        raise
