import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

/**
 * Delete a topic image from the backend storage service.
 * 
 * This route acts as a proxy to the backend image service, adding authentication.
 * When moving to a separate image service, update the BACKEND_URL accordingly.
 */
export async function POST(req: NextRequest) {
	try {
		// Check authentication
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session?.user) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		const body = await req.json();
		const { key } = body;

		if (!key) {
			return NextResponse.json(
				{ error: "Image key is required" },
				{ status: 400 }
			);
		}

		// Validate key format (should be topic-images/uuid.ext)
		if (!key.startsWith("topic-images/")) {
			return NextResponse.json(
				{ error: "Invalid image key format" },
				{ status: 400 }
			);
		}

		// Forward to backend
		const response = await fetch(`${BACKEND_URL}/topic-images/delete`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ key }),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			console.error("Backend image delete failed:", errorData);
			return NextResponse.json(
				{ error: errorData.detail || "Failed to delete image" },
				{ status: response.status }
			);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error in topic image delete:", error);
		return NextResponse.json(
			{ error: "Failed to delete image" },
			{ status: 500 }
		);
	}
}
