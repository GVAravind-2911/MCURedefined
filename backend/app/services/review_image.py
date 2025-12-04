"""
Review Image Service

Handles image uploads for reviews (thumbnails and content images).
Designed to be easily extractable to a separate microservice in the future.
"""

from __future__ import annotations

from typing import Optional, Any
from ..core.storage import storage
from ..core.logging import get_logger

logger = get_logger(__name__)

# R2 folders for review images
REVIEW_THUMBNAILS_FOLDER = "review-thumbnails"
REVIEW_CONTENT_FOLDER = "review-images"

# Default image for reviews
DEFAULT_REVIEW_IMAGE = {"link": "https://i.imgur.com/JloNMTG.png", "key": ""}


class ReviewImageService:
    """
    Service for handling review images.
    
    This service is designed to be stateless and easily movable to a separate
    microservice. All it needs is access to R2 storage.
    """
    
    @staticmethod
    def upload_thumbnail(base64_string: str) -> dict[str, str]:
        """
        Upload a base64 encoded thumbnail image to R2 storage.
        
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
            "Uploading review thumbnail to R2",
            **{"folder": REVIEW_THUMBNAILS_FOLDER}
        )
        
        try:
            result = storage.upload_base64_image(base64_string, folder=REVIEW_THUMBNAILS_FOLDER)
            logger.info(
                "Review thumbnail uploaded successfully",
                **{"image.key": result.get("key", "")}
            )
            return result
        except Exception as e:
            logger.error(
                f"Failed to upload review thumbnail: {str(e)}",
                extra={"error.type": type(e).__name__, "error.message": str(e)}
            )
            raise
    
    @staticmethod
    def upload_content_image(base64_string: str) -> dict[str, str]:
        """
        Upload a base64 encoded content image to R2 storage.
        
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
            "Uploading review content image to R2",
            **{"folder": REVIEW_CONTENT_FOLDER}
        )
        
        try:
            result = storage.upload_base64_image(base64_string, folder=REVIEW_CONTENT_FOLDER)
            logger.info(
                "Review content image uploaded successfully",
                **{"image.key": result.get("key", "")}
            )
            return result
        except Exception as e:
            logger.error(
                f"Failed to upload review content image: {str(e)}",
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
        
        # Validate the key belongs to review folders for safety
        valid_prefixes = [REVIEW_THUMBNAILS_FOLDER + "/", REVIEW_CONTENT_FOLDER + "/"]
        if not any(key.startswith(prefix) for prefix in valid_prefixes):
            logger.warning(
                "Attempted to delete image outside review folders",
                **{"image.key": key}
            )
            return False
        
        logger.debug(
            "Deleting review image from R2",
            **{"image.key": key}
        )
        
        try:
            result = storage.delete_image(key)
            if result:
                logger.info(
                    "Review image deleted successfully",
                    **{"image.key": key}
                )
            else:
                logger.warning(
                    "Review image deletion returned False",
                    **{"image.key": key}
                )
            return result
        except Exception as e:
            logger.error(
                f"Failed to delete review image: {str(e)}",
                extra={"error.type": type(e).__name__, "error.message": str(e), "image.key": key}
            )
            return False
    
    @staticmethod
    def process_thumbnail(image_data: Optional[dict[str, Any]], use_default_if_not_base64: bool = False) -> dict[str, str]:
        """
        Process thumbnail data - upload to R2 if base64, otherwise return as-is.
        
        Args:
            image_data: Dict with 'link' key containing image URL or base64 data
            use_default_if_not_base64: If True, return default image when link is not base64
                                       (used for new posts that require fresh uploads)
            
        Returns:
            Dict with 'link' and optionally 'key'
        """
        logger.debug(
            "Processing review thumbnail",
            **{"image.has_data": image_data is not None, "image.type": type(image_data).__name__ if image_data else "None"}
        )
        
        if not image_data or not isinstance(image_data, dict):
            logger.debug("No valid thumbnail data, returning default")
            return DEFAULT_REVIEW_IMAGE.copy()
        
        link = image_data.get("link", "")
        
        if not link:
            logger.debug("Empty thumbnail link, returning default")
            return DEFAULT_REVIEW_IMAGE.copy()
        
        if isinstance(link, str) and link.startswith("data:image"):
            logger.debug("Uploading base64 thumbnail to R2")
            return ReviewImageService.upload_thumbnail(link)
        
        # Link is not base64 - either keep existing URL or use default
        if use_default_if_not_base64:
            logger.debug("Thumbnail is not base64 and default requested, returning default")
            return DEFAULT_REVIEW_IMAGE.copy()
        
        # Keep existing URL (for updates where image wasn't changed)
        return {"link": str(link), "key": image_data.get("key", "")}
    
    @staticmethod
    def process_content_image(image_data: Optional[dict[str, Any]]) -> dict[str, str]:
        """
        Process content image data - upload to R2 if base64, otherwise return as-is.
        
        Args:
            image_data: Dict with 'link' key containing image URL or base64 data
            
        Returns:
            Dict with 'link' and optionally 'key'
        """
        logger.debug(
            "Processing review content image",
            **{"image.has_data": image_data is not None}
        )
        
        if not image_data or not isinstance(image_data, dict):
            return DEFAULT_REVIEW_IMAGE.copy()
        
        link = image_data.get("link", "")
        
        if not link:
            return DEFAULT_REVIEW_IMAGE.copy()
        
        if isinstance(link, str) and link.startswith("data:image"):
            logger.debug("Uploading base64 content image to R2")
            return ReviewImageService.upload_content_image(link)
        
        # Keep existing URL
        return {"link": str(link), "key": image_data.get("key", "")}
    
    @staticmethod
    def process_content_blocks(content: list[dict]) -> list[dict]:
        """
        Process all image blocks in content.
        
        Args:
            content: List of content blocks
            
        Returns:
            Processed content with uploaded images
        """
        processed_content = []
        for i, block in enumerate(content):
            if block.get("type") == "image":
                logger.debug(f"Processing image in content block {i}")
                block["content"] = ReviewImageService.process_content_image(block.get("content", {}))
            processed_content.append(block)
        return processed_content
    
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
    
    @staticmethod
    def extract_image_keys_from_content(content: list[dict]) -> list[str]:
        """
        Extract all R2 image keys from content blocks.
        
        Args:
            content: List of content blocks
            
        Returns:
            List of R2 object keys for images in the content
        """
        keys: list[str] = []
        for block in content:
            if block.get("type") == "image":
                image_content = block.get("content", {})
                if isinstance(image_content, dict):
                    key = image_content.get("key", "")
                    if key and key.startswith(REVIEW_CONTENT_FOLDER + "/"):
                        keys.append(key)
        return keys
    
    @staticmethod
    def extract_thumbnail_key(thumbnail_path: Any) -> Optional[str]:
        """
        Extract R2 key from thumbnail path.
        
        Args:
            thumbnail_path: Dict with 'link' and 'key'
            
        Returns:
            R2 object key if valid, None otherwise
        """
        if not thumbnail_path or not isinstance(thumbnail_path, dict):
            return None
        key = thumbnail_path.get("key", "")
        # Accept any valid R2 key (thumbnails or content folders)
        if key and isinstance(key, str) and (key.startswith(REVIEW_THUMBNAILS_FOLDER + "/") or key.startswith(REVIEW_CONTENT_FOLDER + "/")):
            return key
        return None
    
    @staticmethod
    def extract_thumbnail_link(thumbnail_path: Any) -> Optional[str]:
        """
        Extract link/URL from thumbnail path.
        
        Args:
            thumbnail_path: Dict with 'link' and 'key'
            
        Returns:
            URL/link string if valid, None otherwise
        """
        if not thumbnail_path or not isinstance(thumbnail_path, dict):
            return None
        link = thumbnail_path.get("link", "")
        if link and isinstance(link, str):
            return link
        return None
    
    @staticmethod
    def cleanup_orphaned_images(
        old_content: Any,
        new_content: Any,
        old_thumbnail: Any,
        new_thumbnail: Any
    ) -> dict[str, int]:
        """
        Delete images that are no longer used after an update.
        
        Compares old and new content/thumbnails to find orphaned images
        and deletes them from R2 storage.
        
        Args:
            old_content: Previous content blocks
            new_content: Updated content blocks
            old_thumbnail: Previous thumbnail data
            new_thumbnail: Updated thumbnail data
            
        Returns:
            Dict with 'deleted' count and 'failed' count
        """
        deleted = 0
        failed = 0
        
        # Get old and new content image keys
        old_content_keys = set(ReviewImageService.extract_image_keys_from_content(old_content or []))
        new_content_keys = set(ReviewImageService.extract_image_keys_from_content(new_content or []))
        
        # Find orphaned content images (in old but not in new)
        orphaned_content_keys = old_content_keys - new_content_keys
        
        for key in orphaned_content_keys:
            logger.debug(f"Deleting orphaned review content image: {key}")
            if ReviewImageService.delete_image(key):
                deleted += 1
            else:
                failed += 1
        
        # Check thumbnail change
        old_thumb_key = ReviewImageService.extract_thumbnail_key(old_thumbnail)
        new_thumb_key = ReviewImageService.extract_thumbnail_key(new_thumbnail)
        old_thumb_link = ReviewImageService.extract_thumbnail_link(old_thumbnail)
        new_thumb_link = ReviewImageService.extract_thumbnail_link(new_thumbnail)
        
        logger.debug(
            f"Thumbnail comparison - old_key: {old_thumb_key}, new_key: {new_thumb_key}, "
            f"old_link: {old_thumb_link[:50] if old_thumb_link else None}..., "
            f"new_link: {new_thumb_link[:50] if new_thumb_link else None}..."
        )
        
        # Delete old thumbnail if:
        # 1. Old thumbnail has a valid R2 key AND
        # 2. Either the key changed OR the link changed (meaning a new image was uploaded)
        thumbnail_changed = (
            old_thumb_key and 
            (old_thumb_key != new_thumb_key or old_thumb_link != new_thumb_link)
        )
        
        if thumbnail_changed and old_thumb_key:
            logger.info(f"Deleting orphaned review thumbnail: {old_thumb_key}")
            if ReviewImageService.delete_image(old_thumb_key):
                deleted += 1
            else:
                failed += 1
        elif old_thumb_key:
            logger.debug(f"Thumbnail unchanged, keeping: {old_thumb_key}")
        
        if deleted > 0 or failed > 0:
            logger.info(
                f"Review image cleanup: deleted {deleted}, failed {failed}",
                **{"cleanup.deleted": deleted, "cleanup.failed": failed}
            )
        
        return {"deleted": deleted, "failed": failed}
    
    @staticmethod
    def cleanup_all_images(
        content: Any,
        thumbnail: Any
    ) -> dict[str, int]:
        """
        Delete all images associated with a review (for deletion).
        
        Args:
            content: Content blocks with images
            thumbnail: Thumbnail data
            
        Returns:
            Dict with 'deleted' count and 'failed' count
        """
        deleted = 0
        failed = 0
        
        # Delete all content images
        content_keys = ReviewImageService.extract_image_keys_from_content(content or [])
        for key in content_keys:
            logger.debug(f"Deleting review content image: {key}")
            if ReviewImageService.delete_image(key):
                deleted += 1
            else:
                failed += 1
        
        # Delete thumbnail
        thumb_key = ReviewImageService.extract_thumbnail_key(thumbnail)
        if thumb_key:
            logger.debug(f"Deleting review thumbnail: {thumb_key}")
            if ReviewImageService.delete_image(thumb_key):
                deleted += 1
            else:
                failed += 1
        
        if deleted > 0 or failed > 0:
            logger.info(
                f"Review deletion image cleanup: deleted {deleted}, failed {failed}",
                **{"cleanup.deleted": deleted, "cleanup.failed": failed}
            )
        
        return {"deleted": deleted, "failed": failed}


# Singleton instance for easy importing
review_image_service = ReviewImageService()
