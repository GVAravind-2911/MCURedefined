import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/db";
import { forumCommentLike } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session?.user) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		const body = await req.json();
		const { commentId } = body;

		if (!commentId) {
			return NextResponse.json(
				{ error: "Comment ID is required" },
				{ status: 400 }
			);
		}

		// Check if user has already liked this comment
		const existingLike = await db
			.select()
			.from(forumCommentLike)
			.where(
				and(
					eq(forumCommentLike.commentId, commentId),
					eq(forumCommentLike.userId, session.user.id)
				)
			)
			.limit(1);

		if (existingLike.length > 0) {
			// Unlike the comment
			await db
				.delete(forumCommentLike)
				.where(
					and(
						eq(forumCommentLike.commentId, commentId),
						eq(forumCommentLike.userId, session.user.id)
					)
				);

			return NextResponse.json({ liked: false });
		} else {
			// Like the comment
			await db.insert(forumCommentLike).values({
				commentId,
				userId: session.user.id,
			});

			return NextResponse.json({ liked: true });
		}
	} catch (error) {
		console.error("Error toggling forum comment like:", error);
		return NextResponse.json(
			{ error: "Failed to toggle like" },
			{ status: 500 }
		);
	}
}
