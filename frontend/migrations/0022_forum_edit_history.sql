-- Add edit_count column to forum_topic
ALTER TABLE "forum_topic" ADD COLUMN IF NOT EXISTS "edit_count" integer DEFAULT 0 NOT NULL;

-- Add edit_count column to forum_comment
ALTER TABLE "forum_comment" ADD COLUMN IF NOT EXISTS "edit_count" integer DEFAULT 0 NOT NULL;

-- Create forum_topic_edit_history table
CREATE TABLE IF NOT EXISTS "forum_topic_edit_history" (
	"id" text PRIMARY KEY NOT NULL,
	"topic_id" text NOT NULL REFERENCES "forum_topic"("id") ON DELETE CASCADE,
	"previous_title" text NOT NULL,
	"previous_content" text NOT NULL,
	"edited_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"edit_number" integer NOT NULL
);

-- Create forum_comment_edit_history table
CREATE TABLE IF NOT EXISTS "forum_comment_edit_history" (
	"id" text PRIMARY KEY NOT NULL,
	"comment_id" text NOT NULL REFERENCES "forum_comment"("id") ON DELETE CASCADE,
	"previous_content" text NOT NULL,
	"edited_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"edit_number" integer NOT NULL
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS "idx_forum_topic_edit_history_topic_id" ON "forum_topic_edit_history" ("topic_id");
CREATE INDEX IF NOT EXISTS "idx_forum_comment_edit_history_comment_id" ON "forum_comment_edit_history" ("comment_id");
