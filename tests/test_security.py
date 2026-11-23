"""Независимые тесты официального HMAC-алгоритма Telegram Mini Apps."""
import hashlib
import hmac
import json
import time
from urllib.parse import urlencode

from bot.security import validate_init_data

TOKEN = "123456:TEST_TOKEN"


def make_init_data(auth_date=None, user=None):
    if auth_date is None:
        auth_date = int(time.time())
    if user is None:
        user = {"id": 987654321, "first_name": "Тест", "username": "tester"}
    values = {
        "auth_date": str(auth_date),
        "query_id": "AAEAAQ",
        "user": json.dumps(user, ensure_ascii=False, separators=(",", ":")),
    }
    check_string = "\n".join(f"{key}={value}" for key, value in sorted(values.items()))
    secret_key = hmac.new(b"WebAppData", TOKEN.encode(), hashlib.sha256).digest()
    values["hash"] = hmac.new(secret_key, check_string.encode(), hashlib.sha256).hexdigest()
    return urlencode(values)


def test_valid_data():
    result = validate_init_data(make_init_data(), TOKEN)
    assert result and result["user"]["id"] == 987654321
    assert isinstance(result["auth_date"], int)


def test_tampered_hash():
    value = make_init_data()
    assert validate_init_data(value[:-1] + ("0" if value[-1] != "0" else "1"), TOKEN) is None


def test_expired_date():
    value = make_init_data(auth_date=int(time.time()) - 90000)
    assert validate_init_data(value, TOKEN, max_age_seconds=86400) is None


def test_missing_hash():
    value = make_init_data().split("&hash=")[0]
    assert validate_init_data(value, TOKEN) is None


def test_bad_query_format():
    assert validate_init_data("auth_date&user=x&hash=abc", TOKEN) is None


def test_duplicate_auth_date():
    assert validate_init_data(make_init_data() + "&auth_date=123", TOKEN) is None


def test_wrong_token():
    assert validate_init_data(make_init_data(), "654321:OTHER") is None


def test_bad_user_json():
    # Подпись корректна, но тип данных user не JSON-объект.
    assert validate_init_data(make_init_data(user=[1, 2, 3]), TOKEN) is None


def test_future_date():
    assert validate_init_data(make_init_data(auth_date=int(time.time()) + 1000), TOKEN) is None


def test_empty_input():
    assert validate_init_data("", TOKEN) is None
