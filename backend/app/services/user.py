"""User service for handling user-related operations."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Optional
from math import ceil

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.user import User, Session, BlogLike, ReviewLike, ProjectLike
from .blog import BlogService
from .review import ReviewService


class UserService:
    """Service for user-related operations."""
    
    @staticmethod
    async def get_user_from_token(db: AsyncSession, token: str) -> Optional[dict]:
        """Get user details from session token."""
        if not token:
            return None
        
        try:
            # Get valid session
            stmt = select(Session).where(
                Session.token == token,
                Session.expires_at > datetime.now()
            )
            result = await db.execute(stmt)
            session = result.scalar_one_or_none()
            
            if not session:
                return None
            
            # Get user
            user_stmt = select(User).where(User.id == session.user_id)
            user_result = await db.execute(user_stmt)
            user = user_result.scalar_one_or_none()
            
            if not user:
                return None
            
            return {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "email_verified": user.email_verified,
                "image": user.image,
                "role": user.role,
                "username": user.username,
                "display_username": user.display_username
            }
            
        except Exception as e:
            print(f"Error getting user from token: {e}")
            return None
    
    @staticmethod
    async def get_liked_content(db: AsyncSession, user_id: str) -> dict:
        """Get all liked content IDs for a user."""
        try:
            # Get liked blogs
            blog_stmt = select(BlogLike.blog_id).where(BlogLike.user_id == user_id)
            blog_result = await db.execute(blog_stmt)
            blogs = [row[0] for row in blog_result.all()]
            
            # Get liked reviews
            review_stmt = select(ReviewLike.review_id).where(ReviewLike.user_id == user_id)
            review_result = await db.execute(review_stmt)
            reviews = [row[0] for row in review_result.all()]
            
            # Get liked projects
            project_stmt = select(ProjectLike.project_id).where(ProjectLike.user_id == user_id)
            project_result = await db.execute(project_stmt)
            projects = [row[0] for row in project_result.all()]
            
            return {
                "blogs": blogs,
                "reviews": reviews,
                "projects": projects
            }
            
        except Exception as e:
            print(f"Error getting liked content: {e}")
            return {"blogs": [], "reviews": [], "projects": []}
    
    @staticmethod
    def search_liked_blogs(
        liked_ids: list[int],
        query: str = "",
        tags: Optional[list[str]] = None,
        author: str = "",
        page: int = 1,
        limit: int = 5
    ) -> dict[str, Any]:
        """Search within user's liked blogs."""
        if not liked_ids:
            return {"blogs": [], "total": 0, "total_pages": 0, "page": page}
        
        # Get all liked blogs
        all_blogs = []
        for blog_id in liked_ids:
            blog = BlogService.get_by_id(blog_id)
            if blog:
                all_blogs.append(blog)
        
        # Filter based on criteria
        filtered = []
        for blog in all_blogs:
            # Check query match
            title_match = query.lower() in blog['title'].lower() if query else True
            desc_match = query.lower() in blog.get('description', '').lower() if query and not title_match else False
            
            # Check tags
            tag_match = all(tag in blog.get('tags', []) for tag in (tags or []))
            
            # Check author
            author_match = author.lower() in blog['author'].lower() if author else True
            
            if (title_match or desc_match) and tag_match and author_match:
                filtered.append(blog)
        
        # Paginate
        total = len(filtered)
        total_pages = ceil(total / limit)
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paged = filtered[start_idx:end_idx] if start_idx < total else []
        
        return {
            "blogs": paged,
            "total": total,
            "total_pages": total_pages,
            "page": page
        }
    
    @staticmethod
    def search_liked_reviews(
        liked_ids: list[int],
        query: str = "",
        tags: Optional[list[str]] = None,
        author: str = "",
        page: int = 1,
        limit: int = 5
    ) -> dict[str, Any]:
        """Search within user's liked reviews."""
        if not liked_ids:
            return {"blogs": [], "total": 0, "total_pages": 0, "page": page}
        
        # Get all liked reviews
        all_reviews = []
        for review_id in liked_ids:
            review = ReviewService.get_by_id(review_id)
            if review:
                all_reviews.append(review)
        
        # Filter based on criteria
        filtered = []
        for review in all_reviews:
            title_match = query.lower() in review['title'].lower() if query else True
            desc_match = query.lower() in review.get('description', '').lower() if query and not title_match else False
            tag_match = all(tag in review.get('tags', []) for tag in (tags or []))
            author_match = author.lower() in review['author'].lower() if author else True
            
            if (title_match or desc_match) and tag_match and author_match:
                filtered.append(review)
        
        # Paginate
        total = len(filtered)
        total_pages = ceil(total / limit)
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paged = filtered[start_idx:end_idx] if start_idx < total else []
        
        return {
            "blogs": paged,  # Named 'blogs' for API compatibility
            "total": total,
            "total_pages": total_pages,
            "page": page
        }
