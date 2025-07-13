ALTER TABLE "forum_comment" ALTER COLUMN "created_at" SET DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC');--> statement-breakpoint
ALTER TABLE "forum_comment" ALTER COLUMN "updated_at" SET DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC');--> statement-breakpoint
ALTER TABLE "forum_comment_like" ALTER COLUMN "created_at" SET DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC');--> statement-breakpoint
ALTER TABLE "forum_topic" ALTER COLUMN "created_at" SET DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC');--> statement-breakpoint
ALTER TABLE "forum_topic" ALTER COLUMN "updated_at" SET DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC');--> statement-breakpoint
ALTER TABLE "forum_topic_like" ALTER COLUMN "created_at" SET DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC');--> statement-breakpoint
ALTER TABLE "forum_comment" ADD COLUMN "is_spoiler" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "forum_comment" ADD COLUMN "spoiler_for" text;--> statement-breakpoint
ALTER TABLE "forum_comment" ADD COLUMN "spoiler_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "forum_topic" ADD COLUMN "is_spoiler" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "forum_topic" ADD COLUMN "spoiler_for" text;--> statement-breakpoint
ALTER TABLE "forum_topic" ADD COLUMN "spoiler_expires_at" timestamp;