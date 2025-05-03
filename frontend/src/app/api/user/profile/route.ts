import { auth } from "@/lib/auth/auth";
import { db } from "@/db";
import { user, userProfile } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { profileUpdateSchema } from "@/lib/profile/validation-schema";

export async function GET() {
    try {
        const session = await auth.api.getSession({headers: await headers()});
        
        if (!session?.user?.id) {
            return new Response("Unauthorized", { status: 401 });
        }
        
        // Fetch user profile data
        const profile = await db
            .select()
            .from(userProfile)
            .where(eq(userProfile.userId, session.user.id))
            .limit(1);
            
        return new Response(
            JSON.stringify({ 
                profile: profile.length > 0 ? profile[0] : null 
            }), 
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Error fetching profile:", error);
        return new Response(
            JSON.stringify({ error: "Failed to fetch profile data" }), 
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const session = await auth.api.getSession({headers: await headers()});
        
        if (!session?.user?.id) {
            return new Response("Unauthorized", { status: 401 });
        }
        
        const json = await request.json();
        
        // Validate the request body
        const validationResult = profileUpdateSchema.safeParse(json);
        
        if (!validationResult.success) {
            return new Response(JSON.stringify({ 
                error: "Validation failed",
                details: validationResult.error.errors 
            }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }
        
        const { name, description } = validationResult.data;
        
        // Update user name
        if (name) {
            await db
                .update(user)
                .set({ 
                    name, 
                    updatedAt: new Date() 
                })
                .where(eq(user.id, session.user.id));
        }
        
        // Check if user profile exists
        const existingProfile = await db
            .select()
            .from(userProfile)
            .where(eq(userProfile.userId, session.user.id))
            .limit(1);
            
        // Update or create user profile
        if (existingProfile.length > 0) {
            await db
                .update(userProfile)
                .set({ 
                    description, 
                    updatedAt: new Date() 
                })
                .where(eq(userProfile.userId, session.user.id));
        } else {
            await db.insert(userProfile).values({
                id: crypto.randomUUID(),
                userId: session.user.id,
                description,
            });
        }
        
        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Profile update error:", error);
        return new Response(JSON.stringify({ error: "Failed to update profile" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}