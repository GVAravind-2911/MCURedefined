"""Pydantic schemas for user-related operations."""

from pydantic import BaseModel, Field
from typing import Optional, Literal


class LikedContentRequest(BaseModel):
    """Request schema for getting liked content."""
    user_id: str
    type: Literal["blogs", "reviews", "projects"] = "blogs"
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=5, ge=1, le=50)


class LikedContentResponse(BaseModel):
    """Response schema for liked content."""
    items: list
    total: int
    total_pages: int
    page: int


class SearchRequest(BaseModel):
    """Request schema for searching liked content."""
    user_id: str
    type: Literal["blogs", "reviews"] = "blogs"
    query: str = ""
    tags: str = ""
    author: str = ""
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=5, ge=1, le=50)


class UserResponse(BaseModel):
    """Response schema for user data."""
    id: str
    name: str
    email: str
    email_verified: bool
    image: Optional[str] = None
    role: str
    username: str
    display_username: str

    class Config:
        from_attributes = True
