import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/db";
import { forumTopic, user, forumTopicLike } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";

// Get a single forum topic by ID
export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;

		// Get topic with user info and like count (include deleted topics)
		const [topic] = await db
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
				username: user.displayUsername,
				userImage: user.image,
				likeCount: sql<number>`COALESCE(COUNT(DISTINCT ${forumTopicLike.userId}), 0)`.mapWith(Number),
			})
			.from(forumTopic)
			.leftJoin(user, eq(forumTopic.userId, user.id))
			.leftJoin(forumTopicLike, eq(forumTopic.id, forumTopicLike.topicId))
			.where(eq(forumTopic.id, id))
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
				user.displayUsername,
				user.image
			);

		if (!topic) {
			return NextResponse.json(
				{ error: "Forum topic not found" },
				{ status: 404 }
			);
		}

		// Check if current user has liked this topic
		const session = await auth.api.getSession({ headers: await headers() });
		let userHasLiked = false;

		if (session?.user) {
			const [like] = await db
				.select()
				.from(forumTopicLike)
				.where(
					and(
						eq(forumTopicLike.topicId, id),
						eq(forumTopicLike.userId, session.user.id)
					)
				)
				.limit(1);

			userHasLiked = !!like;
		}

		return NextResponse.json({
			...topic,
			userHasLiked,
		});
	} catch (error) {
		console.error("Error fetching forum topic:", error);
		return NextResponse.json(
			{ error: "Failed to fetch forum topic" },
			{ status: 500 }
		);
	}
}

// Update a forum topic
export async function PUT(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session?.user) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		const { id } = await params;
		const body = await req.json();
		const { title, content } = body;

		if (!title || !content) {
			return NextResponse.json(
				{ error: "Title and content are required" },
				{ status: 400 }
			);
		}

		// Check if topic exists and user owns it
		const [existingTopic] = await db
			.select()
			.from(forumTopic)
			.where(and(eq(forumTopic.id, id), eq(forumTopic.deleted, false)))
			.limit(1);

		if (!existingTopic) {
			return NextResponse.json(
				{ error: "Forum topic not found" },
				{ status: 404 }
			);
		}

		if (existingTopic.userId !== session.user.id) {
			return NextResponse.json(
				{ error: "You can only edit your own topics" },
				{ status: 403 }
			);
		}

		if (existingTopic.locked) {
			return NextResponse.json(
				{ error: "This topic is locked and cannot be edited" },
				{ status: 403 }
			);
		}

		// Update the topic
		await db
			.update(forumTopic)
			.set({
				title: title.trim(),
				content: content.trim(),
			})
			.where(eq(forumTopic.id, id));

		// Return updated topic
		const [updatedTopic] = await db
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
				username: user.displayUsername,
				userImage: user.image,
			})
			.from(forumTopic)
			.leftJoin(user, eq(forumTopic.userId, user.id))
			.where(eq(forumTopic.id, id));

		return NextResponse.json(updatedTopic);
	} catch (error) {
		console.error("Error updating forum topic:", error);
		return NextResponse.json(
			{ error: "Failed to update forum topic" },
			{ status: 500 }
		);
	}
}

// Delete a forum topic (soft delete)
export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session?.user) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		const { id } = await params;

		// Check if topic exists and get user info
		const [existingTopic] = await db
			.select()
			.from(forumTopic)
			.where(and(eq(forumTopic.id, id), eq(forumTopic.deleted, false)))
			.limit(1);

		if (!existingTopic) {
			return NextResponse.json(
				{ error: "Forum topic not found" },
				{ status: 404 }
			);
		}

		if (existingTopic.userId !== session.user.id) {
			return NextResponse.json(
				{ error: "You can only delete your own topics" },
				{ status: 403 }
			);
		}

		// Soft delete the topic by updating the deleted field and content
		await db
			.update(forumTopic)
			.set({
				title: "[DELETED]",
				content: "[This topic has been deleted by the author]",
			})
			.where(eq(forumTopic.id, id));

		return NextResponse.json({ message: "Forum topic deleted successfully" });
	} catch (error) {
		console.error("Error deleting forum topic:", error);
		return NextResponse.json(
			{ error: "Failed to delete forum topic" },
			{ status: 500 }
		);
	}
}
