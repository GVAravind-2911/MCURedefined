-- Add image fields to forum_topic table
ALTER TABLE "forum_topic" ADD COLUMN IF NOT EXISTS "image_url" text;
ALTER TABLE "forum_topic" ADD COLUMN IF NOT EXISTS "image_key" text;

-- Create index for topics with images (useful for admin/moderation queries)
CREATE INDEX IF NOT EXISTS "idx_forum_topic_has_image" ON "forum_topic" ("image_key") WHERE "image_key" IS NOT NULL;
