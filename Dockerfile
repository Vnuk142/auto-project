FROM python:3.11-slim AS builder
WORKDIR /build
RUN apt-get update && apt-get install -y --no-install-recommends gcc build-essential \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt

FROM python:3.11-slim AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1
WORKDIR /app
COPY --from=builder /wheels /wheels
COPY requirements.txt .
RUN pip install --no-index --find-links=/wheels -r requirements.txt \
    && rm -rf /wheels \
    && groupadd --system fanty && useradd --system --gid fanty --home-dir /app fanty
COPY --chown=fanty:fanty bot/ ./bot/
COPY --chown=fanty:fanty api/ ./api/
COPY --chown=fanty:fanty web/ ./web/
COPY --chown=fanty:fanty tests/ ./tests/
USER fanty
EXPOSE 8080 10000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD python -c "import urllib.request,os; urllib.request.urlopen('http://127.0.0.1:'+os.environ.get('PORT',os.environ.get('API_PORT','8080'))+'/health', timeout=3)" || exit 1
CMD ["python", "-m", "bot.main"]
