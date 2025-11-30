"""Database connection and session management."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base, Session as SyncSession
from sqlalchemy.pool import NullPool
from typing import AsyncGenerator, Generator

from .config import settings

# Content database (Turso/SQLite) - using sync for libsql compatibility
# Note: libsql doesn't support async natively, so we use run_in_executor
import sqlalchemy
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.pool import QueuePool

content_engine = sqlalchemy.create_engine(
    settings.turso_url,
    connect_args={'check_same_thread': False},
    echo=False,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_recycle=3600,
    pool_pre_ping=True
)

ContentSessionLocal = scoped_session(sessionmaker(bind=content_engine))
ContentBase = declarative_base()

# User database (PostgreSQL) - async
user_engine = create_async_engine(
    settings.postgres_url,
    echo=False,
    poolclass=NullPool,  # For async, NullPool is recommended
)

AsyncSessionLocal = async_sessionmaker(
    bind=user_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False
)

UserAsyncSessionLocal = AsyncSessionLocal  # Alias for clarity
UserBase = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Get async database session for user operations."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def get_user_db() -> AsyncGenerator[AsyncSession, None]:
    """Alias for get_db - used for user database operations."""
    async for session in get_db():
        yield session


def get_content_session() -> Generator[SyncSession, None, None]:
    """Get sync database session for content operations."""
    session = ContentSessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
