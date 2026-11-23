"""Асинхронное хранилище пользователей и платежей."""
from datetime import datetime, timezone

from sqlalchemy import BigInteger, CheckConstraint, DateTime, ForeignKey, Index, Integer, String, func, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    username: Mapped[str | None] = mapped_column(String(255), nullable=True)
    age_confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    age_declined_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Purchase(Base):
    __tablename__ = "purchases"
    __table_args__ = (
        CheckConstraint("level IN ('medium', 'hard')", name="ck_purchases_level"),
        CheckConstraint("amount_xtr > 0", name="ck_purchases_amount"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id"), nullable=False)
    level: Mapped[str] = mapped_column(String(16), nullable=False)
    charge_id: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    amount_xtr: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    refunded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


# Только одна АКТИВНАЯ покупка уровня на пользователя.
# После возврата сохраняем финансовую историю и разрешаем новую покупку.
Index(
    "uq_active_purchase_user_level",
    Purchase.user_id,
    Purchase.level,
    unique=True,
    postgresql_where=Purchase.refunded_at.is_(None),
)


def make_session_factory(database_url: str):
    # Render выдаёт обычный postgresql://, а SQLAlchemy async требует +asyncpg.
    # Преобразуем только схему, не раскрывая пароль в логах.
    if database_url.startswith("postgresql://"):
        database_url = "postgresql+asyncpg://" + database_url[len("postgresql://"):]
    elif database_url.startswith("postgres://"):
        database_url = "postgresql+asyncpg://" + database_url[len("postgres://"):]
    engine = create_async_engine(database_url, pool_pre_ping=True, pool_size=5, max_overflow=10)
    factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    return engine, factory


async def get_or_create_user(session: AsyncSession, user_id: int, username: str | None) -> User:
    # INSERT ON CONFLICT исключает гонку при одновременном /start и callback.
    await session.execute(
        pg_insert(User)
        .values(user_id=user_id, username=username)
        .on_conflict_do_update(index_elements=[User.user_id], set_={"username": username})
    )
    await session.flush()
    result = await session.get(User, user_id)
    assert result is not None
    return result


async def has_purchase(session: AsyncSession, user_id: int, level: str) -> bool:
    stmt = select(Purchase.id).where(
        Purchase.user_id == user_id,
        Purchase.level == level,
        Purchase.refunded_at.is_(None),
    ).limit(1)
    return await session.scalar(stmt) is not None


async def unlocked_levels(session: AsyncSession, user: User) -> dict[str, bool]:
    confirmed = user.age_confirmed_at is not None
    if not confirmed:
        return {"easy": False, "medium": False, "hard": False}
    rows = await session.scalars(
        select(Purchase.level).where(Purchase.user_id == user.user_id, Purchase.refunded_at.is_(None))
    )
    bought = set(rows.all())
    return {"easy": True, "medium": "medium" in bought, "hard": "hard" in bought}
