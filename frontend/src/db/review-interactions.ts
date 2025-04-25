import { db } from "@/db";
import { reviewInteraction } from "@/db/schema";
import { eq, and } from "drizzle-orm";
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
      createdAt: new Date()
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
          views: existingInteraction[0].views + 1,
          lastUpdated: new Date()
        })
        .where(eq(reviewInteraction.reviewId, reviewId));
    } else {
      // Create new record with all required fields
      await db.insert(reviewInteraction).values({
        id: nanoid(),
        reviewId: reviewId,
        views: 1,
        likes: 0,
        shares: 0,
        lastUpdated: new Date(),
        createdAt: new Date()
      });
    }
  } catch (error) {
    console.error("Error incrementing review views:", error);
  }
}