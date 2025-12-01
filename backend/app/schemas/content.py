"""Pydantic schemas for content (blogs, reviews, timeline)."""

from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import date


class ImageData(BaseModel):
    """Image data schema."""
    link: str
    key: Optional[str] = ""


class ContentBlock(BaseModel):
    """Content block schema for blog/review content."""
    type: str  # "text", "image", "heading", etc.
    content: Any


class AuthorInfo(BaseModel):
    """Author information schema for cross-database user reference."""
    id: str
    name: str
    username: str
    display_name: str
    image: Optional[str] = None


# Blog Schemas
class BlogBase(BaseModel):
    """Base blog schema."""
    title: str = Field(..., min_length=1, max_length=255)
    author: str = Field(..., min_length=1, max_length=30)  # Display name (cached)
    author_id: Optional[str] = None  # User ID from user database
    description: Optional[str] = None
    tags: list[str] = Field(default_factory=list)


class BlogCreate(BlogBase):
    """Schema for creating a blog post."""
    content: list[ContentBlock] = Field(default_factory=list)
    thumbnail_path: ImageData


class BlogUpdate(BlogBase):
    """Schema for updating a blog post."""
    content: list[ContentBlock] = Field(default_factory=list)
    thumbnail_path: ImageData


class BlogResponse(BaseModel):
    """Response schema for a single blog post."""
    id: int
    title: str
    author: str  # Cached display name
    author_id: Optional[str] = None  # User ID from user database
    author_info: Optional[AuthorInfo] = None  # Resolved author details
    description: Optional[str] = None
    content: Any
    thumbnail_path: Any
    tags: list[str] = Field(default_factory=list)
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class BlogListResponse(BaseModel):
    """Response schema for paginated blog list."""
    blogs: list[BlogResponse]
    total: int
    total_pages: Optional[int] = None
    page: Optional[int] = None


# Review Schemas
class ReviewBase(BaseModel):
    """Base review schema."""
    title: str = Field(..., min_length=1, max_length=255)
    author: str = Field(..., min_length=1, max_length=30)  # Display name (cached)
    author_id: Optional[str] = None  # User ID from user database
    description: Optional[str] = None
    tags: list[str] = Field(default_factory=list)


class ReviewCreate(ReviewBase):
    """Schema for creating a review."""
    content: list[ContentBlock] = Field(default_factory=list)
    thumbnail_path: ImageData


class ReviewUpdate(ReviewBase):
    """Schema for updating a review."""
    content: list[ContentBlock] = Field(default_factory=list)
    thumbnail_path: ImageData


class ReviewResponse(BaseModel):
    """Response schema for a single review."""
    id: int
    title: str
    author: str  # Cached display name
    author_id: Optional[str] = None  # User ID from user database
    author_info: Optional[AuthorInfo] = None  # Resolved author details
    description: Optional[str] = None
    content: Any
    thumbnail_path: Any
    tags: list[str] = Field(default_factory=list)
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class ReviewListResponse(BaseModel):
    """Response schema for paginated review list."""
    blogs: list[ReviewResponse]  # Named 'blogs' for API compatibility
    total: int
    total_pages: Optional[int] = None
    page: Optional[int] = None


# Timeline Schemas
class TimelineResponse(BaseModel):
    """Response schema for a timeline project."""
    id: int
    phase: int
    name: str
    release_date: Optional[date] = None
    synopsis: Optional[str] = None
    posterpath: Optional[str] = None
    castinfo: Optional[str] = None
    director: Optional[str] = None
    musicartist: Optional[str] = None
    timelineid: Optional[int] = None

    class Config:
        from_attributes = True


class TimelineListResponse(BaseModel):
    """Response schema for timeline list."""
    projects: list[TimelineResponse]
    total: int
    total_pages: Optional[int] = None
    page: Optional[int] = None


# Common Response Schemas
class TagsResponse(BaseModel):
    """Response schema for tags list."""
    tags: list[str]


class AuthorsResponse(BaseModel):
    """Response schema for authors list."""
    authors: list[str]


class MessageResponse(BaseModel):
    """Generic message response."""
    message: str


class ErrorResponse(BaseModel):
    """Error response schema."""
    error: str
