ALTER TABLE "user" ADD COLUMN "account_type" text DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "password" text;