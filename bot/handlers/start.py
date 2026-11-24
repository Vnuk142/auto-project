"""Возрастное согласие: 18+ с повторным запросом через 24 часа."""
import logging
from datetime import timedelta

from aiogram import F, Router
from aiogram.filters import Command, CommandStart
from aiogram.types import CallbackQuery, Message, ReplyKeyboardRemove
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from bot.config import Settings
from bot.db import User, get_or_create_user, utcnow
from bot.keyboards import age_keyboard, game_keyboard, game_inline_keyboard

logger = logging.getLogger(__name__)
router = Router(name="start")


@router.message(CommandStart())
async def start(message: Message, session_factory: async_sessionmaker[AsyncSession], settings: Settings):
    if message.chat.type != "private" or not message.from_user:
        await message.answer("Откройте личный чат с ботом.")
        return
    try:
        async with session_factory() as session:
            user = await get_or_create_user(session, message.from_user.id, message.from_user.username)
            confirmed = bool(user.age_confirmed_at)
            declined = user.age_declined_at
            await session.commit()
    except Exception:
        logger.exception("База данных недоступна при /start")
        await message.answer("Временная ошибка сервера. Попробуйте позже.")
        return

    if confirmed:
        greeting = ("Ваш аккаунт: все уровни бесплатны! 🎲"
                    if message.from_user.id in settings.free_user_id_set
                    else "Игра доступна. Удачного вечера!")
        await message.answer(greeting, reply_markup=game_keyboard())
        await message.answer("Открыть защищённую Mini App:", reply_markup=game_inline_keyboard(settings.webapp_url))
    elif declined and utcnow() - declined < timedelta(hours=24):
        await message.answer(
            "Доступ закрыт. Возвращайтесь, когда вам исполнится 18. "
            "Повторное подтверждение доступно не раньше чем через 24 часа.",
            reply_markup=ReplyKeyboardRemove(),
        )
    else:
        await message.answer(
            "🔞 «Фанты для двоих» — игра только для совершеннолетних.\n"
            "Продолжайте только добровольно и по взаимному согласию.\n\n"
            "Подтвердите, что вам уже исполнилось 18 лет:",
            reply_markup=age_keyboard(),
        )


@router.callback_query(F.data.in_({"age_confirm", "age_decline"}))
async def age_decision(call: CallbackQuery, session_factory: async_sessionmaker[AsyncSession], settings: Settings):
    if not call.from_user or not call.message:
        await call.answer("Откройте личный чат с ботом", show_alert=True)
        return
    decision = call.data
    try:
        async with session_factory() as session:
            user = await get_or_create_user(session, call.from_user.id, call.from_user.username)
            if user.age_confirmed_at is not None:
                await session.commit()
                await call.answer("Возраст уже подтверждён")
                await call.message.answer("Игра доступна.", reply_markup=game_keyboard())
                await call.message.answer("Открыть Mini App:", reply_markup=game_inline_keyboard(settings.webapp_url))
                return
            if user.age_declined_at and utcnow() - user.age_declined_at < timedelta(hours=24):
                await session.commit()
                await call.answer("Повторите запрос спустя 24 часа", show_alert=True)
                return
            if decision == "age_confirm":
                user.age_confirmed_at = utcnow()
                user.age_declined_at = None
            else:
                user.age_declined_at = utcnow()
            await session.commit()
    except Exception:
        logger.exception("Ошибка записи подтверждения возраста")
        await call.answer("Ошибка сервера. Попробуйте позже", show_alert=True)
        return

    await call.answer()
    try:
        await call.message.edit_reply_markup(reply_markup=None)
    except Exception:
        logger.info("Не удалось убрать старую inline-клавиатуру")
    if decision == "age_confirm":
        await call.message.answer("✅ Возраст подтверждён. Открывайте игру!", reply_markup=game_keyboard())
        await call.message.answer("Открыть Mini App:", reply_markup=game_inline_keyboard(settings.webapp_url))
    else:
        await call.message.answer(
            "Доступ закрыт. Возвращайтесь, когда вам исполнится 18.",
            reply_markup=ReplyKeyboardRemove(),
        )


@router.message(Command("myid"))
async def myid(message: Message):
    if message.from_user:
        await message.answer(f"Ваш Telegram user_id: {message.from_user.id}")


@router.message(F.text == "🎲 Открыть игру")
async def open_from_reply(message: Message, session_factory: async_sessionmaker[AsyncSession], settings: Settings):
    """Reply-кнопка открывает inline WebApp с подписанным Telegram initData."""
    if message.chat.type != "private" or not message.from_user:
        return
    try:
        async with session_factory() as session:
            user = await session.get(User, message.from_user.id)
            confirmed = bool(user and user.age_confirmed_at)
    except Exception:
        logger.exception("Ошибка проверки возраста при открытии")
        await message.answer("Временная ошибка сервера. Попробуйте позже.")
        return
    if not confirmed:
        await message.answer("Сначала подтвердите возраст командой /start.", reply_markup=ReplyKeyboardRemove())
        return
    await message.answer("Нажмите кнопку для запуска:", reply_markup=game_inline_keyboard(settings.webapp_url))
