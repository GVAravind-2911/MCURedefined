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
	accountType:text("account_type").notNull().default("user"),
	createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
	username: text("username").notNull().default(""),
	displayUsername: text("display_name").notNull().default(""),
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
	createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
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
	createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;

export const like = pgTable("bloglikes", {
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    blogId: integer("blog_id")
        .notNull()
        // .references(() => blog.id, { onDelete: "cascade" }), // Uncomment if you have a blog table
    ,
    createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
},
    (like) => [
        primaryKey({columns:[like.userId, like.blogId]}),
	]
);

export type Like = typeof like.$inferSelect;
export type NewLike = typeof like.$inferInsert;

export const interaction = pgTable("blog_interaction", {
	id: text("id").primaryKey(),
	blogId: integer("blog_id").notNull(),
	views: integer("views").notNull().default(1),
	likes: integer("likes").notNull().default(0), 
	shares: integer("shares").notNull().default(0),
	lastUpdated: timestamp("last_updated").notNull().default(sql`CURRENT_TIMESTAMP`),
	createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
  
export type Interaction = typeof interaction.$inferSelect;
export type NewInteraction = typeof interaction.$inferInsert;

// Add these tables to your existing schema.ts file

export const projectLike = pgTable("projectlikes", {
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    projectId: integer("project_id")
        .notNull(),
    createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
},
    (like) => [
        primaryKey({columns:[like.userId, like.projectId]}),
    ]
);

export type ProjectLike = typeof projectLike.$inferSelect;
export type NewProjectLike = typeof projectLike.$inferInsert;

export const projectInteraction = pgTable("project_interaction", {
    id: text("id").primaryKey(),
    projectId: integer("project_id").notNull(),
	likes: integer("likes").notNull().default(0),
    views: integer("views").notNull().default(1),
    shares: integer("shares").notNull().default(0),
    lastUpdated: timestamp("last_updated").notNull().default(sql`CURRENT_TIMESTAMP`),
    createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
  
export type ProjectInteraction = typeof projectInteraction.$inferSelect;
export type NewProjectInteraction = typeof projectInteraction.$inferInsert;


// Add these tables to your existing schema.ts file

export const reviewLike = pgTable("reviewlikes", {
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    reviewId: integer("review_id")
        .notNull(),
    createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
},
    (like) => [
        primaryKey({columns:[like.userId, like.reviewId]}),
    ]
);

export type ReviewLike = typeof reviewLike.$inferSelect;
export type NewReviewLike = typeof reviewLike.$inferInsert;

export const reviewInteraction = pgTable("review_interaction", {
    id: text("id").primaryKey(),
    reviewId: integer("review_id").notNull(),
    views: integer("views").notNull().default(1),
    likes: integer("likes").notNull().default(0),
    shares: integer("shares").notNull().default(0),
    lastUpdated: timestamp("last_updated").notNull().default(sql`CURRENT_TIMESTAMP`),
    createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
  
export type ReviewInteraction = typeof reviewInteraction.$inferSelect;
export type NewReviewInteraction = typeof reviewInteraction.$inferInsert;