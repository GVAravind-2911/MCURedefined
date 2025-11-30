"""User-related models for authentication and interactions."""

from __future__ import annotations

import sqlalchemy as sa
from sqlalchemy import PrimaryKeyConstraint, Table
from datetime import datetime
from typing import Any, TYPE_CHECKING

from ..core.database import UserBase

if TYPE_CHECKING:
    pass


class BaseModel:
    """Base mixin for common model functionality."""
    
    __table__: Table
    
    def to_dict(self) -> dict[str, Any]:
        """Convert model to dictionary."""
        result: dict[str, Any] = {}
        for column in self.__table__.columns:
            try:
                value = getattr(self, column.name)
                if isinstance(value, datetime):
                    value = value.isoformat()
                result[column.name] = value
            except Exception:
                pass
        return result


class User(UserBase, BaseModel):
    """User model matching Better-Auth Drizzle schema."""
    
    __tablename__ = "user"
    
    id = sa.Column(sa.Text, primary_key=True)
    name = sa.Column(sa.String, nullable=False)
    email = sa.Column(sa.String, unique=True, nullable=False)
    email_verified = sa.Column(sa.Boolean, nullable=False, default=False)
    image = sa.Column(sa.Text)
    created_at = sa.Column(sa.DateTime(timezone=True), default=datetime.now, nullable=False)
    updated_at = sa.Column(sa.DateTime(timezone=True), default=datetime.now, onupdate=datetime.now, nullable=False)
    username = sa.Column(sa.Text, nullable=False, unique=True)
    display_name = sa.Column(sa.Text, nullable=False, unique=True)  # Note: column is display_name not display_username
    role = sa.Column(sa.Text, nullable=False, default="user")
    banned = sa.Column(sa.Boolean, nullable=False, default=False)
    ban_reason = sa.Column(sa.Text)
    ban_expires = sa.Column(sa.Integer)


class Session(UserBase, BaseModel):
    """Session model for user authentication."""
    
    __tablename__ = "session"
    
    id = sa.Column(sa.Text, primary_key=True)
    user_id = sa.Column(sa.Text, sa.ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    token = sa.Column(sa.Text, unique=True, nullable=False)
    expires_at = sa.Column(sa.DateTime, nullable=False)
    ip_address = sa.Column(sa.Text)
    user_agent = sa.Column(sa.Text)
    created_at = sa.Column(sa.DateTime, default=datetime.now, nullable=False)
    updated_at = sa.Column(sa.DateTime, default=datetime.now, onupdate=datetime.now, nullable=False)
    impersonated_by = sa.Column(sa.Text)


class Account(UserBase, BaseModel):
    """Account model for OAuth providers."""
    
    __tablename__ = "account"
    
    id = sa.Column(sa.Text, primary_key=True)
    user_id = sa.Column(sa.Text, sa.ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    account_id = sa.Column(sa.Text, nullable=False)
    provider_id = sa.Column(sa.Text, nullable=False)
    access_token = sa.Column(sa.Text)
    refresh_token = sa.Column(sa.Text)
    access_token_expires_at = sa.Column(sa.DateTime)
    refresh_token_expires_at = sa.Column(sa.DateTime)
    scope = sa.Column(sa.Text)
    id_token = sa.Column(sa.Text)
    password = sa.Column(sa.Text)
    created_at = sa.Column(sa.DateTime, default=datetime.now, nullable=False)
    updated_at = sa.Column(sa.DateTime, default=datetime.now, onupdate=datetime.now, nullable=False)


class BlogLike(UserBase, BaseModel):
    """Blog like model for user-blog interactions."""
    
    __tablename__ = "bloglikes"
    
    user_id = sa.Column(sa.Text, sa.ForeignKey("user.id", ondelete="CASCADE"), nullable=False, primary_key=True)
    blog_id = sa.Column(sa.Integer, nullable=False, primary_key=True)
    created_at = sa.Column(sa.DateTime, default=datetime.now, nullable=False)
    
    __table_args__ = (
        PrimaryKeyConstraint('user_id', 'blog_id'),
    )


class ReviewLike(UserBase, BaseModel):
    """Review like model for user-review interactions."""
    
    __tablename__ = "reviewlikes"
    
    user_id = sa.Column(sa.Text, sa.ForeignKey("user.id", ondelete="CASCADE"), nullable=False, primary_key=True)
    review_id = sa.Column(sa.Integer, nullable=False, primary_key=True)
    created_at = sa.Column(sa.DateTime, default=datetime.now, nullable=False)
    
    __table_args__ = (
        PrimaryKeyConstraint('user_id', 'review_id'),
    )


class ProjectLike(UserBase, BaseModel):
    """Project like model for user-project interactions."""
    
    __tablename__ = "projectlikes"
    
    user_id = sa.Column(sa.Text, sa.ForeignKey("user.id", ondelete="CASCADE"), nullable=False, primary_key=True)
    project_id = sa.Column(sa.Integer, nullable=False, primary_key=True)
    created_at = sa.Column(sa.DateTime, default=datetime.now, nullable=False)
    
    __table_args__ = (
        PrimaryKeyConstraint('user_id', 'project_id'),
    )
