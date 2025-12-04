"""
Topic Images Router

API endpoints for forum topic image management.
Designed to be easily extractable to a separate microservice.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional

from ..services.topic_image import topic_image_service
from ..core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(
    prefix="/topic-images",
    tags=["Topic Images"],
)


class ImageUploadRequest(BaseModel):
    """Request model for image upload."""
    image: str = Field(..., description="Base64 encoded image data with data URI prefix")


class ImageUploadResponse(BaseModel):
    """Response model for successful image upload."""
    link: str = Field(..., description="Public URL of the uploaded image")
    key: str = Field(..., description="Storage key for the image (used for deletion)")


class ImageDeleteRequest(BaseModel):
    """Request model for image deletion."""
    key: str = Field(..., description="Storage key of the image to delete")


class ImageDeleteResponse(BaseModel):
    """Response model for image deletion."""
    success: bool
    message: str


class ImageValidateRequest(BaseModel):
    """Request model for image validation."""
    image: str = Field(..., description="Base64 encoded image data to validate")


class ImageValidateResponse(BaseModel):
    """Response model for image validation."""
    valid: bool
    error: Optional[str] = None


@router.post(
    "/upload",
    response_model=ImageUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a topic image",
    description="Upload a base64 encoded image for use in forum topics. Returns the public URL and storage key."
)
async def upload_image(request: ImageUploadRequest) -> ImageUploadResponse:
    """
    Upload an image for a forum topic.
    
    The image should be provided as a base64-encoded data URI (e.g., data:image/jpeg;base64,...).
    
    Returns the public URL for displaying the image and a storage key for deletion.
    """
    logger.debug("Received topic image upload request")
    
    # Validate first
    is_valid, error_msg = topic_image_service.validate_image_data(request.image)
    if not is_valid:
        logger.warning(f"Image validation failed: {error_msg}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    
    try:
        result = topic_image_service.upload_image(request.image)
        return ImageUploadResponse(
            link=result["link"],
            key=result["key"]
        )
    except ValueError as e:
        logger.warning(f"Image upload validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Image upload failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload image"
        )


@router.delete(
    "/delete",
    response_model=ImageDeleteResponse,
    summary="Delete a topic image",
    description="Delete a previously uploaded topic image using its storage key."
)
async def delete_image(request: ImageDeleteRequest) -> ImageDeleteResponse:
    """
    Delete a topic image from storage.
    
    Requires the storage key that was returned during upload.
    """
    logger.debug(f"Received topic image delete request for key: {request.key}")
    
    if not request.key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image key is required"
        )
    
    try:
        success = topic_image_service.delete_image(request.key)
        if success:
            return ImageDeleteResponse(
                success=True,
                message="Image deleted successfully"
            )
        else:
            return ImageDeleteResponse(
                success=False,
                message="Failed to delete image or image not found"
            )
    except Exception as e:
        logger.error(f"Image deletion failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete image"
        )


@router.post(
    "/validate",
    response_model=ImageValidateResponse,
    summary="Validate image data",
    description="Validate base64 image data without uploading. Useful for client-side validation."
)
async def validate_image(request: ImageValidateRequest) -> ImageValidateResponse:
    """
    Validate image data without uploading.
    
    Returns whether the image data is valid and an error message if not.
    """
    is_valid, error_msg = topic_image_service.validate_image_data(request.image)
    return ImageValidateResponse(
        valid=is_valid,
        error=error_msg
    )


# Export router
topic_images_router = router
