import { NextResponse } from "next/server";
import { db } from "@/db";
import { projectInteraction } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  try {
    const { projectId } = await req.json();
    
    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }
    
    // Update the shares count in interactions table
    const existingInteraction = await db
      .select()
      .from(projectInteraction)
      .where(eq(projectInteraction.projectId, projectId));
    
    if (existingInteraction.length > 0) {
      await db
        .update(projectInteraction)
        .set({ 
          shares: existingInteraction[0].shares + 1,
          lastUpdated: new Date()
        })
        .where(eq(projectInteraction.projectId, projectId));
    } else {
      await db.insert(projectInteraction).values({
        id: nanoid(),
        projectId: projectId,
        shares: 1,
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sharing project:", error);
    return NextResponse.json(
      { error: "Failed to share project" },
      { status: 500 }
    );
  }
}