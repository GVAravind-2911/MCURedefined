import { db } from ".";
import { like } from "./schema";
import { eq,count } from "drizzle-orm";

export async function getUserLikedBlog(userId: string, blogId: number) {
    const result = await db
        .select()
        .from(like)
        .where(eq(like.userId, userId) && eq(like.blogId, blogId))
        .limit(1);

    return result[0] || null;
}