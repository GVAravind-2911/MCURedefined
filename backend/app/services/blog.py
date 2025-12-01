"""Blog service for handling blog post operations."""

from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from ..models.content import BlogPost, BlogTag
from ..core.storage import process_image
from ..core.cache import cache
from ..core.logging import get_logger
from .base import BaseContentService, get_session, DATETIME_FORMAT

logger = get_logger(__name__)


class BlogService(BaseContentService):
    """Service for blog post operations."""
    
    model = BlogPost
    tag_model = BlogTag
    item_id_field = "blog_id"
    cache_prefix = "blog"
    
    @classmethod
    def _get_tags(cls, item_id: int, session: Optional[Session] = None) -> list[str]:
        """Get tags for a blog post."""
        cache_key = f"blog_tags_by_id:{item_id}"
        cached = cache.get_sync(cache_key)
        if cached is not None:
            return cached
        
        if session is None:
            with get_session() as new_session:
                tags = new_session.query(BlogTag.tag).filter(BlogTag.blog_id == item_id).all()
                result = [tag[0] for tag in tags]
        else:
            tags = session.query(BlogTag.tag).filter(BlogTag.blog_id == item_id).all()
            result = [tag[0] for tag in tags]
        
        cache.set_sync(cache_key, result, ttl=30)
        return result
    
    @classmethod
    def _add_tags(cls, item_id: int, tags: list[str]) -> None:
        """Add tags for a blog post."""
        with get_session() as session:
            # Remove existing tags
            session.query(BlogTag).filter(BlogTag.blog_id == item_id).delete()
            
            # Add new tags
            for tag in tags:
                session.add(BlogTag(blog_id=item_id, tag=tag))
        
        cache.delete_sync(f"blog_tags_by_id:{item_id}")
        cache.delete_sync("blog_all_tags")
    
    @classmethod
    def create(
        cls,
        title: str,
        author: str,
        description: str,
        content: list[dict],
        tags: list[str],
        thumbnail_path: dict,
        author_id: Optional[str] = None
    ) -> int:
        """Create a new blog post."""
        logger.debug(
            f"BlogService.create called for '{title}'",
            **{
                "blog.title": title,
                "blog.author": author,
                "blog.author_id": author_id,
                "blog.tags": tags,
                "blog.content_blocks": len(content),
            }
        )
        
        try:
            # Process thumbnail - use default if not a base64 image (new upload required)
            logger.debug("Processing thumbnail image")
            thumbnail = process_image(thumbnail_path, use_default_if_not_base64=True)
            
            # Process content images
            logger.debug(f"Processing {len(content)} content blocks")
            processed_content = []
            for i, block in enumerate(content):
                if block.get("type") == "image":
                    logger.debug(f"Processing image in content block {i}")
                    block["content"] = process_image(block.get("content", {}))
                processed_content.append(block)
            
            logger.debug("Saving blog post to database")
            with get_session() as session:
                post = BlogPost(
                    title=title,
                    author=author,
                    author_id=author_id,
                    description=description,
                    content=processed_content,
                    thumbnail_path=thumbnail,
                    created_at=datetime.now().strftime(DATETIME_FORMAT),
                    updated_at=""
                )
                session.add(post)
                session.flush()
                blog_id: int = int(post.id)  # type: ignore[arg-type]
            
            logger.debug(f"Blog post saved with ID {blog_id}, adding tags")
            # Add tags
            cls._add_tags(blog_id, tags)
            cls._invalidate_cache()
            
            logger.info(
                f"Blog post created successfully with ID {blog_id}",
                **{"blog.id": blog_id, "blog.title": title}
            )
            
            return blog_id
            
        except Exception as e:
            logger.error(
                f"Failed to create blog post: {str(e)}",
                exc_info=True,
                **{
                    "blog.title": title,
                    "error.type": type(e).__name__,
                    "error.message": str(e),
                }
            )
            raise
    
    @classmethod
    def update(
        cls,
        blog_id: int,
        title: str,
        author: str,
        description: str,
        content: list[dict],
        tags: list[str],
        thumbnail_path: dict,
        author_id: Optional[str] = None
    ) -> bool:
        """Update an existing blog post."""
        # Process thumbnail
        thumbnail = process_image(thumbnail_path)
        
        # Process content images
        processed_content = []
        for block in content:
            if block.get("type") == "image":
                block["content"] = process_image(block.get("content", {}))
            processed_content.append(block)
        
        with get_session() as session:
            post = session.query(BlogPost).filter(BlogPost.id == blog_id).first()
            
            if not post:
                return False
            
            post.title = title  # type: ignore[assignment]
            post.author = author  # type: ignore[assignment]
            if author_id is not None:
                post.author_id = author_id  # type: ignore[assignment]
            post.description = description  # type: ignore[assignment]
            post.content = processed_content  # type: ignore[assignment]
            post.thumbnail_path = thumbnail  # type: ignore[assignment]
            post.updated_at = datetime.now().strftime(DATETIME_FORMAT)  # type: ignore[assignment]
        
        # Update tags
        cls._add_tags(blog_id, tags)
        cls._invalidate_cache(blog_id)
        
        return True
    
    @classmethod
    def delete(cls, blog_id: int) -> bool:
        """Delete a blog post."""
        with get_session() as session:
            post = session.query(BlogPost).filter(BlogPost.id == blog_id).first()
            
            if not post:
                return False
            
            session.delete(post)
        
        cls._invalidate_cache(blog_id)
        return True
    
    @classmethod
    def get_recent(cls) -> Optional[dict]:
        """Get the most recent blog post."""
        cache_key = "blog_recent"
        cached = cache.get_sync(cache_key)
        if cached is not None:
            return cached
        
        with get_session() as session:
            post = (
                session.query(BlogPost)
                .order_by(BlogPost.created_at.desc())
                .first()
            )
            
            if not post:
                return None
            
            result = cls._process_item(post, session)
            cache.set_sync(cache_key, result, ttl=60)
            return result
    
    @classmethod
    def search(
        cls,
        query: str = "",
        tags: Optional[list[str]] = None,
        author: str = "",
        author_id: str = "",
        page: int = 1,
        limit: int = 5
    ) -> dict:
        """Search blogs - returns with 'blogs' key for API compatibility."""
        result = super().search(query, tags, author, author_id, page, limit)
        result["blogs"] = result.pop("items")
        return result
    
    @classmethod
    def get_by_ids(cls, ids: list[int], page: int = 1, limit: int = 5) -> dict:
        """Get blogs by IDs - returns with 'blogs' key for API compatibility."""
        result = super().get_by_ids(ids, page, limit)
        result["blogs"] = result.pop("items")
        return result
