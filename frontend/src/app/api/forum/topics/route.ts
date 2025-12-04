import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/db";
import { forumTopic, user, forumTopicLike, forumComment } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";
import { and, desc, eq, sql, count, isNull, inArray } from "drizzle-orm";
import { headers } from "next/headers";

// Get forum topics with pagination and sorting
export async function GET(req: NextRequest) {
	try {
		const url = new URL(req.url);
		const page = Number(url.searchParams.get("page")) || 1;
		const limit = Number(url.searchParams.get("limit")) || 10;
		const sortBy = url.searchParams.get("sortBy") || "latest"; // latest, popular, oldest
		const search = url.searchParams.get("search") || "";

		const offset = (page - 1) * limit;

		// Get current user session
		const session = await auth.api.getSession({ headers: await headers() });
		const currentUserId = session?.user?.id;

		// Clean up expired spoilers
		try {
			await db
				.update(forumTopic)
				.set({
					isSpoiler: false,
					spoilerFor: null,
					spoilerExpiresAt: null,
				})
				.where(
					and(
						eq(forumTopic.isSpoiler, true),
						sql`${forumTopic.spoilerExpiresAt} < NOW()`
					)
				);
		} catch (error) {
			console.warn("Failed to clean up expired topic spoilers:", error);
		}

		// Build the base query with conditional where clause
		let whereClause = eq(forumTopic.deleted, false);
		if (search) {
			whereClause = and(
				eq(forumTopic.deleted, false),
				sql`LOWER(${forumTopic.title}) LIKE LOWER(${'%' + search + '%'})`
			);
		}

		// Build the order by clause
		let orderBy;
		switch (sortBy) {
			case "popular":
				orderBy = desc(sql`COALESCE(COUNT(DISTINCT ${forumTopicLike.userId}), 0)`);
				break;
			case "oldest":
				orderBy = forumTopic.createdAt;
				break;
			case "latest":
			default:
				orderBy = desc(forumTopic.createdAt);
				break;
		}

		// Get topics with user info, like counts, and comment counts
		const topics = await db
			.select({
				id: forumTopic.id,
				title: forumTopic.title,
				content: forumTopic.content,
				userId: forumTopic.userId,
				createdAt: forumTopic.createdAt,
				updatedAt: forumTopic.updatedAt,
				deleted: forumTopic.deleted,
				pinned: forumTopic.pinned,
				locked: forumTopic.locked,
				isSpoiler: forumTopic.isSpoiler,
				spoilerFor: forumTopic.spoilerFor,
				spoilerExpiresAt: forumTopic.spoilerExpiresAt,
				imageUrl: forumTopic.imageUrl,
				username: user.displayUsername,
				userImage: user.image,
				likeCount: sql<number>`COALESCE(COUNT(DISTINCT ${forumTopicLike.userId}), 0)`.mapWith(Number),
				commentCount: sql<number>`COALESCE(COUNT(DISTINCT ${forumComment.id}), 0)`.mapWith(Number),
			})
			.from(forumTopic)
			.leftJoin(user, eq(forumTopic.userId, user.id))
			.leftJoin(forumTopicLike, eq(forumTopic.id, forumTopicLike.topicId))
			.leftJoin(forumComment, and(
				eq(forumTopic.id, forumComment.topicId),
				eq(forumComment.deleted, false)
			))
			.where(whereClause)
			.groupBy(
				forumTopic.id,
				forumTopic.title,
				forumTopic.content,
				forumTopic.userId,
				forumTopic.createdAt,
				forumTopic.updatedAt,
				forumTopic.deleted,
				forumTopic.pinned,
				forumTopic.locked,
				forumTopic.isSpoiler,
				forumTopic.spoilerFor,
				forumTopic.spoilerExpiresAt,
				forumTopic.imageUrl,
				user.displayUsername,
				user.image
			)
			.orderBy(desc(forumTopic.pinned), orderBy)
			.limit(limit)
			.offset(offset);

		// Get total count for pagination
		const [{ count: total }] = await db
			.select({ count: count() })
			.from(forumTopic)
			.where(whereClause);

		// Get user's likes for these topics if logged in
		let userLikedTopicIds: string[] = [];
		if (currentUserId && topics.length > 0) {
			const topicIds = topics.map(t => t.id);
			const userLikes = await db
				.select({ topicId: forumTopicLike.topicId })
				.from(forumTopicLike)
				.where(
					and(
						eq(forumTopicLike.userId, currentUserId),
						inArray(forumTopicLike.topicId, topicIds)
					)
				);
			userLikedTopicIds = userLikes.map(l => l.topicId);
		}

		// Add userHasLiked to each topic
		const topicsWithLikeStatus = topics.map(topic => ({
			...topic,
			userHasLiked: userLikedTopicIds.includes(topic.id),
		}));

		return NextResponse.json({
			topics: topicsWithLikeStatus,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Error fetching forum topics:", error);
		return NextResponse.json(
			{ error: "Failed to fetch forum topics" },
			{ status: 500 }
		);
	}
}

// Create a new forum topic
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
		const { title, content, isSpoiler, spoilerFor, spoilerExpiresAt, imageUrl, imageKey } = body;

		if (!title || !content) {
			return NextResponse.json(
				{ error: "Title and content are required" },
				{ status: 400 }
			);
		}

		if (title.length > 200) {
			return NextResponse.json(
				{ error: "Title must be 200 characters or less" },
				{ status: 400 }
			);
		}

		if (content.length > 10000) {
			return NextResponse.json(
				{ error: "Content must be 10,000 characters or less" },
				{ status: 400 }
			);
		}

		if (isSpoiler && !spoilerFor) {
			return NextResponse.json(
				{ error: "Spoiler description is required when marking as spoiler" },
				{ status: 400 }
			);
		}

		const topicId = uuidv4();

		// Prepare topic data
		const topicData: any = {
			id: topicId,
			title: title.trim(),
			content: content.trim(),
			userId: session.user.id,
		};

		// Add spoiler data if provided
		if (isSpoiler) {
			topicData.isSpoiler = true;
			topicData.spoilerFor = spoilerFor.trim();
			topicData.spoilerExpiresAt = new Date(spoilerExpiresAt);
		}

		// Add image data if provided (image should already be uploaded via /api/forum/images/upload)
		if (imageUrl && imageKey) {
			topicData.imageUrl = imageUrl;
			topicData.imageKey = imageKey;
		}

		// Insert topic
		await db.insert(forumTopic).values(topicData);

		// Get the created topic with user info
		const [newTopic] = await db
			.select({
				id: forumTopic.id,
				title: forumTopic.title,
				content: forumTopic.content,
				userId: forumTopic.userId,
				createdAt: forumTopic.createdAt,
				updatedAt: forumTopic.updatedAt,
				deleted: forumTopic.deleted,
				pinned: forumTopic.pinned,
				locked: forumTopic.locked,
				isSpoiler: forumTopic.isSpoiler,
				spoilerFor: forumTopic.spoilerFor,
				spoilerExpiresAt: forumTopic.spoilerExpiresAt,
				imageUrl: forumTopic.imageUrl,
				imageKey: forumTopic.imageKey,
				username: user.displayUsername,
				userImage: user.image,
			})
			.from(forumTopic)
			.leftJoin(user, eq(forumTopic.userId, user.id))
			.where(eq(forumTopic.id, topicId));

		return NextResponse.json({
			...newTopic,
			likeCount: 0,
			commentCount: 0,
			userHasLiked: false,
		});
	} catch (error) {
		console.error("Error creating forum topic:", error);
		return NextResponse.json(
			{ error: "Failed to create forum topic" },
			{ status: 500 }
		);
	}
}
