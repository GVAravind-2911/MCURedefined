#!/usr/bin/env python
"""Entry point for running the MCU Redefined API."""

import uvicorn
from app.core.config import settings

# Custom log config to disable uvicorn's default formatting
# Our OTEL formatter will be used instead via logging propagation
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {},
    "handlers": {},
    "loggers": {
        "uvicorn": {"handlers": [], "level": "INFO", "propagate": True},
        "uvicorn.error": {"handlers": [], "level": "INFO", "propagate": True},
        "uvicorn.access": {"handlers": [], "level": "WARNING", "propagate": True},
    },
}

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=4000,
        reload=settings.DEBUG,
        workers=1 if settings.DEBUG else 4,
        log_config=LOGGING_CONFIG,
    )
