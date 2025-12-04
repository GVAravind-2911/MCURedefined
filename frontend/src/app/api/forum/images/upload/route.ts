import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

/**
 * Upload a topic image to the backend storage service.
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
		const { image } = body;

		if (!image) {
			return NextResponse.json(
				{ error: "Image data is required" },
				{ status: 400 }
			);
		}

		// Validate basic format
		if (!image.startsWith("data:image")) {
			return NextResponse.json(
				{ error: "Invalid image format. Must be a base64 data URI." },
				{ status: 400 }
			);
		}

		// Check image size (roughly - base64 is ~33% larger than binary)
		// Limit to ~5MB (which is ~6.67MB in base64)
		const maxBase64Size = 7 * 1024 * 1024; // 7MB base64 ≈ 5MB binary
		if (image.length > maxBase64Size) {
			return NextResponse.json(
				{ error: "Image is too large. Maximum size is 5MB." },
				{ status: 400 }
			);
		}

		// Forward to backend
		const response = await fetch(`${BACKEND_URL}/topic-images/upload`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ image }),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			console.error("Backend image upload failed:", errorData);
			return NextResponse.json(
				{ error: errorData.detail || "Failed to upload image" },
				{ status: response.status }
			);
		}

		const data = await response.json();
		return NextResponse.json(data, { status: 201 });
	} catch (error) {
		console.error("Error in topic image upload:", error);
		return NextResponse.json(
			{ error: "Failed to upload image" },
			{ status: 500 }
		);
	}
}
