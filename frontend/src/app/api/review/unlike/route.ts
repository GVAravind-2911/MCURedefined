import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { reviewLike, reviewInteraction } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });

		if (!session || !session.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { reviewId } = await req.json();

		if (!reviewId) {
			return NextResponse.json(
				{ error: "Review ID is required" },
				{ status: 400 },
			);
		}

		// Remove the like
		await db
			.delete(reviewLike)
			.where(
				and(
					eq(reviewLike.userId, session.user.id),
					eq(reviewLike.reviewId, reviewId),
				),
			);

		// Update the likes count in interactions table
		const existingInteraction = await db
			.select()
			.from(reviewInteraction)
			.where(eq(reviewInteraction.reviewId, reviewId));

		if (existingInteraction.length > 0 && existingInteraction[0].likes > 0) {
			await db
				.update(reviewInteraction)
				.set({
					likes: existingInteraction[0].likes - 1,
					lastUpdated: new Date(),
				})
				.where(eq(reviewInteraction.reviewId, reviewId));
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error unliking review:", error);
		return NextResponse.json(
			{ error: "Failed to unlike review" },
			{ status: 500 },
		);
	}
}
