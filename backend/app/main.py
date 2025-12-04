"""
MCU Redefined API - FastAPI Application

A modern async API for the MCU Redefined platform.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from .core.config import settings
from .core.database import ContentBase, content_engine
from .core.logging import setup_logging, get_logger
from .core.middleware import RequestLoggingMiddleware, RateLimitMiddleware
from .core.async_utils import shutdown_executor
from .routers import blogs_router, reviews_router, timeline_router, users_router, topic_images_router

# Setup logging first
setup_logging(settings.LOG_LEVEL)
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup/shutdown events."""
    # Startup: Create database tables if they don't exist
    ContentBase.metadata.create_all(content_engine)
    logger.info(
        f"{settings.APP_NAME} v{settings.APP_VERSION} started",
        **{
            "app.name": settings.APP_NAME,
            "app.version": settings.APP_VERSION,
            "event": "startup",
        }
    )
    
    yield
    
    # Shutdown: Cleanup
    logger.info(
        f"{settings.APP_NAME} shutting down",
        **{
            "app.name": settings.APP_NAME,
            "event": "shutdown",
        }
    )
    
    # Shutdown the thread pool executor
    await shutdown_executor()


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API for MCU Redefined - Your source for Marvel content",
    lifespan=lifespan,
)

# Add request logging middleware (must be added first to wrap all requests)
app.add_middleware(RequestLoggingMiddleware)

# Add rate limiting middleware
app.add_middleware(RateLimitMiddleware)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add GZip compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Include routers
app.include_router(blogs_router)
app.include_router(reviews_router)
app.include_router(timeline_router)
app.include_router(users_router)
app.include_router(topic_images_router)


@app.get("/")
async def root():
    """Root endpoint - API health check."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "healthy"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


# Legacy route compatibility - collaborate endpoint
@app.get("/collaborate")
async def collaborate():
    """Placeholder for collaborate feature."""
    return {"message": "Collaboration feature coming soon"}


@app.post("/collaborate")
async def collaborate_post(data: dict):
    """Handle collaboration form submission."""
    print(f"Collaboration request: {data}")
    return data


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=4000,
        reload=settings.DEBUG,
    )
