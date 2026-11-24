"""Инвойсы, pre-checkout, идемпотентная фиксация платежей и возвраты."""
import asyncio
import logging
import re

from aiogram import Bot, F, Router
from aiogram.exceptions import TelegramAPIError
from aiogram.filters import Command, CommandObject
from aiogram.types import Message, PreCheckoutQuery
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from bot.config import Settings
from bot.db import Purchase, User, has_purchase, utcnow
from bot.payments_service import LEVEL_NAMES, PurchaseNotAllowed, send_level_invoice

logger = logging.getLogger(__name__)
router = Router(name="payments")
PAYLOAD = re.compile(r"^level:(medium|hard):([1-9][0-9]{0,18})$")


def parse_payload(raw: str) -> tuple[str, int] | None:
    match = PAYLOAD.fullmatch(raw)
    return (match.group(1), int(match.group(2))) if match else None


async def notify_admins(bot: Bot, settings: Settings, text: str) -> None:
    for admin_id in settings.admin_id_set:
        try:
            await bot.send_message(admin_id, text)
        except TelegramAPIError:
            logger.exception("Уведомление администратору %s не доставлено", admin_id)


async def buy_command(message: Message, bot: Bot, settings: Settings,
                      session_factory: async_sessionmaker[AsyncSession], level: str):
    if message.chat.type != "private" or not message.from_user:
        await message.answer("Покупка доступна в личном чате бота.")
        return
    try:
        await send_level_invoice(bot, settings, session_factory, message.from_user.id, level)
    except PurchaseNotAllowed as exc:
        await message.answer(str(exc))
    except Exception:
        logger.exception("Ошибка оформления счёта")
        await message.answer("Не удалось выставить счёт. Попробуйте позже.")


@router.message(Command("buy_medium"))
async def buy_medium(message: Message, bot: Bot, settings: Settings,
                     session_factory: async_sessionmaker[AsyncSession]):
    await buy_command(message, bot, settings, session_factory, "medium")


@router.message(Command("buy_hard"))
async def buy_hard(message: Message, bot: Bot, settings: Settings,
                   session_factory: async_sessionmaker[AsyncSession]):
    await buy_command(message, bot, settings, session_factory, "hard")


@router.pre_checkout_query()
async def pre_checkout(query: PreCheckoutQuery, settings: Settings,
                       session_factory: async_sessionmaker[AsyncSession]):
    valid = parse_payload(query.invoice_payload)
    if not valid or valid[1] != query.from_user.id:
        await query.answer(ok=False, error_message="Некорректные данные счёта")
        return
    level, user_id = valid
    # Даже старый инвойс не должен списать Stars у владельца.
    if user_id in settings.free_user_id_set:
        await query.answer(ok=False, error_message="Этот уровень вам уже доступен бесплатно")
        return
    if query.currency != "XTR" or query.total_amount != settings.prices[level]:
        await query.answer(ok=False, error_message="Цена изменилась. Запросите новый счёт")
        return
    try:
        # Оставляем запас до обязательного 10-секундного ответа Telegram.
        async with asyncio.timeout(6):
            async with session_factory() as session:
                user = await session.get(User, user_id)
                allowed = bool(user and user.age_confirmed_at and not await has_purchase(session, user_id, level))
        if not allowed:
            await query.answer(ok=False, error_message="Возраст не подтверждён или уровень уже куплен")
            return
        await query.answer(ok=True)
    except Exception:
        logger.exception("Ошибка pre_checkout user=%s level=%s", user_id, level)
        try:
            await query.answer(ok=False, error_message="Ошибка сервера. Повторите попытку")
        except TelegramAPIError:
            logger.exception("Не удалось отклонить pre_checkout")


