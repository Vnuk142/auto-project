"""Проверка подписи Telegram Mini Apps без доверия к initDataUnsafe."""
import hashlib
import hmac
import json
import re
import time
from urllib.parse import parse_qsl


def validate_init_data(
    init_data: str,
    bot_token: str,
    max_age_seconds: int = 86400,
) -> dict | None:
    if not isinstance(init_data, str) or not init_data or len(init_data) > 8192 or not bot_token:
        return None
    try:
        pairs = parse_qsl(init_data, keep_blank_values=True, strict_parsing=True, errors="strict")
        params = dict(pairs)
        if len(params) != len(pairs):  # Дубли ключей недопустимы.
            return None
        actual_hash = params.pop("hash", "")
        if not re.fullmatch(r"[0-9a-fA-F]{64}", actual_hash):
            return None
        issued_at = int(params["auth_date"])
        current = int(time.time())
        if issued_at > current + 60 or current - issued_at > max_age_seconds:
            return None
        check_string = "\n".join(f"{k}={v}" for k, v in sorted(params.items()))
        secret_key = hmac.new(b"WebAppData", bot_token.encode("utf-8"), hashlib.sha256).digest()
        computed_hash = hmac.new(secret_key, check_string.encode("utf-8"), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(computed_hash, actual_hash.lower()):
            return None
        user = json.loads(params["user"])
        if not isinstance(user, dict) or type(user.get("id")) is not int or user["id"] <= 0:
            return None
        params["user"] = user
        params["auth_date"] = issued_at
        return params
    except (ValueError, TypeError, KeyError, UnicodeError, json.JSONDecodeError):
        return None
