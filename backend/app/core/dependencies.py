"""FastAPI dependencies for authentication and authorization."""

from __future__ import annotations

from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from typing import Optional, Any

from .database import get_user_db
from .logging import get_logger

logger = get_logger(__name__)


async def get_token(authorization: Optional[str] = Header(default=None)) -> Optional[str]:
    """Extract token from Authorization header."""
    if not authorization:
        logger.debug("No authorization header provided")
        return None
    
    if authorization.startswith("Bearer "):
        return authorization[7:]
    
    return authorization


async def get_current_admin(
    token: Optional[str] = Depends(get_token),
    db: AsyncSession = Depends(get_user_db)
) -> bool:
    """
    Verify that the current user is an admin.
    Raises HTTPException if not authorized.
    """
    logger.debug("Checking admin authentication", **{"has_token": token is not None})
    
    if not token:
        logger.warning("Authentication required but no token provided")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    # Import here to avoid circular imports
    from ..models.user import Session, User
    
    try:
        # Query for valid session
        logger.debug("Looking up session by token")
        stmt = select(Session).where(
            Session.token == token,
            Session.expires_at > datetime.now()
        )
        result = await db.execute(stmt)
        session = result.scalar_one_or_none()
        
        if not session:
            logger.warning("Invalid or expired token", **{"token_prefix": token[:8] + "..." if len(token) > 8 else token})
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        
        # Get user
        logger.debug(f"Session found, looking up user {session.user_id}")
        user_stmt = select(User).where(User.id == session.user_id)
        user_result = await db.execute(user_stmt)
        user = user_result.scalar_one_or_none()
        
        if not user or str(user.role) != "admin":
            logger.warning(
                "User is not admin",
                **{
                    "user.id": str(session.user_id),
                    "user.role": str(user.role) if user else "N/A",
                }
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        logger.debug(f"Admin authentication successful for user {session.user_id}")
        return True
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Authentication error: {str(e)}",
            exc_info=True,
            **{"error.type": type(e).__name__, "error.message": str(e)}
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication error: {str(e)}"
        )


async def get_optional_user(
    token: Optional[str] = Depends(get_token),
    db: AsyncSession = Depends(get_user_db)
) -> Optional[dict[str, Any]]:
    """
    Get current user if authenticated, None otherwise.
    Does not raise exception if not authenticated.
    """
    if not token:
        return None
    
    from ..models.user import Session, User
    
    try:
        stmt = select(Session).where(
            Session.token == token,
            Session.expires_at > datetime.now()
        )
        result = await db.execute(stmt)
        session = result.scalar_one_or_none()
        
        if not session:
            return None
        
        user_stmt = select(User).where(User.id == session.user_id)
        user_result = await db.execute(user_stmt)
        user = user_result.scalar_one_or_none()
        
        if not user:
            return None
        
        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
        
    except Exception:
        return None
