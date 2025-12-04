import {
	pgTable,
	text,
	boolean,
	timestamp,
	primaryKey,
	integer,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull().default(false),
	image: text("image"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
	username: text("username").notNull().unique(),
	displayUsername: text("display_name").notNull().unique(),
	role: text("role").notNull().default("user"),
	banned: boolean("banned").notNull().default(false),
	banReason: text("ban_reason"),
	banExpires: integer("ban_expires"),
});

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	token: text("token").notNull().unique(),
	expiresAt: timestamp("expires_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
	impersonatedBy: text("impersonated_by"),
});

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	idToken: text("id_token"),
	password: text("password"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;

export const like = pgTable(
	"bloglikes",
	{
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		blogId: integer("blog_id").notNull(),
		// .references(() => blog.id, { onDelete: "cascade" }), // Uncomment if you have a blog table
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
	},
	(like) => [primaryKey({ columns: [like.userId, like.blogId] })],
);

export type Like = typeof like.$inferSelect;
export type NewLike = typeof like.$inferInsert;

export const interaction = pgTable("blog_interaction", {
	id: text("id").primaryKey(),
	blogId: integer("blog_id").notNull(),
	views: integer("views").notNull().default(1),
	likes: integer("likes").notNull().default(0),
	shares: integer("shares").notNull().default(0),
	lastUpdated: timestamp("last_updated")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type Interaction = typeof interaction.$inferSelect;
export type NewInteraction = typeof interaction.$inferInsert;

// Add these tables to your existing schema.ts file

export const projectLike = pgTable(
	"projectlikes",
	{
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		projectId: integer("project_id").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
	},
	(like) => [primaryKey({ columns: [like.userId, like.projectId] })],
);

export type ProjectLike = typeof projectLike.$inferSelect;
export type NewProjectLike = typeof projectLike.$inferInsert;

export const projectInteraction = pgTable("project_interaction", {
	id: text("id").primaryKey(),
	projectId: integer("project_id").notNull(),
	likes: integer("likes").notNull().default(0),
	views: integer("views").notNull().default(1),
	shares: integer("shares").notNull().default(0),
	lastUpdated: timestamp("last_updated")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type ProjectInteraction = typeof projectInteraction.$inferSelect;
export type NewProjectInteraction = typeof projectInteraction.$inferInsert;

// Add these tables to your existing schema.ts file

export const reviewLike = pgTable(
	"reviewlikes",
	{
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		reviewId: integer("review_id").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
	},
	(like) => [primaryKey({ columns: [like.userId, like.reviewId] })],
);

export type ReviewLike = typeof reviewLike.$inferSelect;
export type NewReviewLike = typeof reviewLike.$inferInsert;

export const reviewInteraction = pgTable("review_interaction", {
	id: text("id").primaryKey(),
	reviewId: integer("review_id").notNull(),
	views: integer("views").notNull().default(1),
	likes: integer("likes").notNull().default(0),
	shares: integer("shares").notNull().default(0),
	lastUpdated: timestamp("last_updated")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type ReviewInteraction = typeof reviewInteraction.$inferSelect;
export type NewReviewInteraction = typeof reviewInteraction.$inferInsert;

// Add these after your existing review interaction tables

// Blog Comment Table
export const blogComment = pgTable("blog_comment", {
	id: text("id").primaryKey(),
	blogId: integer("blog_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	parentId: text("parent_id").references(() => blogComment.id, {
		onDelete: "cascade",
	}),
	content: text("content").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
	deleted: boolean("deleted").notNull().default(false),
});

export type BlogComment = typeof blogComment.$inferSelect;
export type NewBlogComment = typeof blogComment.$inferInsert;

export const blogCommentLike = pgTable(
	"blog_comment_like",
	{
		commentId: text("comment_id")
			.notNull()
			.references(() => blogComment.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
	},
	(table) => [primaryKey({ columns: [table.commentId, table.userId] })],
);

export type BlogCommentLike = typeof blogCommentLike.$inferSelect;
export type NewBlogCommentLike = typeof blogCommentLike.$inferInsert;

// Review Comment Table
export const reviewComment = pgTable("review_comment", {
	id: text("id").primaryKey(),
	reviewId: integer("review_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	parentId: text("parent_id").references(() => reviewComment.id, {
		onDelete: "cascade",
	}),
	content: text("content").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
	deleted: boolean("deleted").notNull().default(false),
});

export type ReviewComment = typeof reviewComment.$inferSelect;
export type NewReviewComment = typeof reviewComment.$inferInsert;

export const reviewCommentLike = pgTable(
	"review_comment_like",
	{
		commentId: text("comment_id")
			.notNull()
			.references(() => reviewComment.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
	},
	(table) => [primaryKey({ columns: [table.commentId, table.userId] })],
);

export type ReviewCommentLike = typeof reviewCommentLike.$inferSelect;
export type NewReviewCommentLike = typeof reviewCommentLike.$inferInsert;

export const userProfile = pgTable("user_profile", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	description: text("description"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type UserProfile = typeof userProfile.$inferSelect;
export type NewUserProfile = typeof userProfile.$inferInsert;

// Forum Topic Table
export const forumTopic = pgTable("forum_topic", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	content: text("content").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
	deleted: boolean("deleted").notNull().default(false),
	pinned: boolean("pinned").notNull().default(false),
	locked: boolean("locked").notNull().default(false),
	isSpoiler: boolean("is_spoiler").notNull().default(false),
	spoilerFor: text("spoiler_for"), // What the spoiler is for (e.g., "Spider-Man 4", "Deadpool & Wolverine")
	spoilerExpiresAt: timestamp("spoiler_expires_at"), // When spoiler protection expires
	editCount: integer("edit_count").notNull().default(0), // Track number of edits (max 5)
	imageUrl: text("image_url"), // Public URL of the attached image (optional)
	imageKey: text("image_key"), // R2 storage key for image deletion
});

export type ForumTopic = typeof forumTopic.$inferSelect;
export type NewForumTopic = typeof forumTopic.$inferInsert;

// Forum Topic Like Table
export const forumTopicLike = pgTable(
	"forum_topic_like",
	{
		topicId: text("topic_id")
			.notNull()
			.references(() => forumTopic.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
	},
	(table) => [primaryKey({ columns: [table.topicId, table.userId] })],
);

export type ForumTopicLike = typeof forumTopicLike.$inferSelect;
export type NewForumTopicLike = typeof forumTopicLike.$inferInsert;

// Forum Comment Table (for comments on forum topics)
export const forumComment = pgTable("forum_comment", {
	id: text("id").primaryKey(),
	topicId: text("topic_id")
		.notNull()
		.references(() => forumTopic.id, { onDelete: "cascade" }),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	parentId: text("parent_id").references(() => forumComment.id, {
		onDelete: "cascade",
	}),
	content: text("content").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
	deleted: boolean("deleted").notNull().default(false),
	isSpoiler: boolean("is_spoiler").notNull().default(false),
	spoilerFor: text("spoiler_for"), // What the spoiler is for
	spoilerExpiresAt: timestamp("spoiler_expires_at"), // When spoiler protection expires
	editCount: integer("edit_count").notNull().default(0), // Track number of edits (max 5)
});

export type ForumComment = typeof forumComment.$inferSelect;
export type NewForumComment = typeof forumComment.$inferInsert;

// Forum Comment Like Table
export const forumCommentLike = pgTable(
	"forum_comment_like",
	{
		commentId: text("comment_id")
			.notNull()
			.references(() => forumComment.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
	},
	(table) => [primaryKey({ columns: [table.commentId, table.userId] })],
);

export type ForumCommentLike = typeof forumCommentLike.$inferSelect;
export type NewForumCommentLike = typeof forumCommentLike.$inferInsert;

// Forum Topic Edit History Table
export const forumTopicEditHistory = pgTable("forum_topic_edit_history", {
	id: text("id").primaryKey(),
	topicId: text("topic_id")
		.notNull()
		.references(() => forumTopic.id, { onDelete: "cascade" }),
	previousTitle: text("previous_title").notNull(),
	previousContent: text("previous_content").notNull(),
	editedAt: timestamp("edited_at", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
	editNumber: integer("edit_number").notNull(), // Which edit this was (1-5)
});

export type ForumTopicEditHistory = typeof forumTopicEditHistory.$inferSelect;
export type NewForumTopicEditHistory = typeof forumTopicEditHistory.$inferInsert;

// Forum Comment Edit History Table
export const forumCommentEditHistory = pgTable("forum_comment_edit_history", {
	id: text("id").primaryKey(),
	commentId: text("comment_id")
		.notNull()
		.references(() => forumComment.id, { onDelete: "cascade" }),
	previousContent: text("previous_content").notNull(),
	editedAt: timestamp("edited_at", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
	editNumber: integer("edit_number").notNull(), // Which edit this was (1-5)
});

export type ForumCommentEditHistory = typeof forumCommentEditHistory.$inferSelect;
export type NewForumCommentEditHistory = typeof forumCommentEditHistory.$inferInsert;
