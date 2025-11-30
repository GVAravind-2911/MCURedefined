"""
Request logging middleware with OTEL-compatible tracing.
"""

from __future__ import annotations

import time
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from .logging import (
    get_logger,
    generate_trace_id,
    generate_span_id,
    set_trace_context,
    clear_trace_context,
)

logger = get_logger(__name__)


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
