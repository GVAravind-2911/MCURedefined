"""Timeline service for handling MCU project timeline operations."""

from math import ceil
from typing import Optional

from ..models.content import Timeline
from ..core.cache import cache
from .base import get_session


class TimelineService:
    """Service for timeline/project operations."""
    
    cache_prefix = "timeline"
    
    @classmethod
    def count(cls) -> int:
        """Get total count of timeline projects."""
        cache_key = f"{cls.cache_prefix}_count"
        cached = cache.get_sync(cache_key)
        if cached is not None:
            return cached
        
        with get_session() as session:
            count = session.query(Timeline).count()
            cache.set_sync(cache_key, count, ttl=300)
            return count
    
    @classmethod
    def get_all(cls) -> list[dict]:
        """Get all timeline projects."""
        cache_key = f"{cls.cache_prefix}_all"
        cached = cache.get_sync(cache_key)
        if cached is not None:
            return cached
        
        with get_session() as session:
            projects = session.query(Timeline).all()
            result = [project.to_dict() for project in projects]
            cache.set_sync(cache_key, result, ttl=300)
            return result
    
    @classmethod
    def get_paginated(cls, page: int = 1, limit: int = 10) -> dict:
        """Get paginated timeline projects."""
        cache_key = f"{cls.cache_prefix}_paginated:{page}:{limit}"
        cached = cache.get_sync(cache_key)
        if cached is not None:
            return cached
        
        with get_session() as session:
            total = session.query(Timeline).count()
            offset = (page - 1) * limit
            
            if offset >= total:
                return {
                    "projects": [],
                    "total": total,
                    "total_pages": ceil(total / limit) if total > 0 else 0,
                    "page": page
                }
            
            projects = (
                session.query(Timeline)
                .order_by(Timeline.phase.asc(), Timeline.id.asc())
                .offset(offset)
                .limit(limit)
                .all()
            )
            
            result = {
                "projects": [project.to_dict() for project in projects],
                "total": total,
                "total_pages": ceil(total / limit),
                "page": page
            }
            cache.set_sync(cache_key, result, ttl=120)
            return result
    
    @classmethod
    def search(
        cls,
        query: str = "",
        phase: Optional[int] = None,
        page: int = 1,
        limit: int = 10
    ) -> dict:
        """Search timeline projects by name or filter by phase."""
        with get_session() as session:
            base_query = session.query(Timeline)
            
            if phase is not None:
                base_query = base_query.filter(Timeline.phase == phase)
            
            if query:
                base_query = base_query.filter(Timeline.name.ilike(f'%{query}%'))
            
            total = base_query.count()
            offset = (page - 1) * limit
            
            projects = (
                base_query
                .order_by(Timeline.phase.asc(), Timeline.id.asc())
                .offset(offset)
                .limit(limit)
                .all()
            )
            
            return {
                "projects": [project.to_dict() for project in projects],
                "total": total,
                "total_pages": ceil(total / limit) if total > 0 else 0,
                "page": page
            }
    
    @classmethod
    def get_by_id(cls, project_id: int) -> Optional[dict]:
        """Get a single project by ID."""
        cache_key = f"{cls.cache_prefix}_id:{project_id}"
        cached = cache.get_sync(cache_key)
        if cached is not None:
            return cached
        
        with get_session() as session:
            project = session.query(Timeline).filter(Timeline.id == project_id).first()
            
            if not project:
                return None
            
            result = project.to_dict()
            cache.set_sync(cache_key, result, ttl=60)
            return result
    
    @classmethod
    def get_by_phase(cls, phase: int) -> list[dict]:
        """Get all projects in a phase."""
        cache_key = f"{cls.cache_prefix}_phase:{phase}"
        cached = cache.get_sync(cache_key)
        if cached is not None:
            return cached
        
        with get_session() as session:
            projects = session.query(Timeline).filter(Timeline.phase == phase).all()
            result = [project.to_dict() for project in projects]
            cache.set_sync(cache_key, result, ttl=60)
            return result
    
    @classmethod
    def get_by_ids(cls, ids: list[int], page: int = 1, limit: int = 5) -> dict:
        """Get projects by IDs with pagination."""
        if not ids:
            return {"projects": [], "total": 0, "total_pages": 0, "page": page}
        
        total = len(ids)
        start_idx = (page - 1) * limit
        end_idx = min(start_idx + limit, total)
        page_ids = ids[start_idx:end_idx]
        
        with get_session() as session:
            items = []
            for project_id in page_ids:
                project = session.query(Timeline).filter(Timeline.id == project_id).first()
                if project:
                    items.append(project.to_dict())
            
            return {
                "projects": items,
                "total": total,
                "total_pages": ceil(total / limit),
                "page": page
            }
