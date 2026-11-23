"""Клавиатуры 18+ и безопасного открытия Mini App.

ReplyKeyboard WebApp не получает Telegram initData, поэтому reply-кнопка
отправляет текст, а бот выдаёт настоящую WebApp-ссылку в inline-кнопке.
"""
from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    ReplyKeyboardMarkup,
    WebAppInfo,
)


def age_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="✅ Мне есть 18 лет", callback_data="age_confirm")],
        [InlineKeyboardButton(text="❌ Мне нет 18", callback_data="age_decline")],
    ])


def game_keyboard() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[[KeyboardButton(text="🎲 Открыть игру")]],
        resize_keyboard=True,
        is_persistent=True,
    )


def game_inline_keyboard(webapp_url: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🎲 Запустить Mini App", web_app=WebAppInfo(url=webapp_url))],
    ])
