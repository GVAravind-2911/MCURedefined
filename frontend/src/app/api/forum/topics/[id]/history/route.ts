import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { forumTopicEditHistory, forumTopic } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// Get edit history for a topic
export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;

		// First check if topic exists
		const [topic] = await db
			.select({ id: forumTopic.id })
			.from(forumTopic)
			.where(eq(forumTopic.id, id))
			.limit(1);

		if (!topic) {
			return NextResponse.json({ error: "Topic not found" }, { status: 404 });
		}

		// Get edit history
		const history = await db
			.select({
				id: forumTopicEditHistory.id,
				previousTitle: forumTopicEditHistory.previousTitle,
				previousContent: forumTopicEditHistory.previousContent,
				editedAt: forumTopicEditHistory.editedAt,
				editNumber: forumTopicEditHistory.editNumber,
			})
			.from(forumTopicEditHistory)
			.where(eq(forumTopicEditHistory.topicId, id))
			.orderBy(desc(forumTopicEditHistory.editNumber));

		return NextResponse.json({ history });
	} catch (error) {
		console.error("Error fetching topic edit history:", error);
		return NextResponse.json(
			{ error: "Failed to fetch edit history" },
			{ status: 500 },
		);
	}
}
