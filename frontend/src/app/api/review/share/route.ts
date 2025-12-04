import { NextResponse } from "next/server";
import { db } from "@/db";
import { reviewInteraction } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
	try {
		const { reviewId } = await req.json();

		if (!reviewId) {
			return NextResponse.json(
				{ error: "Review ID is required" },
				{ status: 400 },
			);
		}

		// Update the shares count in interactions table
		const existingInteraction = await db
			.select()
			.from(reviewInteraction)
			.where(eq(reviewInteraction.reviewId, reviewId));

		if (existingInteraction.length > 0) {
			await db
				.update(reviewInteraction)
				.set({
					shares: existingInteraction[0].shares + 1,
					lastUpdated: new Date(),
				})
				.where(eq(reviewInteraction.reviewId, reviewId));
		} else {
			await db.insert(reviewInteraction).values({
				id: nanoid(),
				reviewId: reviewId,
				shares: 1,
				views: 0,
				likes: 0,
				lastUpdated: new Date(),
				createdAt: new Date(),
			});
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error sharing review:", error);
		return NextResponse.json(
			{ error: "Failed to share review" },
			{ status: 500 },
		);
	}
}
