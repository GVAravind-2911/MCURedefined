import { auth } from "@/lib/auth/auth";
import axios from "axios";
import { headers } from "next/headers";
import { getBackendUrl } from "@/lib/config/backend";

export async function GET(req: Request) {
	try {
		// Authenticate user
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session) {
			return new Response(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
			});
		}

		// Get user ID from session
		const user_id = session.user.id;

		// Parse query parameters
		const url = new URL(req.url);
		const type = url.searchParams.get("type") || "blogs";
		const page = Number.parseInt(url.searchParams.get("page") || "1");
		const limit = Number.parseInt(url.searchParams.get("limit") || "5");

		// Send request to backend with all required parameters
		const resp = await axios.post(getBackendUrl("user/liked"), {
			user_id, // Using user_id instead of userId to match backend expectation
			type,
			page,
			limit,
		});

		const data = resp.data;
		return new Response(JSON.stringify(data), {
			status: 200,
			headers: { 
				"Content-Type": "application/json",
				"Cache-Control": "no-store, no-cache, must-revalidate",
			},
		});
	} catch (error) {
		console.error("Error fetching liked items:", error);
		return new Response(JSON.stringify({ error: "Internal Server Error" }), {
			status: 500,
		});
	}
}
