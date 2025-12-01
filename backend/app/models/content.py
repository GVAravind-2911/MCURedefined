"""Content models for blog posts, reviews, and timeline."""

from __future__ import annotations

import sqlalchemy as sa
from sqlalchemy import Index, CheckConstraint, Table
from datetime import datetime, date
from typing import Any, TYPE_CHECKING

from ..core.database import ContentBase

if TYPE_CHECKING:
    from sqlalchemy.orm import Mapped


class BaseModel:
    """Base mixin for common model functionality."""
    
    __table__: Table
    
    def to_dict(self) -> dict[str, Any]:
        """Convert model to dictionary."""
        result: dict[str, Any] = {}
        for column in self.__table__.columns:
            try:
                value = getattr(self, column.name)
                if isinstance(value, (date, datetime)):
                    value = value.isoformat()
                result[column.name] = value
            except Exception:
                pass
        return result


class BlogPost(ContentBase, BaseModel):
    """Blog post model."""
    
    __tablename__ = 'blog_posts'

    id = sa.Column(sa.Integer, primary_key=True)
    title = sa.Column(sa.String(255), nullable=False)
    author = sa.Column(sa.String(30), nullable=False)  # Cached display name for performance
    author_id = sa.Column(sa.Text, nullable=True)  # User ID from PostgreSQL user database (cross-db FK)
    description = sa.Column(sa.Text)
    content = sa.Column(sa.JSON)
    thumbnail_path = sa.Column(sa.JSON)
    created_at = sa.Column(sa.String(75))
    updated_at = sa.Column(sa.String(75))
    
    __table_args__ = (
        Index('idx_blog_author', 'author'),
        Index('idx_blog_author_id', 'author_id'),
        Index('idx_blog_title', 'title'),
        Index('idx_blog_created_at', 'created_at'),
    )


class BlogTag(ContentBase, BaseModel):
    """Blog tag model for many-to-many relationship."""
    
    __tablename__ = 'blog_tags'
    
    id = sa.Column(sa.Integer, primary_key=True)
    blog_id = sa.Column(sa.Integer, sa.ForeignKey('blog_posts.id', ondelete='CASCADE'))
    tag = sa.Column(sa.String(50), nullable=False)
    
    __table_args__ = (
        Index('idx_blogtag_blogid', 'blog_id'),
        Index('idx_blogtag_tag', 'tag'),
    )


class Reviews(ContentBase, BaseModel):
    """Review model."""
    
    __tablename__ = 'reviews'

    id = sa.Column(sa.Integer, primary_key=True)
    title = sa.Column(sa.String(255), nullable=False)
    author = sa.Column(sa.String(30), nullable=False)  # Cached display name for performance
    author_id = sa.Column(sa.Text, nullable=True)  # User ID from PostgreSQL user database (cross-db FK)
    description = sa.Column(sa.Text)
    content = sa.Column(sa.JSON)
    thumbnail_path = sa.Column(sa.JSON)
    created_at = sa.Column(sa.String(75))
    updated_at = sa.Column(sa.String(75))
    
    __table_args__ = (
        Index('idx_review_author', 'author'),
        Index('idx_review_author_id', 'author_id'),
        Index('idx_review_title', 'title'),
        Index('idx_review_created_at', 'created_at'),
    )


class ReviewTag(ContentBase, BaseModel):
    """Review tag model for many-to-many relationship."""
    
    __tablename__ = 'review_tags'
    
    id = sa.Column(sa.Integer, primary_key=True)
    review_id = sa.Column(sa.Integer, sa.ForeignKey('reviews.id', ondelete='CASCADE'))
    tag = sa.Column(sa.String(50), nullable=False)
    
    __table_args__ = (
        Index('idx_reviewtag_reviewid', 'review_id'),
        Index('idx_reviewtag_tag', 'tag'),
    )


class Timeline(ContentBase, BaseModel):
    """Timeline/Project model for MCU release slate."""
    
    __tablename__ = 'timeline'
    
    id = sa.Column(sa.Integer, primary_key=True)
    phase = sa.Column(sa.Integer, nullable=False)
    name = sa.Column(sa.String(50), nullable=False)
    release_date = sa.Column(sa.Date)
    synopsis = sa.Column(sa.Text)
    posterpath = sa.Column(sa.String(50))
    castinfo = sa.Column(sa.Text)
    director = sa.Column(sa.String(50))
    musicartist = sa.Column(sa.String(30))
    timelineid = sa.Column(sa.Integer)
    
    __table_args__ = (
        CheckConstraint('phase IN (1, 2, 3, 4, 5, 6, 7, 8, 9)', name='phase_check'),
        Index('idx_timeline_phase', 'phase'),
        Index('idx_timeline_name', 'name'),
    )
