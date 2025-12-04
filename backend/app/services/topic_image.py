"""
Topic Image Service

Handles image uploads for forum topics.
Designed to be easily extractable to a separate microservice in the future.
"""

from __future__ import annotations

from typing import Optional
from ..core.storage import storage
from ..core.logging import get_logger

logger = get_logger(__name__)

# R2 folder for topic images
TOPIC_IMAGES_FOLDER = "topic-images"


class TopicImageService:
    """
    Service for handling forum topic images.
    
    This service is designed to be stateless and easily movable to a separate
    microservice. All it needs is access to R2 storage.
    """
    
    @staticmethod
    def upload_image(base64_string: str) -> dict[str, str]:
        """
        Upload a base64 encoded image to R2 storage.
        
        Args:
            base64_string: Base64 encoded image data (with data URI prefix)
            
        Returns:
            Dict with 'link' (public URL) and 'key' (R2 object key)
            
        Raises:
            ValueError: If the image data is invalid
            Exception: If upload fails
        """
        if not base64_string:
            raise ValueError("Image data is required")
            
        if not base64_string.startswith("data:image"):
            raise ValueError("Invalid image data format. Expected base64 data URI.")
        
        logger.debug(
            "Uploading topic image to R2",
            **{"folder": TOPIC_IMAGES_FOLDER}
        )
        
        try:
            result = storage.upload_base64_image(base64_string, folder=TOPIC_IMAGES_FOLDER)
            logger.info(
                "Topic image uploaded successfully",
                **{"image.key": result.get("key", "")}
            )
            return result
        except Exception as e:
            logger.error(
                f"Failed to upload topic image: {str(e)}",
                extra={"error.type": type(e).__name__, "error.message": str(e)}
            )
            raise
    
    @staticmethod
    def delete_image(key: str) -> bool:
        """
        Delete an image from R2 storage.
        
        Args:
            key: The R2 object key of the image to delete
            
        Returns:
            True if deletion was successful, False otherwise
        """
        if not key:
            logger.debug("No image key provided for deletion")
            return False
        
        # Validate the key belongs to topic-images folder for safety
        if not key.startswith(TOPIC_IMAGES_FOLDER + "/"):
            logger.warning(
                "Attempted to delete image outside topic-images folder",
                **{"image.key": key}
            )
            return False
        
        logger.debug(
            "Deleting topic image from R2",
            **{"image.key": key}
        )
        
        try:
            result = storage.delete_image(key)
            if result:
                logger.info(
                    "Topic image deleted successfully",
                    **{"image.key": key}
                )
            else:
                logger.warning(
                    "Topic image deletion returned False",
                    **{"image.key": key}
                )
            return result
        except Exception as e:
            logger.error(
                f"Failed to delete topic image: {str(e)}",
                extra={"error.type": type(e).__name__, "error.message": str(e), "image.key": key}
            )
            return False
    
    @staticmethod
    def validate_image_data(base64_string: str) -> tuple[bool, Optional[str]]:
        """
        Validate base64 image data without uploading.
        
        Args:
            base64_string: Base64 encoded image data
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        if not base64_string:
            return False, "Image data is required"
        
        if not isinstance(base64_string, str):
            return False, "Image data must be a string"
        
        if not base64_string.startswith("data:image"):
            return False, "Invalid image format. Must be a data URI starting with 'data:image'"
        
        # Check for valid mime types
        valid_mimes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
        mime_valid = any(f"data:{mime}" in base64_string.split(",")[0] for mime in valid_mimes)
        
        if not mime_valid:
            return False, "Unsupported image format. Allowed: JPEG, PNG, GIF, WebP"
        
        # Check for base64 data after comma
        try:
            parts = base64_string.split(",")
            if len(parts) != 2 or not parts[1]:
                return False, "Invalid base64 data format"
        except Exception:
            return False, "Failed to parse image data"
        
        return True, None


# Singleton instance for easy importing
topic_image_service = TopicImageService()
