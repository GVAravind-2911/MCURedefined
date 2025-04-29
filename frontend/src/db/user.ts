import { db } from ".";
import { user } from "./schema";
import { eq } from "drizzle-orm";

export async function getUserById(id: string) {
    const result = await db
    .select({
      id: user.id,
      email: user.email
    })
    .from(user)
    .where(eq(user.id, id))
    .limit(1)

  return result[0] || null
}