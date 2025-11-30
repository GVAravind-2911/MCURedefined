"""Timeline/Release Slate API routes."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from typing import Any

from ..services.timeline import TimelineService
from ..core.async_utils import run_sync

router = APIRouter(prefix="/release-slate", tags=["timeline"])


@router.get("")
async def get_all_projects() -> list[dict[str, Any]]:
    """Get all MCU projects in the timeline."""
    projects = await run_sync(TimelineService.get_all)
    return projects


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
