CREATE TABLE "bloglikes" (
	"user_id" text NOT NULL,
	"blog_id" integer NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "bloglikes_user_id_blog_id_pk" PRIMARY KEY("user_id","blog_id")
);
--> statement-breakpoint
ALTER TABLE "bloglikes" ADD CONSTRAINT "bloglikes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;