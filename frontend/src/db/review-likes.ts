import { db } from "@/db";
import { reviewLike, reviewInteraction } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getUserLikedReview(userId: string, reviewId: number) {
	try {
		const results = await db
			.select()
			.from(reviewLike)
			.where(
				and(eq(reviewLike.userId, userId), eq(reviewLike.reviewId, reviewId)),
			);

		return results.length > 0 ? results[0] : null;
	} catch (error) {
		console.error("Error checking if user liked review:", error);
		return null;
	}
}
