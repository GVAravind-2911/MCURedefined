"""Author service for cross-database user resolution."""

from __future__ import annotations

from typing import Optional, Any
from sqlalchemy import select

from ..models.user import User
from ..core.database import AsyncSessionLocal
from ..core.cache import cache
from ..core.logging import get_logger

logger = get_logger(__name__)


class AuthorService:
    """Service for resolving author information from user database.
    
    This service handles cross-database foreign key resolution,
    fetching user details from PostgreSQL for content stored in Turso/SQLite.
    """
    
    CACHE_TTL = 300  # 5 minutes cache for author info
    
    @classmethod
    async def get_author_info(cls, author_id: str) -> Optional[dict[str, Any]]:
        """
        Get author information by user ID.
        
        Args:
            author_id: The user ID from the PostgreSQL user database
            
        Returns:
            Dictionary with author info or None if not found
        """
        if not author_id:
            return None
        
        cache_key = f"author_info:{author_id}"
        cached = cache.get_sync(cache_key)
        if cached is not None:
            return cached
        
        try:
            async with AsyncSessionLocal() as session:
                stmt = select(User).where(User.id == author_id)
                result = await session.execute(stmt)
                user = result.scalar_one_or_none()
                
                if not user:
                    logger.warning(f"Author not found for ID: {author_id}")
                    return None
                
                author_info = {
                    "id": user.id,
                    "name": user.name,
                    "username": user.username,
                    "display_name": user.display_name,
                    "image": user.image
                }
                
                cache.set_sync(cache_key, author_info, ttl=cls.CACHE_TTL)
                return author_info
                
        except Exception as e:
            logger.error(f"Error fetching author info for {author_id}: {e}")
            return None
    
    @classmethod
    async def get_authors_info(cls, author_ids: list[str]) -> dict[str, dict[str, Any]]:
        """
        Get author information for multiple user IDs (batch operation).
        
        Args:
            author_ids: List of user IDs from the PostgreSQL user database
            
        Returns:
            Dictionary mapping author_id to author info
        """
        if not author_ids:
            return {}
        
        # Deduplicate and filter empty
        unique_ids = list(set(id for id in author_ids if id))
        if not unique_ids:
            return {}
        
        result = {}
        uncached_ids = []
        
        # Check cache first
        for author_id in unique_ids:
            cache_key = f"author_info:{author_id}"
            cached = cache.get_sync(cache_key)
            if cached is not None:
                result[author_id] = cached
            else:
                uncached_ids.append(author_id)
        
        # Fetch uncached from database
        if uncached_ids:
            try:
                async with AsyncSessionLocal() as session:
                    stmt = select(User).where(User.id.in_(uncached_ids))
                    db_result = await session.execute(stmt)
                    users = db_result.scalars().all()
                    
                    for user in users:
                        author_info = {
                            "id": user.id,
                            "name": user.name,
                            "username": user.username,
                            "display_name": user.display_name,
                            "image": user.image
                        }
                        result[user.id] = author_info
                        cache.set_sync(f"author_info:{user.id}", author_info, ttl=cls.CACHE_TTL)
                        
            except Exception as e:
                logger.error(f"Error batch fetching author info: {e}")
        
        return result
    
    @classmethod
    def invalidate_author_cache(cls, author_id: str) -> None:
        """Invalidate cached author info when user updates their profile."""
        cache.delete_sync(f"author_info:{author_id}")
        logger.debug(f"Invalidated author cache for: {author_id}")
