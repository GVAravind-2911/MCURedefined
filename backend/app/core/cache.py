"""Simple in-memory cache implementation."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Optional, Callable, TypeVar, ParamSpec
from functools import wraps
import asyncio

P = ParamSpec('P')
T = TypeVar('T')


class Cache:
    """Thread-safe in-memory cache with TTL support."""
    
    def __init__(self, default_ttl: int = 300):
        """Initialize cache with default TTL in seconds."""
        self._cache: dict[str, tuple[Any, float]] = {}
        self._default_ttl = default_ttl
        self._lock = asyncio.Lock()
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache if not expired."""
        async with self._lock:
            if key in self._cache:
                value, expiry = self._cache[key]
                if datetime.now().timestamp() < expiry:
                    return value
                # Expired, remove from cache
                del self._cache[key]
            return None
    
    def get_sync(self, key: str) -> Optional[Any]:
        """Synchronous get for non-async contexts."""
        if key in self._cache:
            value, expiry = self._cache[key]
            if datetime.now().timestamp() < expiry:
                return value
            del self._cache[key]
        return None
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Set value in cache with optional TTL."""
        async with self._lock:
            ttl = ttl or self._default_ttl
            expiry = datetime.now().timestamp() + ttl
            self._cache[key] = (value, expiry)
    
    def set_sync(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Synchronous set for non-async contexts."""
        ttl = ttl or self._default_ttl
        expiry = datetime.now().timestamp() + ttl
        self._cache[key] = (value, expiry)
    
    async def delete(self, key: str) -> None:
        """Delete key from cache."""
        async with self._lock:
            self._cache.pop(key, None)
    
    def delete_sync(self, key: str) -> None:
        """Synchronous delete for non-async contexts."""
        self._cache.pop(key, None)
    
    async def clear(self) -> None:
        """Clear all cache entries."""
        async with self._lock:
            self._cache.clear()
    
    def clear_sync(self) -> None:
        """Synchronous clear for non-async contexts."""
        self._cache.clear()
    
    async def delete_pattern(self, pattern: str) -> None:
        """Delete all keys matching pattern (simple prefix match)."""
        async with self._lock:
            keys_to_delete = [k for k in self._cache.keys() if k.startswith(pattern)]
            for key in keys_to_delete:
                del self._cache[key]


# Global cache instance
cache = Cache()


def cached(ttl: Optional[int] = None, key_prefix: Optional[str] = None):
    """Decorator for caching function results (sync version for ORM operations)."""
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            key_parts = [key_prefix or func.__name__]
            for arg in args:
                if isinstance(arg, (list, tuple, set)):
                    key_parts.extend([str(a) for a in sorted(arg) if a is not None])
                elif arg is not None:
                    key_parts.append(str(arg))
            
            for k, v in sorted(kwargs.items()):
                if isinstance(v, (list, tuple, set)):
                    key_parts.append(f"{k}={','.join(str(a) for a in sorted(v) if a)}")
                elif v is not None:
                    key_parts.append(f"{k}={v}")
            
            cache_key = ":".join(key_parts)
            
            # Try to get from cache
            result = cache.get_sync(cache_key)
            if result is not None:
                return result
            
            # Call original function and cache result
            result = func(*args, **kwargs)
            cache.set_sync(cache_key, result, ttl)
            return result
        return wrapper
    return decorator


def async_cached(ttl: Optional[int] = None, key_prefix: Optional[str] = None):
    """Decorator for caching async function results."""
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            key_parts = [key_prefix or func.__name__]
            for arg in args:
                if isinstance(arg, (list, tuple, set)):
                    key_parts.extend([str(a) for a in sorted(arg) if a is not None])
                elif arg is not None:
                    key_parts.append(str(arg))
            
            for k, v in sorted(kwargs.items()):
                if isinstance(v, (list, tuple, set)):
                    key_parts.append(f"{k}={','.join(str(a) for a in sorted(v) if a)}")
                elif v is not None:
                    key_parts.append(f"{k}={v}")
            
            cache_key = ":".join(key_parts)
            
            # Try to get from cache
            result = await cache.get(cache_key)
            if result is not None:
                return result
            
            # Call original function and cache result
            result = await func(*args, **kwargs)
            await cache.set(cache_key, result, ttl)
            return result
        return wrapper
    return decorator
