import { db } from "./index";
import { interaction } from "./schema";
import { eq, sql } from "drizzle-orm";

function createInteraction(blogId: number) {
	return {
		id: crypto.randomUUID(),
		blogId: blogId,
	};
}

/**
 * Increments the view count for a blog or creates an interaction record if it doesn't exist
 */
export async function incrementBlogView(blogId: number): Promise<void> {
	try {
		const existing = await db
			.select()
			.from(interaction)
			.where(eq(interaction.blogId, blogId))
			.limit(1);

		if (existing.length === 0) {
			const newRow = createInteraction(blogId);
			await db.insert(interaction).values(newRow);
		} else {
			await db
				.update(interaction)
				.set({
					views: sql`views + 1`,
					lastUpdated: new Date(),
				})
				.where(eq(interaction.blogId, blogId));
		}
	} catch (error) {
		console.error("Error incrementing blog view:", error);
	}
}

export async function incrementBlogLikes(blogId: number): Promise<void> {
	try {
		const existing = await db
			.select()
			.from(interaction)
			.where(eq(interaction.blogId, blogId))
			.limit(1);

		if (existing.length === 0) {
			const newRow = createInteraction(blogId);
			await db.insert(interaction).values(newRow);
		} else {
			await db
				.update(interaction)
				.set({
					likes: sql`likes + 1`,
					lastUpdated: new Date(),
				})
				.where(eq(interaction.blogId, blogId));
		}
	} catch (error) {
		console.error("Error incrementing blog view:", error);
	}
}

export async function decrementBlogLikes(blogId: number): Promise<void> {
	try {
		const existing = await db
			.select()
			.from(interaction)
			.where(eq(interaction.blogId, blogId))
			.limit(1);

		if (existing.length === 0) {
			const newRow = createInteraction(blogId);
			await db.insert(interaction).values(newRow);
		} else {
			await db
				.update(interaction)
				.set({
					likes: sql`likes - 1`,
					lastUpdated: new Date(),
				})
				.where(eq(interaction.blogId, blogId));
		}
	} catch (error) {
		console.error("Error decrementing blog view:", error);
	}
}

/**
 * Increments the share count for a blog or creates an interaction record if it doesn't exist
 */
export async function incrementShareCount(blogId: number): Promise<void> {
	try {
		const existing = await db
			.select()
			.from(interaction)
			.where(eq(interaction.blogId, blogId))
			.limit(1);

		if (existing.length === 0) {
			const newRow = createInteraction(blogId);
			await db.insert(interaction).values(newRow);
		} else {
			await db
				.update(interaction)
				.set({
					shares: sql`shares + 1`,
					lastUpdated: new Date(),
				})
				.where(eq(interaction.blogId, blogId));
		}
	} catch (error) {
		console.error("Error incrementing blog share:", error);
	}
}

/**
 * Returns views, likes, and shares for a given blog
 */
export async function getBlogInteractions(blogId: number): Promise<{
	views: number;
	likes: number;
	shares: number;
} | null> {
	try {
		const result = await db
			.select()
			.from(interaction)
			.where(eq(interaction.blogId, blogId))
			.limit(1);

		if (result.length === 0) {
			return { views: 1, likes: 0, shares: 0 };
		}

		const record = result[0];
		return {
			views: record.views,
			likes: record.likes,
			shares: record.shares,
		};
	} catch (error) {
		console.error("Error fetching blog interaction data:", error);
		return null;
	}
}
