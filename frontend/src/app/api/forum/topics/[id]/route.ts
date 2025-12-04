import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/db";
import { forumTopic, user, forumTopicLike, forumTopicEditHistory } from "@/db/schema";
import { and, eq, sql, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { v4 as uuidv4 } from "uuid";

// Constants for edit restrictions
const MAX_EDITS = 5;
const EDIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour in milliseconds

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

/**
 * Helper function to delete topic image from backend storage
 */
async function deleteTopicImage(imageKey: string): Promise<boolean> {
	if (!imageKey) return false;
	
	try {
		const response = await fetch(`${BACKEND_URL}/topic-images/delete`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ key: imageKey }),
		});
		
		if (!response.ok) {
			console.error("Failed to delete topic image:", imageKey);
			return false;
		}
		
		return true;
	} catch (error) {
		console.error("Error deleting topic image:", error);
		return false;
	}
}

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
				editCount: forumTopic.editCount,
				imageUrl: forumTopic.imageUrl,
				imageKey: forumTopic.imageKey,
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
				forumTopic.editCount,
				forumTopic.imageUrl,
				forumTopic.imageKey,
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
		let canEdit = false;

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

			// Check if user can edit (owner, within 1 hour, less than 5 edits)
			if (topic.userId === session.user.id && !topic.deleted && !topic.locked) {
				const createdAt = new Date(topic.createdAt).getTime();
				const now = Date.now();
				const withinEditWindow = (now - createdAt) <= EDIT_WINDOW_MS;
				canEdit = withinEditWindow && (topic.editCount || 0) < MAX_EDITS;
			}
		}

		return NextResponse.json({
			...topic,
			userHasLiked,
			canEdit,
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

		// Check edit restrictions: within 1 hour and max 5 edits
		const createdAt = new Date(existingTopic.createdAt).getTime();
		const now = Date.now();
		const withinEditWindow = (now - createdAt) <= EDIT_WINDOW_MS;

		if (!withinEditWindow) {
			return NextResponse.json(
				{ error: "Topics can only be edited within 1 hour of creation" },
				{ status: 403 }
			);
		}

		const currentEditCount = existingTopic.editCount || 0;
		if (currentEditCount >= MAX_EDITS) {
			return NextResponse.json(
				{ error: "Maximum number of edits (5) reached" },
				{ status: 403 }
			);
		}

		// Check if content actually changed
		const titleChanged = existingTopic.title.trim() !== title.trim();
		const contentChanged = existingTopic.content.trim() !== content.trim();

		if (!titleChanged && !contentChanged) {
			return NextResponse.json(
				{ error: "No changes detected" },
				{ status: 400 }
			);
		}

		// If the topic has an image, delete it when editing (images cannot be edited)
		if (existingTopic.imageKey) {
			console.log("Deleting topic image on edit:", existingTopic.imageKey);
			await deleteTopicImage(existingTopic.imageKey);
		}

		// Save edit history before updating
		await db.insert(forumTopicEditHistory).values({
			id: uuidv4(),
			topicId: id,
			previousTitle: existingTopic.title,
			previousContent: existingTopic.content,
			editNumber: currentEditCount + 1,
		});

		// Update the topic (clear image fields since image was deleted)
		await db
			.update(forumTopic)
			.set({
				title: title.trim(),
				content: content.trim(),
				editCount: currentEditCount + 1,
				imageUrl: null,
				imageKey: null,
				updatedAt: new Date(),
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
				editCount: forumTopic.editCount,
				imageUrl: forumTopic.imageUrl,
				imageKey: forumTopic.imageKey,
				username: user.displayUsername,
				userImage: user.image,
			})
			.from(forumTopic)
			.leftJoin(user, eq(forumTopic.userId, user.id))
			.where(eq(forumTopic.id, id));

		// Calculate remaining edits and time
		const remainingEdits = MAX_EDITS - (currentEditCount + 1);
		const editWindowEndsAt = new Date(createdAt + EDIT_WINDOW_MS);

		return NextResponse.json({
			...updatedTopic,
			remainingEdits,
			editWindowEndsAt,
			canEdit: remainingEdits > 0 && Date.now() <= editWindowEndsAt.getTime(),
		});
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

		// Delete the image if it exists
		if (existingTopic.imageKey) {
			console.log("Deleting topic image on delete:", existingTopic.imageKey);
			await deleteTopicImage(existingTopic.imageKey);
		}

		// Soft delete the topic by setting deleted flag and updating content
		await db
			.update(forumTopic)
			.set({
				deleted: true,
				title: "[DELETED]",
				content: "[This topic has been deleted by the author]",
				imageUrl: null,
				imageKey: null,
				updatedAt: new Date(),
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
