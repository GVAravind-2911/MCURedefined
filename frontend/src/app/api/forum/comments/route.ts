import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/db";
import { forumComment, user, forumCommentLike } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";
import { and, desc, eq, sql, inArray, count } from "drizzle-orm";
import { headers } from "next/headers";

// Constants for edit restrictions
const MAX_EDITS = 5;
const EDIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour in milliseconds

// Get comments for a forum topic with pagination
export async function GET(req: NextRequest) {
	try {
		const url = new URL(req.url);
		const topicId = url.searchParams.get("topicId");
		const page = Number(url.searchParams.get("page")) || 1;
		const limit = Number(url.searchParams.get("limit")) || 20;

		if (!topicId) {
			return NextResponse.json({ error: "Missing topicId" }, { status: 400 });
		}

		const offset = (page - 1) * limit;

		// Clean up expired comment spoilers
		try {
			// @ts-ignore - Drizzle type inference issue with spoiler fields
			await db
				.update(forumComment)
				.set({
                    // @ts-ignore
					isSpoiler: false,
					spoilerFor: null,
					spoilerExpiresAt: null,
				})
				.where(
					and(
						eq(forumComment.isSpoiler, true),
						sql`${forumComment.spoilerExpiresAt} < NOW()`
					)
				);
		} catch (error) {
			console.warn("Failed to clean up expired comment spoilers:", error);
		}

		// Get comments for this forum topic (including deleted ones for Reddit-style display)
		const rawComments = await db
			.select({
				id: forumComment.id,
				content: forumComment.content,
				parentId: forumComment.parentId,
				userId: forumComment.userId,
				topicId: forumComment.topicId,
				createdAt: forumComment.createdAt,
				updatedAt: forumComment.updatedAt,
				deleted: forumComment.deleted,
				isSpoiler: forumComment.isSpoiler,
				spoilerFor: forumComment.spoilerFor,
				spoilerExpiresAt: forumComment.spoilerExpiresAt,
				editCount: forumComment.editCount,
				username: user.displayUsername,
				userImage: user.image,
			})
			.from(forumComment)
			.leftJoin(user, eq(forumComment.userId, user.id))
			.where(eq(forumComment.topicId, topicId))
			.orderBy(desc(forumComment.createdAt))
			.limit(limit)
			.offset(offset);

		// Apply Reddit-style masking for deleted comments
		const comments = rawComments.map(c => {
			if (c.deleted || c.content === "[deleted]") {
				return {
					...c,
					content: "[deleted]",
					username: null,
					userImage: null,
					deleted: true,
				};
			}
			return c;
		});

		// Get current user to check if they've liked comments
		const session = await auth.api.getSession({ headers: await headers() });
		const currentUserId = session?.user?.id;

		// If user is logged in, get their likes
		let userLikes: string[] = [];
		if (currentUserId) {
			const likedComments = await db
				.select({ commentId: forumCommentLike.commentId })
				.from(forumCommentLike)
				.where(eq(forumCommentLike.userId, currentUserId));

			userLikes = likedComments.map((like) => like.commentId);
		}

		// Get like counts for all comments
		const commentIds = comments.map((c) => c.id);
		let likesCount: { commentId: string; count: number }[] = [];

		if (commentIds.length > 0) {
			likesCount = await db
				.select({
					commentId: forumCommentLike.commentId,
					count: sql<number>`count(${forumCommentLike.userId})`.mapWith(
						Number,
					),
				})
				.from(forumCommentLike)
				.where(inArray(forumCommentLike.commentId, commentIds))
				.groupBy(forumCommentLike.commentId);
		}

		// Create a map of comment ID to like count
		const likesMap: Record<string, number> = {};
		for (const item of likesCount) {
			likesMap[item.commentId] = Number(item.count);
		}

		// Enhance comments with like info and edit status
		const now = Date.now();
		const enhancedComments = comments.map((c) => {
			const createdAt = new Date(c.createdAt).getTime();
			const withinEditWindow = (now - createdAt) <= EDIT_WINDOW_MS;
			const canEdit = currentUserId === c.userId && 
				withinEditWindow && 
				(c.editCount || 0) < MAX_EDITS &&
				c.content !== "[deleted]";

			return {
				...c,
				likeCount: likesMap[c.id] || 0,
				userHasLiked: userLikes.includes(c.id),
				canEdit,
			};
		});

		// Get total count for pagination (including deleted comments for proper threading)
		const [{ count: total }] = await db
			.select({ count: sql<number>`count(*)`.mapWith(Number) })
			.from(forumComment)
			.where(eq(forumComment.topicId, topicId));

		return NextResponse.json({
			comments: enhancedComments,
			pagination: {
				page,
				limit,
				total,
				hasMore: page * limit < total,
			},
		});
	} catch (error) {
		console.error("Error fetching forum comments:", error);
		return NextResponse.json(
			{ error: "Failed to fetch comments" },
			{ status: 500 },
		);
	}
}

// Create a new comment
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
		const { topicId, content, parentId, isSpoiler, spoilerFor, spoilerDuration } = body;

		if (!topicId || !content) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		const commentId = uuidv4();

		// Calculate spoiler expiry if this is a spoiler
		let spoilerExpiresAt = null;
		if (isSpoiler && spoilerDuration) {
			const now = new Date();
			const durationMs = spoilerDuration * 24 * 60 * 60 * 1000; // Convert days to milliseconds
			spoilerExpiresAt = new Date(now.getTime() + durationMs);
		}

		// Insert comment
		const insertData: any = {
			id: commentId,
			topicId,
			userId: session.user.id,
			content,
			isSpoiler: isSpoiler || false,
			spoilerFor: spoilerFor || null,
			spoilerExpiresAt,
		};

		if (parentId) {
			insertData.parentId = parentId;
		}

		// @ts-ignore - Drizzle type inference issue with spoiler fields
		await db.insert(forumComment).values(insertData);

		// Get the created comment with user info
		const [newComment] = await db
			.select({
				id: forumComment.id,
				content: forumComment.content,
				parentId: forumComment.parentId,
				userId: forumComment.userId,
				topicId: forumComment.topicId,
				createdAt: forumComment.createdAt,
				updatedAt: forumComment.updatedAt,
				isSpoiler: forumComment.isSpoiler,
				spoilerFor: forumComment.spoilerFor,
				spoilerExpiresAt: forumComment.spoilerExpiresAt,
				username: user.displayUsername,
				userImage: user.image,
			})
			.from(forumComment)
			.leftJoin(user, eq(forumComment.userId, user.id))
			.where(eq(forumComment.id, commentId));

		return NextResponse.json({
			...newComment,
			likes: 0,
			userHasLiked: false,
		});
	} catch (error) {
		console.error("Error creating forum comment:", error);
		return NextResponse.json(
			{ error: "Failed to create comment" },
			{ status: 500 },
		);
	}
}