@router.message(F.successful_payment)
async def payment_success(message: Message, bot: Bot, settings: Settings,
                          session_factory: async_sessionmaker[AsyncSession]):
    payment = message.successful_payment
    if not payment or not message.from_user:
        return
    parsed = parse_payload(payment.invoice_payload)
    if not parsed or parsed[1] != message.from_user.id or payment.currency != "XTR":
        logger.error("Непредвиденный платёж charge=%s", payment.telegram_payment_charge_id)
        await notify_admins(bot, settings, f"Платёж требует проверки: charge={payment.telegram_payment_charge_id}")
        await message.answer("Платёж получен, но требует проверки. Напишите /paysupport.")
        return
    level, user_id = parsed
    charge_id = payment.telegram_payment_charge_id
    if not charge_id or payment.total_amount <= 0:
        logger.error("Платёж без charge_id или с неверной суммой")
        await message.answer("Ошибка обработки платежа. Напишите /paysupport.")
        return

    if payment.total_amount != settings.prices[level]:
        logger.warning("Оплата по старой цене: user=%s amount=%s", user_id, payment.total_amount)

    duplicate_charge = False
    duplicate_level = False
    try:
        async with session_factory() as session:
            prior = await session.scalar(select(Purchase).where(Purchase.charge_id == charge_id))
            if prior:
                duplicate_charge = True
            elif await has_purchase(session, user_id, level):
                duplicate_level = True
            else:
                session.add(Purchase(
                    user_id=user_id, level=level, charge_id=charge_id,
                    amount_xtr=payment.total_amount,
                ))
                await session.commit()
    except IntegrityError:
        # Параллельные события: UNIQUE по charge_id и активному уровню.
        async with session_factory() as session:
            duplicate_charge = await session.scalar(
                select(Purchase.id).where(Purchase.charge_id == charge_id)
            ) is not None
        duplicate_level = not duplicate_charge
    except Exception:
        logger.exception("Не удалось зафиксировать оплаченный charge=%s", charge_id)
        await notify_admins(bot, settings, f"СРОЧНО: оплачен, но не сохранён charge={charge_id}, user={user_id}")
        await message.answer("Оплата поступила, доступ пока не обновлён. Напишите /paysupport.")
        return

    if duplicate_charge:
        logger.info("Повторная доставка successful_payment charge=%s", charge_id)
        await message.answer("✅ Покупка уже учтена. Откройте игру заново.")
        return
    if duplicate_level:
        # Деньги списались за уже активный уровень: автоматически возвращаем Stars.
        try:
            await bot.refund_star_payment(user_id=user_id, telegram_payment_charge_id=charge_id)
            await message.answer("За этот уровень вы уже заплатили. Повторный платёж возвращён.")
        except TelegramAPIError:
            logger.exception("Не удалось вернуть повторный charge=%s", charge_id)
            await notify_admins(bot, settings, f"Вернуть повторный платёж: {charge_id}, user={user_id}")
            await message.answer("Обнаружен повторный платёж. Напишите /paysupport для возврата.")
        return
    logger.info("Покупка сохранена user=%s level=%s charge=%s", user_id, level, charge_id)
    await message.answer(f"✅ Уровень «{LEVEL_NAMES[level]}» разблокирован! Откройте игру заново.")


@router.message(Command("refund"))
async def refund(message: Message, command: CommandObject, bot: Bot, settings: Settings,
                 session_factory: async_sessionmaker[AsyncSession]):
    if not message.from_user or message.from_user.id not in settings.admin_id_set:
        await message.answer("Команда доступна только администратору.")
        return
    charge_id = (command.args or "").strip()
    if not charge_id or len(charge_id) > 255 or " " in charge_id:
        await message.answer("Формат: /refund <telegram_payment_charge_id>")
        return
    try:
        async with session_factory() as session:
            purchase = await session.scalar(select(Purchase).where(Purchase.charge_id == charge_id))
            if not purchase:
                await message.answer("Платёж не найден в БД.")
                return
            if purchase.refunded_at:
                await message.answer("Этот платёж уже возвращён.")
                return
            await bot.refund_star_payment(user_id=purchase.user_id, telegram_payment_charge_id=charge_id)
            purchase.refunded_at = utcnow()
            await session.commit()
        logger.info("Возврат оформлен charge=%s", charge_id)
        await message.answer("✅ Stars возвращены. Доступ к уровню закрыт.")
    except TelegramAPIError:
        logger.exception("Telegram отклонил возврат")
        await message.answer("Telegram не выполнил возврат. Проверьте charge_id и повторите.")
    except Exception:
        logger.exception("Ошибка БД при возврате charge=%s", charge_id)
        await message.answer("Ошибка обработки возврата. Проверьте статус операции и базу данных.")


@router.message(Command("paysupport"))
async def paysupport(message: Message, command: CommandObject, bot: Bot, settings: Settings):
    if not message.from_user:
        return
    description = (command.args or "").strip()[:1000]
    if settings.support_contact:
        await message.answer(f"Поддержка по платежам: {settings.support_contact}\n"
                             "Укажите свой /myid и квитанцию о платеже.")
    if not description:
        await message.answer("Опишите проблему командой /paysupport <описание>. Не отправляйте реквизиты карт.")
        return
    if not settings.admin_id_set:
        await message.answer("Администратор поддержки пока не назначен.")
        return
    await notify_admins(bot, settings, f"Обращение /paysupport от {message.from_user.id}: {description}")
    await message.answer("✅ Обращение передано администратору.")


@router.message(F.refunded_payment)
async def refund_notification(message: Message, session_factory: async_sessionmaker[AsyncSession]):
    """Учитываем возвраты, пришедшие событием от Telegram извне команды администратора."""
    payment = message.refunded_payment
    if not payment:
        return
    try:
        async with session_factory() as session:
            purchase = await session.scalar(
                select(Purchase).where(Purchase.charge_id == payment.telegram_payment_charge_id)
            )
            if purchase and not purchase.refunded_at:
                purchase.refunded_at = utcnow()
                await session.commit()
                logger.info("Возврат из update записан: charge=%s", purchase.charge_id)
    except Exception:
        logger.exception("Не удалось учесть Telegram refunded_payment")
