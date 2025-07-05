import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { reviewLike } from "@/db/schema";
import { incrementReviewLikes } from "@/db/review-interactions";

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

		// Add the like (ignore if already exists)
		await db
			.insert(reviewLike)
			.values({
				userId: session.user.id,
				reviewId: reviewId,
			})
			.onConflictDoNothing();

		// Increment the likes count in the interaction table
		await incrementReviewLikes(reviewId);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error liking review:", error);
		return NextResponse.json(
			{ error: "Failed to like review" },
			{ status: 500 },
		);
	}
}
