import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/db";
import { reviewComment } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

// Delete a comment (soft delete)
export async function DELETE(
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

		// Get the comment
		const [existingComment] = await db
			.select()
			.from(reviewComment)
			.where(eq(reviewComment.id, (await params).id));

		if (!existingComment) {
			return NextResponse.json({ error: "Comment not found" }, { status: 404 });
		}

		// Check if user owns the comment or is admin
		if (
			existingComment.userId !== session.user.id &&
			session.user.role !== "admin"
		) {
			return NextResponse.json(
				{ error: "Not authorized to delete this comment" },
				{ status: 403 },
			);
		}

		// Soft delete the comment
		await db
			.update(reviewComment)
			.set({
				// @ts-ignore
				deleted: true,
				content: "[comment deleted]",
				updatedAt: new Date(),
			})
			.where(eq(reviewComment.id, (await params).id));

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting comment:", error);
		return NextResponse.json(
			{ error: "Failed to delete comment" },
			{ status: 500 },
		);
	}
}
