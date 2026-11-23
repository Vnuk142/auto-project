"""Настройки берутся только из окружения или .env."""
from functools import lru_cache
import os
import hashlib
from urllib.parse import urlsplit

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    bot_token: str
    webapp_url: str = Field(default_factory=lambda: os.getenv("RENDER_EXTERNAL_URL", ""))
    database_url: str
    admin_ids: str = ""
    support_contact: str = ""
    max_init_data_age_seconds: int = Field(default=86400, gt=0)
    price_medium: int = Field(default=50, gt=0)
    price_hard: int = Field(default=100, gt=0)
    api_port: int = Field(default=8080, ge=1, le=65535)
    webhook_mode: bool = False

    @field_validator("bot_token")
    @classmethod
    def check_token(cls, value: str) -> str:
        if not value.strip() or value.startswith("REPLACE_"):
            raise ValueError("BOT_TOKEN не задан: получите токен у @BotFather и заполните .env")
        return value.strip()

    @field_validator("webapp_url")
    @classmethod
    def check_webapp_url(cls, value: str) -> str:
        parts = urlsplit(value)
        if parts.scheme != "https" or not parts.netloc or parts.username or parts.password:
            raise ValueError("WEBAPP_URL должен быть публичным HTTPS URL")
        return value.rstrip("/")

    @property
    def webhook_secret(self) -> str:
        # Telegram требует секрет из A-Z, a-z, 0-9, _, -. Стабильно выводим его из токена.
        return hashlib.sha256(("fanty-webhook-v1:" + self.bot_token).encode()).hexdigest()

    @property
    def admin_id_set(self) -> set[int]:
        try:
            return {int(item.strip()) for item in self.admin_ids.split(",") if item.strip()}
        except ValueError as exc:
            raise ValueError("ADMIN_IDS: укажите числовые Telegram user_id через запятую") from exc

    @property
    def prices(self) -> dict[str, int]:
        return {"easy": 0, "medium": self.price_medium, "hard": self.price_hard}

    @property
    def origin(self) -> str:
        parsed = urlsplit(self.webapp_url)
        return f"{parsed.scheme}://{parsed.netloc}"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    try:
        return Settings()
    except Exception as exc:
        raise RuntimeError(f"Ошибка конфигурации (.env): {exc}") from exc
