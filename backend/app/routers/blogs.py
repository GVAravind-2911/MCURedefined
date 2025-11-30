"""Blog API routes."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Any

from ..schemas.content import (
    BlogCreate,
    BlogUpdate,
    BlogResponse,
    BlogListResponse,
    TagsResponse,
    AuthorsResponse,
)
from ..services.blog import BlogService
from ..core.dependencies import get_current_admin
from ..core.logging import get_logger
from ..core.async_utils import run_sync

router = APIRouter(prefix="/blogs", tags=["blogs"])
logger = get_logger(__name__)


@router.get("", response_model=BlogListResponse)
async def get_blogs(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=5, ge=1, le=50)
) -> dict[str, Any]:
    """Get paginated blog posts."""
    total = await run_sync(BlogService.count)
    blogs = await run_sync(BlogService.get_paginated, page, limit)
    
    return {"blogs": blogs, "total": total}


@router.get("/latest")
async def get_latest_blogs() -> list[dict[str, Any]]:
    """Get the 3 most recent blog posts."""
    return await run_sync(BlogService.get_latest, 3)


@router.get("/recent")
async def get_recent_blog() -> dict[str, Any]:
    """Get the most recent blog post."""
    result = await run_sync(BlogService.get_recent)
    if not result:
        raise HTTPException(status_code=404, detail="No blogs found")
    return result


@router.get("/search")
async def search_blogs(
    query: str = Query(default=""),
    tags: str = Query(default=""),
    author: str = Query(default=""),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=5, ge=1, le=50)
) -> dict[str, Any]:
    """Search blog posts by query, tags, or author."""
    tags_list = [t.strip() for t in tags.split(",") if t.strip()]
    
    def _search() -> dict[str, Any]:
        return BlogService.search(
            query=query.lower(),
            tags=tags_list if tags_list else None,
            author=author,
            page=page,
            limit=limit
        )
    
    return await run_sync(_search)


@router.get("/tags", response_model=TagsResponse)
async def get_all_tags() -> dict[str, list[str]]:
    """Get all unique blog tags."""
    tags = await run_sync(BlogService.get_all_tags)
    return {"tags": tags}


@router.get("/authors", response_model=AuthorsResponse)
async def get_all_authors() -> dict[str, list[str]]:
    """Get all unique blog authors."""
    authors = await run_sync(BlogService.get_all_authors)
    return {"authors": authors}


@router.get("/{blog_id}", response_model=BlogResponse)
async def get_blog(blog_id: int) -> dict[str, Any]:
    """Get a single blog post by ID."""
    blog = await run_sync(BlogService.get_by_id, blog_id)
    
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    return blog


@router.post("/create")
async def create_blog(
    blog: BlogCreate,
    _: bool = Depends(get_current_admin)
) -> dict[str, Any]:
    """Create a new blog post. Requires admin authentication."""
    logger.info(
        "Creating new blog post",
        **{
            "blog.title": blog.title,
            "blog.author": blog.author,
            "blog.tags": blog.tags,
            "blog.content_blocks": len(blog.content),
        }
    )
    
    try:
        def _create() -> int:
            logger.debug(
                "Executing BlogService.create",
                **{
                    "blog.title": blog.title,
                    "thumbnail_path": str(blog.thumbnail_path.model_dump()),
                }
            )
            return BlogService.create(
                title=blog.title,
                author=blog.author,
                description=blog.description or "",
                content=[block.model_dump() for block in blog.content],
                tags=blog.tags,
                thumbnail_path=blog.thumbnail_path.model_dump()
            )
        
        blog_id = await run_sync(_create)
        
        logger.info(
            "Blog post created successfully",
            **{
                "blog.id": blog_id,
                "blog.title": blog.title,
            }
        )
        
        return {"message": "Blog created successfully", "id": blog_id}
    except Exception as e:
        logger.error(
            f"Failed to create blog post: {str(e)}",
            exc_info=True,
            **{
                "blog.title": blog.title,
                "error.type": type(e).__name__,
                "error.message": str(e),
            }
        )
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/update/{blog_id}")
async def update_blog(
    blog_id: int,
    blog: BlogUpdate,
    _: bool = Depends(get_current_admin)
) -> dict[str, str]:
    """Update a blog post. Requires admin authentication."""
    logger.info(
        f"Updating blog post {blog_id}",
        **{
            "blog.id": blog_id,
            "blog.title": blog.title,
        }
    )
    
    try:
        def _update() -> bool:
            return BlogService.update(
                blog_id=blog_id,
                title=blog.title,
                author=blog.author,
                description=blog.description or "",
                content=[block.model_dump() for block in blog.content],
                tags=blog.tags,
                thumbnail_path=blog.thumbnail_path.model_dump()
            )
        
        success = await run_sync(_update)
        
        if not success:
            logger.warning(f"Blog post {blog_id} not found for update", **{"blog.id": blog_id})
            raise HTTPException(status_code=404, detail="Blog not found")
        
        logger.info(f"Blog post {blog_id} updated successfully", **{"blog.id": blog_id})
        return {"message": "Blog updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Failed to update blog post {blog_id}: {str(e)}",
            exc_info=True,
            **{
                "blog.id": blog_id,
                "error.type": type(e).__name__,
                "error.message": str(e),
            }
        )
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{blog_id}")
async def delete_blog(
    blog_id: int,
    _: bool = Depends(get_current_admin)
) -> dict[str, str]:
    """Delete a blog post. Requires admin authentication."""
    logger.info(f"Deleting blog post {blog_id}", **{"blog.id": blog_id})
    
    success = await run_sync(BlogService.delete, blog_id)
    
    if not success:
        logger.warning(f"Blog post {blog_id} not found for deletion", **{"blog.id": blog_id})
        raise HTTPException(status_code=404, detail="Blog not found")
    
    logger.info(f"Blog post {blog_id} deleted successfully", **{"blog.id": blog_id})
    return {"message": "Blog deleted successfully"}
