"""
Request logging middleware with OTEL-compatible tracing and rate limiting.
"""

from __future__ import annotations

import time
from collections import defaultdict
from typing import Callable, Dict
from datetime import datetime, timedelta

from fastapi import Request, Response, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.status import HTTP_429_TOO_MANY_REQUESTS

from .logging import (
    get_logger,
    generate_trace_id,
    generate_span_id,
    set_trace_context,
    clear_trace_context,
)

logger = get_logger(__name__)


class RateLimiter:
    """Simple in-memory rate limiter using sliding window."""
    
    def __init__(
        self,
        requests_per_minute: int = 60,
        requests_per_second: int = 10
    ):
        self.requests_per_minute = requests_per_minute
        self.requests_per_second = requests_per_second
        self.minute_requests: Dict[str, list] = defaultdict(list)
        self.second_requests: Dict[str, list] = defaultdict(list)
    
    def _cleanup_old_requests(self, client_id: str, now: datetime):
        """Remove requests older than the window."""
        minute_ago = now - timedelta(minutes=1)
        second_ago = now - timedelta(seconds=1)
        
        self.minute_requests[client_id] = [
            ts for ts in self.minute_requests[client_id] if ts > minute_ago
        ]
        self.second_requests[client_id] = [
            ts for ts in self.second_requests[client_id] if ts > second_ago
        ]
    
    def is_rate_limited(self, client_id: str) -> tuple[bool, str]:
        """Check if client is rate limited. Returns (is_limited, reason)."""
        now = datetime.now()
        self._cleanup_old_requests(client_id, now)
        
        # Check per-second limit first (more restrictive for bursts)
        if len(self.second_requests[client_id]) >= self.requests_per_second:
            return True, f"Rate limit exceeded: {self.requests_per_second} requests per second"
        
        # Check per-minute limit
        if len(self.minute_requests[client_id]) >= self.requests_per_minute:
            return True, f"Rate limit exceeded: {self.requests_per_minute} requests per minute"
        
        # Record this request
        self.minute_requests[client_id].append(now)
        self.second_requests[client_id].append(now)
        
        return False, ""


# Global rate limiter instance
rate_limiter = RateLimiter(
    requests_per_minute=120,  # 120 requests per minute per client
    requests_per_second=15    # 15 requests per second per client (burst protection)
)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Middleware for rate limiting requests.
    """
    
    # Paths exempt from rate limiting
    EXEMPT_PATHS = {"/health", "/docs", "/openapi.json", "/redoc"}
    
    async def dispatch(
        self, request: Request, call_next: Callable
    ) -> Response:
        # Skip rate limiting for exempt paths
        if request.url.path in self.EXEMPT_PATHS:
            return await call_next(request)
        
        # Get client identifier (IP address or user ID from auth)
        client_id = request.client.host if request.client else "unknown"
        
        # Check rate limit
        is_limited, reason = rate_limiter.is_rate_limited(client_id)
        
        if is_limited:
            logger.warning(
                f"Rate limit exceeded for client {client_id}",
                **{
                    "http.method": request.method,
                    "http.route": request.url.path,
                    "client.id": client_id,
                    "rate_limit.reason": reason,
                }
            )
            return Response(
                content=f'{{"error": "{reason}"}}',
                status_code=HTTP_429_TOO_MANY_REQUESTS,
                headers={
                    "Content-Type": "application/json",
                    "Retry-After": "1"
                }
            )
        
        return await call_next(request)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware for logging HTTP requests with OTEL-compatible trace context.
    """
    
    async def dispatch(
        self, request: Request, call_next: Callable
    ) -> Response:
        # Generate or extract trace context
        trace_id = request.headers.get("x-trace-id") or generate_trace_id()
        span_id = generate_span_id()
        
        # Set trace context for this request
        set_trace_context(trace_id, span_id, request.url.path)
        
        # Log request start
        logger.info(
            f"Request started: {request.method} {request.url.path}",
            **{
                "http.method": request.method,
                "http.url": str(request.url),
                "http.route": request.url.path,
                "http.scheme": request.url.scheme,
                "http.host": request.url.hostname or "",
                "http.user_agent": request.headers.get("user-agent", ""),
                "http.request_content_type": request.headers.get("content-type", ""),
                "network.client.address": request.client.host if request.client else "",
            }
        )
        
        # Process request and measure time
        start_time = time.perf_counter()
        
        try:
            response = await call_next(request)
            duration_ms = (time.perf_counter() - start_time) * 1000
            
            # Log request completion
            log_method = logger.info if response.status_code < 400 else logger.warning
            if response.status_code >= 500:
                log_method = logger.error
            
            log_method(
                f"Request completed: {request.method} {request.url.path} - {response.status_code}",
                exc_info=False,
                **{
                    "http.method": request.method,
                    "http.route": request.url.path,
                    "http.status_code": response.status_code,
                    "http.response_content_type": response.headers.get("content-type", ""),
                    "duration_ms": round(duration_ms, 2),
                }
            )
            
            # Add trace ID to response headers
            response.headers["x-trace-id"] = trace_id
            
            return response
            
        except Exception as e:
            duration_ms = (time.perf_counter() - start_time) * 1000
            
            logger.error(
                f"Request failed: {request.method} {request.url.path} - {type(e).__name__}: {str(e)}",
                **{
                    "http.method": request.method,
                    "http.route": request.url.path,
                    "error.type": type(e).__name__,
                    "error.message": str(e),
                    "duration_ms": round(duration_ms, 2),
                }
            )
            raise
            
        finally:
            # Clear trace context
            clear_trace_context()
