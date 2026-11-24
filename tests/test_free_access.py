"""Проверка бесплатного доступа владельца без оплаты и без обхода 18+."""
import pytest

from bot.config import Settings
from bot.db import User, unlocked_levels, utcnow


class EmptyPurchases:
    def all(self):
        return []


class FakeSession:
    async def scalars(self, stmt):
        return EmptyPurchases()


def make_settings(**overrides):
    options = {
        "bot_token": "123456:LOCAL_TEST",
        "webapp_url": "https://example.org",
        "database_url": "postgresql+asyncpg://user:password@localhost:5432/fanty",
        "free_user_ids": "111, 222",
    }
    options.update(overrides)
    return Settings(_env_file=None, **options)


def test_config_parses_owner_ids():
    assert make_settings().free_user_id_set == {111, 222}


def test_admin_and_free_user_ids_are_separate():
    settings = make_settings(admin_ids="333")
    assert settings.admin_id_set == {333}
    assert settings.free_user_id_set == {111, 222}


@pytest.mark.parametrize("bad", ["x", "1,nope", "-5", "0"])
def test_invalid_free_user_ids_rejected(bad):
    with pytest.raises(ValueError):
        _ = make_settings(free_user_ids=bad).free_user_id_set


@pytest.mark.asyncio
async def test_owner_gets_paid_levels_without_purchase():
    user = User(user_id=111, age_confirmed_at=utcnow())
    assert await unlocked_levels(FakeSession(), user, {111}) == {
        "easy": True, "medium": True, "hard": True,
    }


@pytest.mark.asyncio
async def test_owner_still_needs_age_confirmation():
    user = User(user_id=111, age_confirmed_at=None)
    assert await unlocked_levels(FakeSession(), user, {111}) == {
        "easy": False, "medium": False, "hard": False,
    }


@pytest.mark.asyncio
async def test_other_user_does_not_receive_owner_privileges():
    user = User(user_id=444, age_confirmed_at=utcnow())
    assert await unlocked_levels(FakeSession(), user, {111}) == {
        "easy": True, "medium": False, "hard": False,
    }
