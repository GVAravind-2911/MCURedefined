import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/db";
import { forumComment, forumCommentEditHistory, user } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { v4 as uuidv4 } from "uuid";

// Constants for edit restrictions
const MAX_EDITS = 5;
const EDIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour in milliseconds

// Edit a forum comment
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
		const { content } = body;

		if (!content || !content.trim()) {
			return NextResponse.json(
				{ error: "Content is required" },
				{ status: 400 }
			);
		}

		// Get existing comment
		const [existingComment] = await db
			.select()
			.from(forumComment)
			.where(and(eq(forumComment.id, id), eq(forumComment.deleted, false)))
			.limit(1);

		if (!existingComment) {
			return NextResponse.json(
				{ error: "Comment not found" },
				{ status: 404 }
			);
		}

		if (existingComment.userId !== session.user.id) {
			return NextResponse.json(
				{ error: "You can only edit your own comments" },
				{ status: 403 }
			);
		}

		if (existingComment.content === "[deleted]") {
			return NextResponse.json(
				{ error: "Cannot edit a deleted comment" },
				{ status: 403 }
			);
		}

		// Check edit restrictions
		const createdAt = new Date(existingComment.createdAt).getTime();
		const now = Date.now();
		const withinEditWindow = (now - createdAt) <= EDIT_WINDOW_MS;

		if (!withinEditWindow) {
			return NextResponse.json(
				{ error: "Comments can only be edited within 1 hour of creation" },
				{ status: 403 }
			);
		}

		const currentEditCount = existingComment.editCount || 0;
		if (currentEditCount >= MAX_EDITS) {
			return NextResponse.json(
				{ error: "Maximum number of edits (5) reached" },
				{ status: 403 }
			);
		}

		// Check if content actually changed
		if (existingComment.content.trim() === content.trim()) {
			return NextResponse.json(
				{ error: "No changes detected" },
				{ status: 400 }
			);
		}

		// Save edit history
		await db.insert(forumCommentEditHistory).values({
			id: uuidv4(),
			commentId: id,
			previousContent: existingComment.content,
			editNumber: currentEditCount + 1,
		});

		// Update the comment
		await db
			.update(forumComment)
			.set({
				content: content.trim(),
				editCount: currentEditCount + 1,
				updatedAt: new Date(),
			})
			.where(eq(forumComment.id, id));

		// Get updated comment with user info
		const [updatedComment] = await db
			.select({
				id: forumComment.id,
				content: forumComment.content,
				parentId: forumComment.parentId,
				userId: forumComment.userId,
				topicId: forumComment.topicId,
				createdAt: forumComment.createdAt,
				updatedAt: forumComment.updatedAt,
				editCount: forumComment.editCount,
				isSpoiler: forumComment.isSpoiler,
				spoilerFor: forumComment.spoilerFor,
				spoilerExpiresAt: forumComment.spoilerExpiresAt,
				username: user.displayUsername,
				userImage: user.image,
			})
			.from(forumComment)
			.leftJoin(user, eq(forumComment.userId, user.id))
			.where(eq(forumComment.id, id));

		const remainingEdits = MAX_EDITS - (currentEditCount + 1);
		const editWindowEndsAt = new Date(createdAt + EDIT_WINDOW_MS);

		return NextResponse.json({
			...updatedComment,
			remainingEdits,
			editWindowEndsAt,
			canEdit: remainingEdits > 0 && Date.now() <= editWindowEndsAt.getTime(),
		});
	} catch (error) {
		console.error("Error editing comment:", error);
		return NextResponse.json(
			{ error: "Failed to edit comment" },
			{ status: 500 }
		);
	}
}

// Soft delete a forum comment
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

		// Check if the comment exists and belongs to the user (or user is admin)
		const [existingComment] = await db
			.select({
				id: forumComment.id,
				userId: forumComment.userId,
				deleted: forumComment.deleted,
			})
			.from(forumComment)
			.where(and(eq(forumComment.id, id), eq(forumComment.deleted, false)))
			.limit(1);

		if (!existingComment) {
			return NextResponse.json(
				{ error: "Comment not found" },
				{ status: 404 }
			);
		}

		// Check if user owns the comment or is admin
		const isOwner = existingComment.userId === session.user.id;
		const isAdmin = session.user.role === "admin";

		if (!isOwner && !isAdmin) {
			return NextResponse.json(
				{ error: "You can only delete your own comments" },
				{ status: 403 }
			);
		}

		// Soft delete the comment
		await db
			.update(forumComment)
			.set({
				content: "[deleted]",
			})
			.where(eq(forumComment.id, id));

		return NextResponse.json({ message: "Comment deleted successfully" });
	} catch (error) {
		console.error("Error deleting comment:", error);
		return NextResponse.json(
			{ error: "Failed to delete comment" },
			{ status: 500 }
		);
	}
}
