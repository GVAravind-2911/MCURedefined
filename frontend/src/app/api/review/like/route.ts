import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { reviewLike, reviewInteraction } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({headers: await headers()});
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { reviewId } = await req.json();
    
    if (!reviewId) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
    }
    
    // Add the like
    await db.insert(reviewLike).values({
      userId: session.user.id,
      reviewId: reviewId,
    }).onConflictDoNothing();
    
    // Update the likes count in interactions table
    const existingInteraction = await db
      .select()
      .from(reviewInteraction)
      .where(eq(reviewInteraction.reviewId, reviewId));
    
    if (existingInteraction.length > 0) {
      await db
        .update(reviewInteraction)
        .set({ 
          likes: existingInteraction[0].likes + 1,
          lastUpdated: new Date()
        })
        .where(eq(reviewInteraction.reviewId, reviewId));
    } else {
      await db.insert(reviewInteraction).values({
        id: nanoid(),
        reviewId: reviewId,
        likes: 1,
        views: 0,
        shares: 0,
        lastUpdated: new Date(),
        createdAt: new Date()
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error liking review:", error);
    return NextResponse.json(
      { error: "Failed to like review" },
      { status: 500 }
    );
  }
}