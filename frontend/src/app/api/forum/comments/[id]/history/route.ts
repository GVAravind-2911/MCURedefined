import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { forumCommentEditHistory, forumComment } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// Get edit history for a comment
export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;

		// First check if comment exists
		const [comment] = await db
			.select({ id: forumComment.id })
			.from(forumComment)
			.where(eq(forumComment.id, id))
			.limit(1);

		if (!comment) {
			return NextResponse.json({ error: "Comment not found" }, { status: 404 });
		}

		// Get edit history
		const history = await db
			.select({
				id: forumCommentEditHistory.id,
				previousContent: forumCommentEditHistory.previousContent,
				editedAt: forumCommentEditHistory.editedAt,
				editNumber: forumCommentEditHistory.editNumber,
			})
			.from(forumCommentEditHistory)
			.where(eq(forumCommentEditHistory.commentId, id))
			.orderBy(desc(forumCommentEditHistory.editNumber));

		return NextResponse.json({ history });
	} catch (error) {
		console.error("Error fetching comment edit history:", error);
		return NextResponse.json(
			{ error: "Failed to fetch edit history" },
			{ status: 500 },
		);
	}
}
