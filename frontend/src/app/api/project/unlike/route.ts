import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/db";
import { projectLike, projectInteraction  } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({headers: await headers()});
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { projectId } = await req.json();
    
    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }
    
    // Remove the like
    await db
      .delete(projectLike)
      .where(
        and(
          eq(projectLike.userId, session.user.id),
          eq(projectLike.projectId, projectId)
        )
      );
    
    // Update the likes count in interactions table
    const existingInteraction = await db
      .select()
      .from(projectInteraction)
      .where(eq(projectInteraction.projectId, projectId));
    
    if (existingInteraction.length > 0 && existingInteraction[0].likes > 0) {
      await db
        .update(projectInteraction)
        .set({ 
          likes: existingInteraction[0].likes - 1,
          lastUpdated: new Date()
        })
        .where(eq(projectInteraction.projectId, projectId));
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unliking project:", error);
    return NextResponse.json(
      { error: "Failed to unlike project" },
      { status: 500 }
    );
  }
}