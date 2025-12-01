"""Timeline/Release Slate API routes."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from typing import Any, Optional

from ..services.timeline import TimelineService
from ..core.async_utils import run_sync

router = APIRouter(prefix="/release-slate", tags=["timeline"])


@router.get("")
async def get_all_projects(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=100),
    query: str = Query(default=""),
    phase: Optional[int] = Query(default=None, ge=1, le=9)
) -> dict[str, Any]:
    """Get MCU projects with optional pagination and filtering.
    
    By default returns all projects (limit=50) for backwards compatibility.
    Use page/limit for pagination, query for search, phase for filtering.
    """
    # If search/filter is requested, use search method
    if query or phase is not None:
        def _search() -> dict[str, Any]:
            return TimelineService.search(
                query=query.lower() if query else "",
                phase=phase,
                page=page,
                limit=limit
            )
        return await run_sync(_search)
    
    # For paginated requests without filters
    if page > 1 or limit < 50:
        result = await run_sync(TimelineService.get_paginated, page, limit)
        return result
    
    # Default: return all projects (original behavior)
    projects = await run_sync(TimelineService.get_all)
    return {
        "projects": projects,
        "total": len(projects),
        "total_pages": 1,
        "page": 1
    }


@router.get("/search")
async def search_projects(
    query: str = Query(default=""),
    phase: Optional[int] = Query(default=None, ge=1, le=9),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=50)
) -> dict[str, Any]:
    """Search MCU projects by name or filter by phase."""
    def _search() -> dict[str, Any]:
        return TimelineService.search(
            query=query.lower() if query else "",
            phase=phase,
            page=page,
            limit=limit
        )
    return await run_sync(_search)


@router.get("/{project_id}")
async def get_project(project_id: int) -> dict[str, Any]:
    """Get a single project by ID."""
    project = await run_sync(TimelineService.get_by_id, project_id)
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return project


@router.get("/phase/{phase}")
async def get_projects_by_phase(phase: int) -> list[dict[str, Any]]:
    """Get all projects in a specific phase."""
    if phase < 1 or phase > 9:
        raise HTTPException(status_code=400, detail="Phase must be between 1 and 9")
    
    projects = await run_sync(TimelineService.get_by_phase, phase)
    return projects
