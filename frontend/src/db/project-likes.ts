import { db } from "@/db";
import { projectLike, projectInteraction } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getUserLikedProject(userId: string, projectId: number) {
	try {
		const results = await db
			.select()
			.from(projectLike)
			.where(
				and(
					eq(projectLike.userId, userId),
					eq(projectLike.projectId, projectId),
				),
			);

		return results.length > 0 ? results[0] : null;
	} catch (error) {
		console.error("Error checking if user liked project:", error);
		return null;
	}
}
