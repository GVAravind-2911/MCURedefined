import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/db";
import { blogComment, blogCommentLike } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session?.user) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 },
			);
		}

		const commentId = (await params).id;
		const userId = session.user.id;

		// Check if comment exists
		const [existingComment] = await db
			.select()
			.from(blogComment)
			.where(eq(blogComment.id, commentId));

		if (!existingComment) {
			return NextResponse.json({ error: "Comment not found" }, { status: 404 });
		}

		// Check if already liked
		const [existingLike] = await db
			.select()
			.from(blogCommentLike)
			.where(
				and(
					eq(blogCommentLike.commentId, commentId),
					eq(blogCommentLike.userId, userId),
				),
			);

		let liked = false;

		if (existingLike) {
			// Unlike
			await db
				.delete(blogCommentLike)
				.where(
					and(
						eq(blogCommentLike.commentId, commentId),
						eq(blogCommentLike.userId, userId),
					),
				);
		} else {
			// Like
			// @ts-ignore
			await db.insert(blogCommentLike).values({
				commentId,
				userId,
				createdAt: new Date(),
			});
			liked = true;
		}

		// Get updated like count
		const [result] = await db
			.select({
				count: sql<number>`count(*)`.mapWith(Number),
			})
			.from(blogCommentLike)
			.where(eq(blogCommentLike.commentId, commentId));

		return NextResponse.json({
			liked,
			likes: result.count,
		});
	} catch (error) {
		console.error("Error toggling comment like:", error);
		return NextResponse.json(
			{ error: "Failed to toggle like" },
			{ status: 500 },
		);
	}
}
