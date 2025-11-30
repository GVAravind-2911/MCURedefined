"""Review API routes."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Any

from ..schemas.content import (
    ReviewCreate,
    ReviewUpdate,
    ReviewResponse,
    ReviewListResponse,
    TagsResponse,
    AuthorsResponse,
)
from ..services.review import ReviewService
from ..core.dependencies import get_current_admin
from ..core.async_utils import run_sync

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.get("", response_model=ReviewListResponse)
async def get_reviews(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=5, ge=1, le=50)
) -> dict[str, Any]:
    """Get paginated reviews."""
    total = await run_sync(ReviewService.count)
    reviews = await run_sync(ReviewService.get_paginated, page, limit)
    
    return {"blogs": reviews, "total": total}


@router.get("/latest")
async def get_latest_reviews() -> list[dict[str, Any]]:
    """Get the 3 most recent reviews."""
    return await run_sync(ReviewService.get_latest, 3)


@router.get("/search")
async def search_reviews(
    query: str = Query(default=""),
    tags: str = Query(default=""),
    author: str = Query(default=""),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=5, ge=1, le=50)
) -> dict[str, Any]:
    """Search reviews by query, tags, or author."""
    tags_list = [t.strip() for t in tags.split(",") if t.strip()]
    
    def _search() -> dict[str, Any]:
        return ReviewService.search(
            query=query.lower(),
            tags=tags_list if tags_list else None,
            author=author,
            page=page,
            limit=limit
        )
    
    return await run_sync(_search)


@router.get("/tags", response_model=TagsResponse)
async def get_all_tags() -> dict[str, list[str]]:
    """Get all unique review tags."""
    tags = await run_sync(ReviewService.get_all_tags)
    return {"tags": tags}


@router.get("/authors", response_model=AuthorsResponse)
async def get_all_authors() -> dict[str, list[str]]:
    """Get all unique review authors."""
    authors = await run_sync(ReviewService.get_all_authors)
    return {"authors": authors}


@router.get("/{review_id}", response_model=ReviewResponse)
async def get_review(review_id: int) -> dict[str, Any]:
    """Get a single review by ID."""
    review = await run_sync(ReviewService.get_by_id, review_id)
    
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    return review


@router.post("/create")
async def create_review(
    review: ReviewCreate,
    _: bool = Depends(get_current_admin)
) -> dict[str, Any]:
    """Create a new review. Requires admin authentication."""
    try:
        def _create() -> int:
            return ReviewService.create(
                title=review.title,
                author=review.author,
                description=review.description or "",
                content=[block.model_dump() for block in review.content],
                tags=review.tags,
                thumbnail_path=review.thumbnail_path.model_dump()
            )
        
        review_id = await run_sync(_create)
        return {"message": "Review created successfully", "id": review_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/update/{review_id}")
async def update_review(
    review_id: int,
    review: ReviewUpdate,
    _: bool = Depends(get_current_admin)
) -> dict[str, str]:
    """Update a review. Requires admin authentication."""
    try:
        def _update() -> bool:
            return ReviewService.update(
                review_id=review_id,
                title=review.title,
                author=review.author,
                description=review.description or "",
                content=[block.model_dump() for block in review.content],
                tags=review.tags,
                thumbnail_path=review.thumbnail_path.model_dump()
            )
        
        success = await run_sync(_update)
        
        if not success:
            raise HTTPException(status_code=404, detail="Review not found")
        
        return {"message": "Review updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{review_id}")
async def delete_review(
    review_id: int,
    _: bool = Depends(get_current_admin)
) -> dict[str, str]:
    """Delete a review. Requires admin authentication."""
    success = await run_sync(ReviewService.delete, review_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Review not found")
    
    return {"message": "Review deleted successfully"}
