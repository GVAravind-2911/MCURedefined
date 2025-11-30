"""
OpenTelemetry-compatible structured logging module.

Follows OTEL semantic conventions for logging.
https://opentelemetry.io/docs/specs/otel/logs/semantic_conventions/
"""

from __future__ import annotations

import json
import logging
import sys
import traceback
import uuid
from contextvars import ContextVar
from datetime import datetime, timezone
from enum import Enum
from functools import wraps
from typing import Any, Callable, Optional

from .config import settings


# Context variables for request tracing
trace_id_var: ContextVar[str] = ContextVar("trace_id", default="")
span_id_var: ContextVar[str] = ContextVar("span_id", default="")
request_path_var: ContextVar[str] = ContextVar("request_path", default="")


class SeverityNumber(Enum):
    """OTEL severity numbers."""
    TRACE = 1
    DEBUG = 5
    INFO = 9
    WARN = 13
    ERROR = 17
    FATAL = 21


class OTELFormatter(logging.Formatter):
    """
    OpenTelemetry-compatible JSON log formatter.
    
    Follows OTEL Log Data Model:
    https://opentelemetry.io/docs/specs/otel/logs/data-model/
    """
    
    SEVERITY_MAP = {
        logging.DEBUG: ("DEBUG", SeverityNumber.DEBUG.value),
        logging.INFO: ("INFO", SeverityNumber.INFO.value),
        logging.WARNING: ("WARN", SeverityNumber.WARN.value),
        logging.ERROR: ("ERROR", SeverityNumber.ERROR.value),
        logging.CRITICAL: ("FATAL", SeverityNumber.FATAL.value),
    }
    
    def format(self, record: logging.LogRecord) -> str:
        severity_text, severity_number = self.SEVERITY_MAP.get(
            record.levelno, ("INFO", SeverityNumber.INFO.value)
        )
        
        # Build OTEL-compatible log record
        log_record: dict[str, Any] = {
            # Timestamp in ISO 8601 format with timezone
            "timestamp": datetime.now(timezone.utc).isoformat(),
            # Observed timestamp (when the log was received)
            "observedTimestamp": datetime.now(timezone.utc).isoformat(),
            # Severity
            "severityText": severity_text,
            "severityNumber": severity_number,
            # Body (the log message)
            "body": record.getMessage(),
            # Resource attributes
            "resource": {
                "service.name": settings.APP_NAME,
                "service.version": settings.APP_VERSION,
            },
            # Instrumentation scope
            "instrumentationScope": {
                "name": record.name,
            },
            # Attributes
            "attributes": {
                "code.filepath": record.pathname,
                "code.function": record.funcName,
                "code.lineno": record.lineno,
            },
        }
        
        # Add trace context if available
        trace_id = trace_id_var.get()
        span_id = span_id_var.get()
        if trace_id:
            log_record["traceId"] = trace_id
        if span_id:
            log_record["spanId"] = span_id
        
        # Add request path if available
        request_path = request_path_var.get()
        if request_path:
            log_record["attributes"]["http.route"] = request_path
        
        # Add extra attributes from record
        extra_attrs = getattr(record, "extra_attrs", None)
        if extra_attrs:
            log_record["attributes"].update(extra_attrs)
        
        # Add exception info if present
        if record.exc_info:
            log_record["attributes"]["exception.type"] = record.exc_info[0].__name__ if record.exc_info[0] else "Unknown"
            log_record["attributes"]["exception.message"] = str(record.exc_info[1]) if record.exc_info[1] else ""
            log_record["attributes"]["exception.stacktrace"] = "".join(
                traceback.format_exception(*record.exc_info)
            )
        
        return json.dumps(log_record, default=str)


