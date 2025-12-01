"""Base service with common functionality."""

import json
from math import ceil
from typing import Optional, Any
from datetime import datetime
from contextlib import contextmanager

from sqlalchemy.orm import Session as SQLASession

from ..core.database import ContentSessionLocal
from ..core.cache import cache


DATETIME_FORMAT = "%Y/%m/%d %H:%M:%S"


@contextmanager
def get_session():
    """Context manager for database sessions."""
    session = ContentSessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def parse_json_field(value: Any) -> Any:
    """Parse JSON string to dict/list if needed."""
    if isinstance(value, str):
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return value
    return value


class BaseContentService:
    """Base service for content operations."""
    
    model: Any = None
    tag_model: Any = None
    item_id_field: str = ""
    cache_prefix: str = ""
    
    @classmethod
    def _get_tags(cls, item_id: int, session: Optional[SQLASession] = None) -> list[str]:
        """Get tags for an item. Override in subclass."""
        return []
    
    @classmethod
    def _add_tags(cls, item_id: int, tags: list[str]) -> None:
        """Add tags for an item. Override in subclass."""
        pass
    
    @classmethod
    def _process_item(cls, item: Any, session: Optional[SQLASession] = None) -> dict:
        """Process item to dict with tags and parsed JSON."""
        item_dict = item.to_dict()
        
        # Get tags
        item_dict['tags'] = cls._get_tags(item.id, session)
        
        # Parse JSON fields
        for field in ['content', 'thumbnail_path']:
            if field in item_dict:
                item_dict[field] = parse_json_field(item_dict[field])
        
        return item_dict
    
    @classmethod
    def count(cls) -> int:
        """Get total count of items."""
        cache_key = f"{cls.cache_prefix}_count"
        cached = cache.get_sync(cache_key)
        if cached is not None:
            return cached
        
        with get_session() as session:
            count = session.query(cls.model).count()
            cache.set_sync(cache_key, count, ttl=60)
            return count
    
    @classmethod
    def get_paginated(cls, page: int = 1, limit: int = 5) -> list[dict]:
        """Get paginated items."""
        cache_key = f"{cls.cache_prefix}_paginated:{page}:{limit}"
        cached = cache.get_sync(cache_key)
        if cached is not None:
            return cached
        
        with get_session() as session:
            total = session.query(cls.model).count()
            offset = (page - 1) * limit
            
            if offset >= total:
                return []
            
            items = (
                session.query(cls.model)
                .order_by(cls.model.created_at.desc())
                .offset(offset)
                .limit(limit)
                .all()
            )
            
            result = [cls._process_item(item, session) for item in items]
            cache.set_sync(cache_key, result, ttl=30)
            return result
    
    @classmethod
    def get_by_id(cls, item_id: int) -> Optional[dict]:
        """Get single item by ID."""
        cache_key = f"{cls.cache_prefix}_by_id:{item_id}"
        cached = cache.get_sync(cache_key)
        if cached is not None:
            return cached
        
        with get_session() as session:
            item = session.query(cls.model).filter(cls.model.id == item_id).first()
            
            if not item:
                return None
            
            result = cls._process_item(item, session)
            cache.set_sync(cache_key, result, ttl=10)
            return result
    
    @classmethod
    def get_by_ids(cls, ids: list[int], page: int = 1, limit: int = 5) -> dict:
        """Get items by IDs with pagination."""
        if not ids:
            return {"items": [], "total": 0, "total_pages": 0, "page": page}
        
        total = len(ids)
        start_idx = (page - 1) * limit
        end_idx = min(start_idx + limit, total)
        page_ids = ids[start_idx:end_idx]
        
        with get_session() as session:
            items = []
            for item_id in page_ids:
                item = session.query(cls.model).filter(cls.model.id == item_id).first()
                if item:
                    items.append(cls._process_item(item, session))
            
            return {
                "items": items,
                "total": total,
                "total_pages": ceil(total / limit),
                "page": page
            }
    
    @classmethod
    def get_latest(cls, limit: int = 3) -> list[dict]:
        """Get latest items."""
        cache_key = f"{cls.cache_prefix}_latest:{limit}"
        cached = cache.get_sync(cache_key)
        if cached is not None:
            return cached
        
        with get_session() as session:
            items = (
                session.query(cls.model)
                .with_entities(
                    cls.model.id,
                    cls.model.title,
                    cls.model.author,
                    cls.model.author_id,
                    cls.model.created_at,
                    cls.model.thumbnail_path
                )
                .order_by(cls.model.created_at.desc())
                .limit(limit)
                .all()
            )
            
            result = []
            for item in items:
                item_dict = {
                    'id': item.id,
                    'title': item.title,
                    'author': item.author,
                    'author_id': item.author_id,
                    'created_at': item.created_at,
                    'thumbnail_path': parse_json_field(item.thumbnail_path)
                }
                result.append(item_dict)
            
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
        """Search items by query, tags, author, or author_id."""
        items = []
        total = 0
        
        with get_session() as session:
            # Search by tags
            if tags and cls.tag_model:
                item_ids = None
                for tag in tags:
                    tag_items = set([
                        row[0] for row in session.query(
                            getattr(cls.tag_model, cls.item_id_field)
                        ).filter(cls.tag_model.tag == tag).all()
                    ])
                    item_ids = tag_items if item_ids is None else item_ids.intersection(tag_items)
                
                if item_ids:
                    total = len(item_ids)
                    start_idx = (page - 1) * limit
                    page_ids = list(item_ids)[start_idx:start_idx + limit]
                    
                    for item_id in page_ids:
                        item = session.query(cls.model).filter(cls.model.id == item_id).first()
                        if item:
                            items.append(cls._process_item(item, session))
            
            # Search by author_id (exact match)
            elif author_id:
                base_query = session.query(cls.model).filter(
                    cls.model.author_id == author_id
                )
                total = base_query.count()
                
                results = base_query.order_by(cls.model.created_at.desc()).offset((page-1)*limit).limit(limit)
                items = [cls._process_item(item, session) for item in results]
            
            # Search by author name
            elif author:
                base_query = session.query(cls.model).filter(
                    cls.model.author.ilike(f'%{author}%')
                )
                total = base_query.count()
                
                results = base_query.order_by(cls.model.created_at.desc()).offset((page-1)*limit).limit(limit)
                items = [cls._process_item(item, session) for item in results]
            
            # Search by title/description
            elif query:
                import sqlalchemy
                base_query = session.query(cls.model).filter(
                    sqlalchemy.or_(
                        cls.model.title.ilike(f'%{query}%'),
                        cls.model.description.ilike(f'%{query}%')
                    )
                )
                total = base_query.count()
                
                results = base_query.order_by(cls.model.created_at.desc()).offset((page-1)*limit).limit(limit)
                items = [cls._process_item(item, session) for item in results]
        
        return {
            "items": items,
            "total": total,
            "total_pages": ceil(total / limit) if total > 0 else 0,
            "page": page
        }
    
    @classmethod
    def get_all_tags(cls) -> list[str]:
        """Get all unique tags."""
        if not cls.tag_model:
            return []
        
        cache_key = f"{cls.cache_prefix}_all_tags"
        cached = cache.get_sync(cache_key)
        if cached is not None:
            return cached
        
        with get_session() as session:
            tags = session.query(cls.tag_model.tag).distinct().all()
            result = sorted([tag[0] for tag in tags])
            cache.set_sync(cache_key, result, ttl=60)
            return result
    
    @classmethod
    def get_all_authors(cls) -> list[str]:
        """Get all unique authors."""
        cache_key = f"{cls.cache_prefix}_all_authors"
        cached = cache.get_sync(cache_key)
        if cached is not None:
            return cached
        
        with get_session() as session:
            authors = session.query(cls.model.author).distinct().all()
            result = sorted([author[0] for author in authors])
            cache.set_sync(cache_key, result, ttl=60)
            return result
    
    @classmethod
    def get_authors_by_ids(cls, ids: list[int]) -> list[str]:
        """Get unique authors for given IDs."""
        if not ids:
            return []
        
        with get_session() as session:
            authors = session.query(cls.model.author).filter(
                cls.model.id.in_(ids)
            ).distinct().all()
            return sorted([author[0] for author in authors if author[0]])
    
    @classmethod
    def get_tags_by_ids(cls, ids: list[int]) -> list[str]:
        """Get unique tags for given IDs."""
        if not ids or not cls.tag_model:
            return []
        
        tags = set()
        for item_id in ids:
            item_tags = cls._get_tags(item_id)
            tags.update(item_tags)
        
        return sorted(list(tags))
    
    @classmethod
    def _invalidate_cache(cls, item_id: Optional[int] = None) -> None:
        """Invalidate caches after updates."""
        cache.delete_sync(f"{cls.cache_prefix}_count")
        cache.delete_sync(f"{cls.cache_prefix}_all_tags")
        cache.delete_sync(f"{cls.cache_prefix}_all_authors")
        
        # Clear paginated caches (simple approach - clear common pages)
        for page in range(1, 10):
            for limit in [3, 5, 10]:
                cache.delete_sync(f"{cls.cache_prefix}_paginated:{page}:{limit}")
        
        if item_id:
            cache.delete_sync(f"{cls.cache_prefix}_by_id:{item_id}")
