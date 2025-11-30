"""Review service for handling review operations."""

from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from ..models.content import Reviews, ReviewTag
from ..core.storage import process_image
from ..core.cache import cache
from .base import BaseContentService, get_session, DATETIME_FORMAT


class ReviewService(BaseContentService):
    """Service for review operations."""
    
    model = Reviews
    tag_model = ReviewTag
    item_id_field = "review_id"
    cache_prefix = "review"
    
    @classmethod
    def _get_tags(cls, item_id: int, session: Optional[Session] = None) -> list[str]:
        """Get tags for a review."""
        cache_key = f"review_tags_by_id:{item_id}"
        cached = cache.get_sync(cache_key)
        if cached is not None:
            return cached
        
        if session is None:
            with get_session() as new_session:
                tags = new_session.query(ReviewTag.tag).filter(ReviewTag.review_id == item_id).all()
                result = [tag[0] for tag in tags]
        else:
            tags = session.query(ReviewTag.tag).filter(ReviewTag.review_id == item_id).all()
            result = [tag[0] for tag in tags]
        
        cache.set_sync(cache_key, result, ttl=30)
        return result
    
    @classmethod
    def _add_tags(cls, item_id: int, tags: list[str]) -> None:
        """Add tags for a review."""
        with get_session() as session:
            # Remove existing tags
            session.query(ReviewTag).filter(ReviewTag.review_id == item_id).delete()
            
            # Add new tags
            for tag in tags:
                session.add(ReviewTag(review_id=item_id, tag=tag))
        
        cache.delete_sync(f"review_tags_by_id:{item_id}")
        cache.delete_sync("review_all_tags")
    
    @classmethod
    def create(
        cls,
        title: str,
        author: str,
        description: str,
        content: list[dict],
        tags: list[str],
        thumbnail_path: dict
    ) -> int:
        """Create a new review."""
        # Process thumbnail - use default if not a base64 image (new upload required)
        thumbnail = process_image(thumbnail_path, use_default_if_not_base64=True)
        
        # Process content images
        processed_content = []
        for block in content:
            if block.get("type") == "image":
                block["content"] = process_image(block.get("content", {}))
            processed_content.append(block)
        
        with get_session() as session:
            review = Reviews(
                title=title,
                author=author,
                description=description,
                content=processed_content,
                thumbnail_path=thumbnail,
                created_at=datetime.now().strftime(DATETIME_FORMAT),
                updated_at=""
            )
            session.add(review)
            session.flush()
            review_id: int = int(review.id)  # type: ignore[arg-type]
        
        # Add tags
        cls._add_tags(review_id, tags)
        cls._invalidate_cache()
        
        return review_id
    
    @classmethod
    def update(
        cls,
        review_id: int,
        title: str,
        author: str,
        description: str,
        content: list[dict],
        tags: list[str],
        thumbnail_path: dict
    ) -> bool:
        """Update an existing review."""
        # Process thumbnail
        thumbnail = process_image(thumbnail_path)
        
        # Process content images
        processed_content = []
        for block in content:
            if block.get("type") == "image":
                block["content"] = process_image(block.get("content", {}))
            processed_content.append(block)
        
        with get_session() as session:
            review = session.query(Reviews).filter(Reviews.id == review_id).first()
            
            if not review:
                return False
            
            review.title = title  # type: ignore[assignment]
            review.author = author  # type: ignore[assignment]
            review.description = description  # type: ignore[assignment]
            review.content = processed_content  # type: ignore[assignment]
            review.thumbnail_path = thumbnail  # type: ignore[assignment]
            review.updated_at = datetime.now().strftime(DATETIME_FORMAT)  # type: ignore[assignment]
        
        # Update tags
        cls._add_tags(review_id, tags)
        cls._invalidate_cache(review_id)
        
        return True
    
    @classmethod
    def delete(cls, review_id: int) -> bool:
        """Delete a review."""
        with get_session() as session:
            review = session.query(Reviews).filter(Reviews.id == review_id).first()
            
            if not review:
                return False
            
            session.delete(review)
        
        cls._invalidate_cache(review_id)
        return True
    
    @classmethod
    def search(
        cls,
        query: str = "",
        tags: Optional[list[str]] = None,
        author: str = "",
        page: int = 1,
        limit: int = 5
    ) -> dict:
        """Search reviews - returns with 'blogs' key for API compatibility."""
        result = super().search(query, tags, author, page, limit)
        result["blogs"] = result.pop("items")
        return result
    
    @classmethod
    def get_by_ids(cls, ids: list[int], page: int = 1, limit: int = 5) -> dict:
        """Get reviews by IDs - returns with 'reviews' key for API compatibility."""
        result = super().get_by_ids(ids, page, limit)
        result["reviews"] = result.pop("items")
        return result
