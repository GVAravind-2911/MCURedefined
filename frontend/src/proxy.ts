import { betterFetch } from "@better-fetch/fetch";
import type { auth } from "@/lib/auth/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type Session = typeof auth.$Infer.Session;

export async function proxy(request: NextRequest) {
	const currentUrl = request.nextUrl;
	const pathname = currentUrl.pathname;

	const { data: session } = await betterFetch<Session>(
		"/api/auth/get-session",
		{
			baseURL: request.nextUrl.origin,
			headers: {
				cookie: request.headers.get("cookie") || "",
			},
		},
	);

	if (pathname.includes("reset-password")) {
		if (session) {
			return NextResponse.redirect(new URL("/", request.url));
		}
	}

	// Check manage routes first (before blogs/reviews check) since /manage/blogs would match both
	if (pathname.includes("manage")) {
		if (!session) {
			return NextResponse.redirect(new URL("/auth", request.url));
		}

		if (session.user.role !== "admin") {
			return NextResponse.redirect(new URL("/", request.url));
		}
	}

	if (
		pathname.includes("blogs") ||
		pathname.includes("release-slate") ||
		pathname.includes("reviews")
	) {
		if (!session) {
			return NextResponse.next();
		}
		if (!session.user.emailVerified) {
			return NextResponse.redirect(new URL("/auth/verify-email", request.url));
		}
	}
	return NextResponse.next();
}

export const config = {
	matcher: [
		"/manage/:path*",
		"/blogs/:path*",
		"/reviews/:path*",
		"/release-slate/:path*",
		"/auth/reset-password",
	],
};
