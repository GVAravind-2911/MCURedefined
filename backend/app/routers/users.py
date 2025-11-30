"""User-related API routes."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any

from ..schemas.user import LikedContentRequest, SearchRequest
from ..services.user import UserService
from ..services.blog import BlogService
from ..services.review import ReviewService
from ..services.timeline import TimelineService
from ..core.database import get_user_db
from ..core.async_utils import run_sync

router = APIRouter(prefix="/user", tags=["users"])


@router.post("/liked")
async def get_liked_content(
    request: LikedContentRequest,
    db: AsyncSession = Depends(get_user_db)
) -> dict[str, Any]:
    """Get user's liked content with pagination."""
    # Get all liked content IDs
    user_liked = await UserService.get_liked_content(db, request.user_id)
    
    if request.type == "blogs":
        def _get_blogs() -> dict[str, Any]:
            return BlogService.get_by_ids(
                user_liked['blogs'], 
                request.page, 
                request.limit
            )
        return await run_sync(_get_blogs)
    
    elif request.type == "reviews":
        def _get_reviews() -> dict[str, Any]:
            return ReviewService.get_by_ids(
                user_liked['reviews'],
                request.page,
                request.limit
            )
        return await run_sync(_get_reviews)
    
    elif request.type == "projects":
        def _get_projects() -> dict[str, Any]:
            return TimelineService.get_by_ids(
                user_liked['projects'],
                request.page,
                request.limit
            )
        return await run_sync(_get_projects)
    
    raise HTTPException(status_code=400, detail=f"Invalid content type: {request.type}")


@router.post("/liked/authors")
async def get_liked_authors(
    request: LikedContentRequest,
    db: AsyncSession = Depends(get_user_db)
) -> dict[str, list[str]]:
    """Get unique authors from user's liked content."""
    user_liked = await UserService.get_liked_content(db, request.user_id)
    
    if request.type == "blogs" and user_liked['blogs']:
        authors = await run_sync(BlogService.get_authors_by_ids, user_liked['blogs'])
        return {"authors": authors}
    
    elif request.type == "reviews" and user_liked['reviews']:
        authors = await run_sync(ReviewService.get_authors_by_ids, user_liked['reviews'])
        return {"authors": authors}
    
    return {"authors": []}


@router.post("/liked/tags")
async def get_liked_tags(
    request: LikedContentRequest,
    db: AsyncSession = Depends(get_user_db)
) -> dict[str, list[str]]:
    """Get unique tags from user's liked content."""
    user_liked = await UserService.get_liked_content(db, request.user_id)
    
    if request.type == "blogs" and user_liked['blogs']:
        tags = await run_sync(BlogService.get_tags_by_ids, user_liked['blogs'])
        return {"tags": tags}
    
    elif request.type == "reviews" and user_liked['reviews']:
        tags = await run_sync(ReviewService.get_tags_by_ids, user_liked['reviews'])
        return {"tags": tags}
    
    return {"tags": []}


@router.post("/liked/search")
async def search_liked_content(
    request: SearchRequest,
    db: AsyncSession = Depends(get_user_db)
) -> dict[str, Any]:
    """Search within user's liked content."""
    user_liked = await UserService.get_liked_content(db, request.user_id)
    
    tags_list = [t.strip() for t in request.tags.split(",") if t.strip()]
    
    if request.type == "blogs":
        def _search_blogs() -> dict[str, Any]:
            return UserService.search_liked_blogs(
                liked_ids=user_liked['blogs'],
                query=request.query,
                tags=tags_list if tags_list else None,
                author=request.author,
                page=request.page,
                limit=request.limit
            )
        return await run_sync(_search_blogs)
    
    elif request.type == "reviews":
        def _search_reviews() -> dict[str, Any]:
            return UserService.search_liked_reviews(
                liked_ids=user_liked['reviews'],
                query=request.query,
                tags=tags_list if tags_list else None,
                author=request.author,
                page=request.page,
                limit=request.limit
            )
        return await run_sync(_search_reviews)
    
    raise HTTPException(
        status_code=400, 
        detail=f"Search not supported for content type: {request.type}"
    )
