import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/db";
import { forumTopicLike } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session?.user) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 },
			);
		}

		const body = await req.json();
		const { topicId } = body;

		if (!topicId) {
			return NextResponse.json(
				{ error: "Topic ID is required" },
				{ status: 400 },
			);
		}

		// Check if user has already liked this topic
		const existingLike = await db
			.select()
			.from(forumTopicLike)
			.where(
				and(
					eq(forumTopicLike.topicId, topicId),
					eq(forumTopicLike.userId, session.user.id),
				),
			)
			.limit(1);

		if (existingLike.length > 0) {
			// Unlike the topic
			await db
				.delete(forumTopicLike)
				.where(
					and(
						eq(forumTopicLike.topicId, topicId),
						eq(forumTopicLike.userId, session.user.id),
					),
				);

			return NextResponse.json({ liked: false });
		} else {
			// Like the topic
			await db.insert(forumTopicLike).values({
				topicId,
				userId: session.user.id,
			});

			return NextResponse.json({ liked: true });
		}
	} catch (error) {
		console.error("Error toggling forum topic like:", error);
		return NextResponse.json(
			{ error: "Failed to toggle like" },
			{ status: 500 },
		);
	}
}
