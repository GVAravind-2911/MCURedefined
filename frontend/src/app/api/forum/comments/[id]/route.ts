import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/db";
import { forumComment } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

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
