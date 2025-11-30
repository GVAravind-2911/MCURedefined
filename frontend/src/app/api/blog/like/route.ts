import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/db"; // Adjust import to your db instance
import { like } from "@/db/schema"; // Adjust import to your like table
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { incrementBlogLikes } from "@/db/blog-interactions";

export async function POST(request: NextRequest) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session) {
			return NextResponse.json({ error: "No session id" }, { status: 401 });
		}

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Invalid session" }, { status: 401 });
		}

		const { blogId } = await request.json();
		if (!blogId) {
			return NextResponse.json({ error: "No blog id" }, { status: 400 });
		}

		// Insert like (ignore if already exists)
		await db
			.insert(like)
			.values({
				userId: session.user.id,
				blogId,
			})
			.onConflictDoNothing();

		await incrementBlogLikes(blogId);

		return NextResponse.json({ success: true });
	} catch (e) {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
