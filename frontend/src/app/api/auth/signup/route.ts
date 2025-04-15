import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import bcrypt from "bcryptjs";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { authClient } from "@/lib/auth-client";

export async function POST(request: Request) {
	
}
