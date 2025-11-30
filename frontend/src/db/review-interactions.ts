import { db } from "@/db";
import { reviewInteraction } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function getReviewInteractions(reviewId: number) {
	try {
		const result = await db
			.select()
			.from(reviewInteraction)
			.where(eq(reviewInteraction.reviewId, reviewId));

		if (result.length > 0) {
			return result[0];
		}

		// If no interaction exists yet, create one
		const newInteraction = {
			id: nanoid(),
			reviewId: reviewId,
			views: 1,
			likes: 0,
			shares: 0,
			lastUpdated: new Date(),
			createdAt: new Date(),
		};

		await db.insert(reviewInteraction).values(newInteraction);
		return newInteraction;
	} catch (error) {
		console.error("Error getting review interactions:", error);
		// Return default values if there's an error
		return { likes: 0, views: 0, shares: 0 };
	}
}

export async function incrementReviewView(reviewId: number) {
	try {
		const existingInteraction = await db
			.select()
			.from(reviewInteraction)
			.where(eq(reviewInteraction.reviewId, reviewId));

		if (existingInteraction.length > 0) {
			// Update existing record
			await db
				.update(reviewInteraction)
				.set({
					// @ts-ignore
					views: existingInteraction[0].views + 1,
					lastUpdated: new Date(),
				})
				.where(eq(reviewInteraction.reviewId, reviewId));
		} else {
			// Create new record with all required fields
			// @ts-ignore
			await db.insert(reviewInteraction).values({
				id: nanoid(),
				reviewId: reviewId,
				views: 1,
				likes: 0,
				shares: 0,
				lastUpdated: new Date(),
				createdAt: new Date(),
			});
		}
	} catch (error) {
		console.error("Error incrementing review views:", error);
	}
}

export async function incrementReviewLikes(reviewId: number) {
	try {
		const existingInteraction = await db
			.select()
			.from(reviewInteraction)
			.where(eq(reviewInteraction.reviewId, reviewId));

		if (existingInteraction.length > 0) {
			// Update existing record using SQL increment
			await db
				.update(reviewInteraction)
				.set({
					// @ts-ignore - Using SQL increment like in blog interactions
					likes: sql`likes + 1`,
					lastUpdated: new Date(),
				})
				.where(eq(reviewInteraction.reviewId, reviewId));
		} else {
			// Create new record with 1 like
			const newInteraction = {
				id: nanoid(),
				reviewId: reviewId,
				views: 0,
				likes: 1,
				shares: 0,
			};
			// @ts-ignore - Type inference issue with optional fields
			await db.insert(reviewInteraction).values(newInteraction);
		}
	} catch (error) {
		console.error("Error incrementing review likes:", error);
	}
}

export async function decrementReviewLikes(reviewId: number) {
	try {
		const existingInteraction = await db
			.select()
			.from(reviewInteraction)
			.where(eq(reviewInteraction.reviewId, reviewId));

		if (existingInteraction.length > 0) {
			// Update existing record using SQL decrement with GREATEST to avoid negative values
			await db
				.update(reviewInteraction)
				.set({
					// @ts-ignore - Using SQL decrement like in blog interactions
					likes: sql`GREATEST(likes - 1, 0)`,
					lastUpdated: new Date(),
				})
				.where(eq(reviewInteraction.reviewId, reviewId));
		}
		// If no interaction exists, nothing to decrement
	} catch (error) {
		console.error("Error decrementing review likes:", error);
	}
}
