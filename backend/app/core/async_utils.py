"""Async utilities for running sync operations in thread pool."""

from __future__ import annotations

import asyncio
from concurrent.futures import ThreadPoolExecutor
from functools import partial, wraps
from typing import Any, Callable, TypeVar

# Shared thread pool for sync database operations
# libsql doesn't support async, so we use this for content DB operations
_executor = ThreadPoolExecutor(max_workers=8, thread_name_prefix="db_sync_")

T = TypeVar("T")


async def run_sync(func: Callable[..., T], *args: Any, **kwargs: Any) -> T:
    """
    Run a synchronous function in a thread pool executor.
    
    This is used for libsql/Turso operations which don't support async natively.
    The function runs in a separate thread to avoid blocking the event loop.
    
    Args:
        func: The sync function to run
        *args: Positional arguments to pass to the function
        **kwargs: Keyword arguments to pass to the function
        
    Returns:
        The result of the function
    """
    loop = asyncio.get_running_loop()
    
    if kwargs:
        # If there are kwargs, we need to use partial
        func_with_kwargs: Callable[..., T] = partial(func, **kwargs)
        return await loop.run_in_executor(_executor, func_with_kwargs, *args)
    
    return await loop.run_in_executor(_executor, func, *args)


def async_wrap(func: Callable[..., T]) -> Callable[..., T]:
    """
    Decorator to wrap a sync function to be called asynchronously.
    
    Usage:
        @async_wrap
        def sync_operation():
            ...
            
        # Now can be awaited
        result = await sync_operation()
    """
    @wraps(func)
    async def wrapper(*args: Any, **kwargs: Any) -> T:
        return await run_sync(func, *args, **kwargs)
    
    return wrapper  # type: ignore


def get_executor() -> ThreadPoolExecutor:
    """Get the shared thread pool executor."""
    return _executor


async def shutdown_executor() -> None:
    """Shutdown the thread pool executor gracefully."""
    _executor.shutdown(wait=True)
