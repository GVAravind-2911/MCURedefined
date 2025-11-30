"""Cloudflare R2 storage utilities."""

from __future__ import annotations

import base64
import io
import uuid
from typing import Optional, Any, TYPE_CHECKING

if TYPE_CHECKING:
    from mypy_boto3_s3 import S3Client

try:
    import boto3
    from botocore.exceptions import ClientError
    BOTO3_AVAILABLE = True
except ImportError:
    BOTO3_AVAILABLE = False
    ClientError = Exception  # type: ignore

from .config import settings
from .logging import get_logger

logger = get_logger(__name__)


class R2Storage:
    """Cloudflare R2 storage client."""
    
    MIME_TO_EXT: dict[str, str] = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
        'image/svg+xml': 'svg'
    }
    
    def __init__(self) -> None:
        """Initialize R2 client."""
        self._client: Any = None
    
    @property
    def client(self) -> Any:
        """Lazy initialization of S3 client."""
        if self._client is None:
            if not BOTO3_AVAILABLE:
                raise ValueError("boto3 is not installed")
            if not all([settings.R2_ACCOUNT_ID, settings.R2_ACCESS_KEY_ID, settings.R2_SECRET_ACCESS_KEY]):
                raise ValueError("R2 credentials not configured")
            
            import boto3 as _boto3
            self._client = _boto3.client(
                's3',
                endpoint_url=f'https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com',
                aws_access_key_id=settings.R2_ACCESS_KEY_ID,
                aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
                region_name='auto'
            )
        return self._client
    
    def upload_base64_image(self, base64_string: str, folder: str = "blog-images") -> dict[str, str]:
        """
        Upload a base64 encoded image to R2.
        
        Args:
            base64_string: Base64 encoded image data (with data URI prefix)
            folder: Folder path in bucket
            
        Returns:
            Dict with 'link' and 'key' of uploaded image
        """
        if not base64_string.startswith("data:image"):
            return {"link": base64_string, "key": ""}
        
        # Extract base64 data and mime type
        header, base64_data = base64_string.split(",", 1)
        mime_type = header.split(":")[1].split(";")[0]
        extension = self.MIME_TO_EXT.get(mime_type, 'jpg')
        
        # Decode and create file object
        image_binary = base64.b64decode(base64_data)
        image_file = io.BytesIO(image_binary)
        
        # Generate unique filename
        filename = f"{folder}/{uuid.uuid4()}.{extension}"
        
        try:
            self.client.upload_fileobj(
                image_file,
                settings.R2_BUCKET_NAME,
                filename,
                ExtraArgs={'ContentType': mime_type}
            )
            
            public_url = f"{settings.R2_PUBLIC_URL}/{filename}"
            return {"link": public_url, "key": filename}
            
        except ClientError as e:
            raise Exception(f"Failed to upload image to R2: {str(e)}")
    
    def delete_image(self, key: str) -> bool:
        """
        Delete an image from R2.
        
        Args:
            key: Object key in bucket
            
        Returns:
            True if successful
        """
        if not key:
            return False
            
        try:
            self.client.delete_object(
                Bucket=settings.R2_BUCKET_NAME,
                Key=key
            )
            return True
        except ClientError:
            return False


# Global storage instance
storage = R2Storage()


def process_image(image_data: Optional[dict[str, Any]], use_default_if_not_base64: bool = False) -> dict[str, str]:
    """
    Process image data - upload to R2 if base64, otherwise return as-is.
    
    Args:
        image_data: Dict with 'link' key containing image URL or base64 data
        use_default_if_not_base64: If True, return default image when link is not base64
                                   (used for thumbnails that require new uploads)
        
    Returns:
        Dict with 'link' and optionally 'key'
    """
    DEFAULT_IMAGE = {"link": "https://i.imgur.com/JloNMTG.png", "key": ""}
    
    logger.debug(
        "Processing image data",
        **{"image.has_data": image_data is not None, "image.type": type(image_data).__name__}
    )
    
    if not image_data or not isinstance(image_data, dict):
        logger.debug("No valid image data, returning default")
        return DEFAULT_IMAGE
    
    link = image_data.get("link", "")
    
    # If link is empty or not provided, use default
    if not link:
        logger.debug("Empty link, returning default")
        return DEFAULT_IMAGE
    
    if isinstance(link, str) and link.startswith("data:image"):
        logger.debug("Uploading base64 image to R2", **{"image.is_base64": True})
        try:
            result = storage.upload_base64_image(link)
            logger.debug("Image uploaded successfully", **{"image.url": result.get("link", "")[:50]})
            return result
        except Exception as e:
            logger.error(
                f"Failed to upload image: {str(e)}",
                **{"error.type": type(e).__name__, "error.message": str(e)}
            )
            raise
    
    # Link is not base64 - either keep existing URL or use default
    if use_default_if_not_base64:
        # For new posts where thumbnail must be uploaded fresh
        logger.debug("Link is not base64 and default requested, returning default")
        return DEFAULT_IMAGE
    
    # Keep existing URL (for updates where image wasn't changed)
    return {"link": str(link), "key": image_data.get("key", "")}
