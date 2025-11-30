import { type NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:4000";

interface RouteParams {
	params: Promise<{ path: string[] }>;
}

/**
 * Proxy handler for forwarding requests to the backend API
 * Supports GET, POST, PUT, DELETE methods
 */
async function proxyRequest(
	request: NextRequest,
	path: string[],
	method: string,
): Promise<NextResponse> {
	const pathString = path.join("/");
	const url = new URL(request.url);
	const queryString = url.search;
	const targetUrl = `${BACKEND_URL}/${pathString}${queryString}`;

	const headers: HeadersInit = {
		"Content-Type": "application/json",
	};

	// Forward authorization header if present
	const authHeader = request.headers.get("Authorization");
	if (authHeader) {
		headers.Authorization = authHeader;
	}

	// Forward cache control headers
	const cacheControl = request.headers.get("Cache-Control");
	if (cacheControl) {
		headers["Cache-Control"] = cacheControl;
	}

	try {
		const fetchOptions: RequestInit = {
			method,
			headers,
		};

		// Add body for POST/PUT requests
		if (method === "POST" || method === "PUT") {
			const body = await request.json();
			fetchOptions.body = JSON.stringify(body);
		}

		const response = await fetch(targetUrl, fetchOptions);
		
		// Get response as text first to handle non-JSON responses
		const responseText = await response.text();
		
		// Try to parse as JSON
		try {
			const data = JSON.parse(responseText);
			return NextResponse.json(data, { status: response.status });
		} catch {
			// If not JSON, return the text as an error
			console.error(`Backend returned non-JSON response: ${responseText.substring(0, 200)}`);
			return NextResponse.json(
				{ error: "Backend error", details: responseText.substring(0, 500) },
				{ status: response.status || 500 },
			);
		}
	} catch (error) {
		console.error(`Proxy error for ${method} ${targetUrl}:`, error);

		// Check if it's a connection error
		if (error instanceof TypeError && error.message.includes("fetch")) {
			return NextResponse.json(
				{ error: "Backend service unavailable", code: "ECONNREFUSED" },
				{ status: 503 },
			);
		}

		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function GET(
	request: NextRequest,
	{ params }: RouteParams,
): Promise<NextResponse> {
	const { path } = await params;
	return proxyRequest(request, path, "GET");
}

export async function POST(
	request: NextRequest,
	{ params }: RouteParams,
): Promise<NextResponse> {
	const { path } = await params;
	return proxyRequest(request, path, "POST");
}

export async function PUT(
	request: NextRequest,
	{ params }: RouteParams,
): Promise<NextResponse> {
	const { path } = await params;
	return proxyRequest(request, path, "PUT");
}

export async function DELETE(
	request: NextRequest,
	{ params }: RouteParams,
): Promise<NextResponse> {
	const { path } = await params;
	return proxyRequest(request, path, "DELETE");
}
