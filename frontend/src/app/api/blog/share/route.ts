import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { incrementShareCount } from "@/db/blog-interactions";

export async function POST(request: NextRequest) {
  try {
    const { blogId } = await request.json();
    
    if (!blogId) {
      return NextResponse.json({ error: "No blog id" }, { status: 400 });
    }

    // Increment share count
    await incrementShareCount(blogId);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Error recording share:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}