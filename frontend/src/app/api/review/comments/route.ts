import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/db";
import { reviewComment, user, reviewCommentLike } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";
import { and, desc, eq, sql, inArray } from "drizzle-orm";
import { headers } from "next/headers";

// Get comments for a review
export async function GET(req: NextRequest) {
	try {
		const url = new URL(req.url);
		const reviewId = Number(url.searchParams.get("reviewId"));

		if (!reviewId) {
			return NextResponse.json({ error: "Missing reviewId" }, { status: 400 });
		}

		// Get all comments for this review
		const comments = await db
			.select({
				id: reviewComment.id,
				content: reviewComment.content,
				parentId: reviewComment.parentId,
				userId: reviewComment.userId,
				createdAt: reviewComment.createdAt,
				updatedAt: reviewComment.updatedAt,
				deleted: reviewComment.deleted,
				username: user.displayUsername,
				userImage: user.image,
			})
			.from(reviewComment)
			.leftJoin(user, eq(reviewComment.userId, user.id))
			.where(eq(reviewComment.reviewId, reviewId))
			.orderBy(desc(reviewComment.createdAt));

		// Get current user to check if they've liked comments
		const session = await auth.api.getSession({ headers: await headers() });
		const currentUserId = session?.user?.id;

		// If user is logged in, get their likes
		let userLikes: string[] = [];
		if (currentUserId) {
			const likedComments = await db
				.select({ commentId: reviewCommentLike.commentId })
				.from(reviewCommentLike)
				.where(eq(reviewCommentLike.userId, currentUserId));

			userLikes = likedComments.map((like) => like.commentId);
		}

		// Get like counts for all comments
		const commentIds = comments.map((c) => c.id);
		let likesCount: { commentId: string; count: number }[] = [];

		if (commentIds.length > 0) {
			likesCount = await db
				.select({
					commentId: reviewCommentLike.commentId,
					count: sql<number>`count(${reviewCommentLike.userId})`.mapWith(
						Number,
					),
				})
				.from(reviewCommentLike)
				.where(inArray(reviewCommentLike.commentId, commentIds))
				.groupBy(reviewCommentLike.commentId);
		}

		// Create a map of comment ID to like count
		const likesMap: Record<string, number> = {};
		for (const item of likesCount) {
			likesMap[item.commentId] = Number(item.count);
		}

		// Enhance comments with like info
		const enhancedComments = comments.map((c) => ({
			...c,
			likes: likesMap[c.id] || 0,
			userHasLiked: userLikes.includes(c.id),
		}));

		return NextResponse.json(enhancedComments);
	} catch (error) {
		console.error("Error fetching comments:", error);
		return NextResponse.json(
			{ error: "Failed to fetch comments" },
			{ status: 500 },
		);
	}
}

// Create a new comment
export async function POST(req: NextRequest) {
	try {
		const session = await auth.api.getSession(req);
		if (!session?.user) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 },
			);
		}

		const body = await req.json();
		const { reviewId, content, parentId } = body;

		if (!reviewId || !content) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		const commentId = uuidv4();
		const now = new Date();

		// Insert comment
		await db.insert(reviewComment).values({
			id: commentId,
			reviewId,
			userId: session.user.id,
			parentId: parentId || null,
			content,
			createdAt: now,
			updatedAt: now,
			deleted: false,
		});

		// Get the created comment with user info
		const [newComment] = await db
			.select({
				id: reviewComment.id,
				content: reviewComment.content,
				parentId: reviewComment.parentId,
				userId: reviewComment.userId,
				createdAt: reviewComment.createdAt,
				updatedAt: reviewComment.updatedAt,
				username: user.displayUsername,
				userImage: user.image,
			})
			.from(reviewComment)
			.leftJoin(user, eq(reviewComment.userId, user.id))
			.where(eq(reviewComment.id, commentId));

		return NextResponse.json({
			...newComment,
			likes: 0,
			userHasLiked: false,
		});
	} catch (error) {
		console.error("Error creating comment:", error);
		return NextResponse.json(
			{ error: "Failed to create comment" },
			{ status: 500 },
		);
	}
}
