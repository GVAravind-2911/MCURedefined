import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/db";
import { projectLike, projectInteraction } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });

		if (!session || !session.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { projectId } = await req.json();

		if (!projectId) {
			return NextResponse.json(
				{ error: "Project ID is required" },
				{ status: 400 },
			);
		}

		// Add the like
		await db
			.insert(projectLike)
			.values({
				userId: session.user.id,
				projectId: projectId,
			})
			.onConflictDoNothing();

		// Update the likes count in interactions table
		const existingInteraction = await db
			.select()
			.from(projectInteraction)
			.where(eq(projectInteraction.projectId, projectId));

		if (existingInteraction.length > 0) {
			await db
				.update(projectInteraction)
				.set({
					likes: existingInteraction[0].likes + 1,
					lastUpdated: new Date(),
				})
				.where(eq(projectInteraction.projectId, projectId));
		} else {
			await db.insert(projectInteraction).values({
				id: nanoid(),
				projectId: projectId,
				likes: 1,
			});
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error liking project:", error);
		return NextResponse.json(
			{ error: "Failed to like project" },
			{ status: 500 },
		);
	}
}
