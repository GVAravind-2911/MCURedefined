import { db } from "@/db";
import { projectInteraction } from "@/db/schema";
import { eq,and } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function getProjectInteractions(projectId: number) {
  try {
    const result = await db
      .select()
      .from(projectInteraction)
      .where(eq(projectInteraction.projectId, projectId));

    if (result.length > 0) {
      return result[0];
    }

    // If no interaction exists yet, create one
    const newInteraction = {
      id: nanoid(),
      projectId: projectId,
      views: 1,
      likes: 0,
      shares: 0,
    };

    await db.insert(projectInteraction).values(newInteraction);
    return newInteraction;
  } catch (error) {
    console.error("Error getting project interactions:", error);
    // Return default values if there's an error
    return { likes: 0, views: 0, shares: 0 };
  }
}

export async function incrementProjectView(projectId: number) {
  try {
    const existingInteraction = await db
      .select()
      .from(projectInteraction)
      .where(eq(projectInteraction.projectId, projectId));

    if (existingInteraction.length > 0) {
      // Update existing record
      await db
        .update(projectInteraction)
        .set({ 
          views: existingInteraction[0].views + 1,
          lastUpdated: new Date()
        })
        .where(eq(projectInteraction.projectId, projectId));
    } else {
      // Create new record
      await db.insert(projectInteraction).values({
        id: nanoid(),
        projectId: projectId,
      });
    }
  } catch (error) {
    console.error("Error incrementing project views:", error);
  }
}