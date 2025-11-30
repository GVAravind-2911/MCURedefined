CREATE TABLE "interaction" (
	"id" text PRIMARY KEY NOT NULL,
	"blog_id" integer NOT NULL,
	"views" integer DEFAULT 1 NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"shares" integer DEFAULT 0 NOT NULL,
	"last_updated" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