class StructuredLogger:
    """
    Structured logger with OTEL-compatible output.
    
    Provides methods for logging with additional context attributes.
    """
    
    def __init__(self, name: str) -> None:
        self.logger = logging.getLogger(name)
        self.name = name
    
    def _log(
        self, 
        level: int, 
        message: str, 
        exc_info: bool = False,
        **attrs: Any
    ) -> None:
        """Internal log method with attributes support."""
        extra = {"extra_attrs": attrs} if attrs else {}
        self.logger.log(level, message, exc_info=exc_info, extra=extra)
    
    def debug(self, message: str, **attrs: Any) -> None:
        """Log debug message with optional attributes."""
        self._log(logging.DEBUG, message, **attrs)
    
    def info(self, message: str, **attrs: Any) -> None:
        """Log info message with optional attributes."""
        self._log(logging.INFO, message, **attrs)
    
    def warning(self, message: str, **attrs: Any) -> None:
        """Log warning message with optional attributes."""
        self._log(logging.WARNING, message, **attrs)
    
    def error(self, message: str, exc_info: bool = True, **attrs: Any) -> None:
        """Log error message with optional attributes and exception info."""
        self._log(logging.ERROR, message, exc_info=exc_info, **attrs)
    
    def critical(self, message: str, exc_info: bool = True, **attrs: Any) -> None:
        """Log critical message with optional attributes."""
        self._log(logging.CRITICAL, message, exc_info=exc_info, **attrs)


def setup_logging(log_level: str = "INFO") -> None:
    """
    Configure application-wide logging with OTEL format.
    
    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    # Get root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))
    
    # Remove existing handlers from root
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Create console handler with OTEL formatter
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(OTELFormatter())
    root_logger.addHandler(console_handler)
    
    # Configure uvicorn loggers to use our formatter
    for uvicorn_logger_name in ["uvicorn", "uvicorn.error", "uvicorn.access"]:
        uvicorn_logger = logging.getLogger(uvicorn_logger_name)
        uvicorn_logger.handlers = []
        uvicorn_logger.propagate = True
    
    # Reduce noise from third-party libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("libsql_client").setLevel(logging.WARNING)
    logging.getLogger("libsql_client.dbapi2").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("asyncio").setLevel(logging.WARNING)


def get_logger(name: str) -> StructuredLogger:
    """
    Get a structured logger instance.
    
    Args:
        name: Logger name (typically __name__)
        
    Returns:
        StructuredLogger instance
    """
    return StructuredLogger(name)


def generate_trace_id() -> str:
    """Generate a new trace ID (32 hex characters)."""
    return uuid.uuid4().hex


def generate_span_id() -> str:
    """Generate a new span ID (16 hex characters)."""
    return uuid.uuid4().hex[:16]


def set_trace_context(trace_id: str, span_id: str, request_path: str = "") -> None:
    """Set the trace context for the current request."""
    trace_id_var.set(trace_id)
    span_id_var.set(span_id)
    if request_path:
        request_path_var.set(request_path)


def clear_trace_context() -> None:
    """Clear the trace context."""
    trace_id_var.set("")
    span_id_var.set("")
    request_path_var.set("")


def log_function_call(logger: Optional[StructuredLogger] = None) -> Callable:
    """
    Decorator to log function entry, exit, and errors.
    
    Args:
        logger: Optional logger instance. If not provided, uses function's module name.
    """
    def decorator(func: Callable) -> Callable:
        func_logger = logger or get_logger(func.__module__)
        
        @wraps(func)
        async def async_wrapper(*args: Any, **kwargs: Any) -> Any:
            func_name = func.__name__
            func_logger.debug(
                f"Entering {func_name}",
                function=func_name,
                args_count=len(args),
                kwargs_keys=list(kwargs.keys())
            )
            try:
                result = await func(*args, **kwargs)
                func_logger.debug(f"Exiting {func_name}", function=func_name)
                return result
            except Exception as e:
                func_logger.error(
                    f"Error in {func_name}: {str(e)}",
                    function=func_name,
                    error_type=type(e).__name__
                )
                raise
        
        @wraps(func)
        def sync_wrapper(*args: Any, **kwargs: Any) -> Any:
            func_name = func.__name__
            func_logger.debug(
                f"Entering {func_name}",
                function=func_name,
                args_count=len(args),
                kwargs_keys=list(kwargs.keys())
            )
            try:
                result = func(*args, **kwargs)
                func_logger.debug(f"Exiting {func_name}", function=func_name)
                return result
            except Exception as e:
                func_logger.error(
                    f"Error in {func_name}: {str(e)}",
                    function=func_name,
                    error_type=type(e).__name__
                )
                raise
        
        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper
    
    return decorator
