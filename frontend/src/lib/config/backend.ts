/**
 * Backend API configuration
 * 
 * This file provides consistent access to backend URLs for both
 * server-side and client-side code.
 */

/**
 * The backend server URL for server-side requests.
 * Uses environment variable or defaults to localhost.
 */
export const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:4000";

/**
 * The API proxy URL for client-side requests.
 * This routes through Next.js API routes to avoid CORS issues.
 */
export const API_PROXY_URL = "/api/proxy";

/**
 * Get the full backend URL for a given path (server-side only).
 * @param path - The API path (e.g., "blogs", "reviews/1")
 * @returns The full backend URL
 */
export function getBackendUrl(path: string): string {
	// Remove leading slash if present
	const cleanPath = path.startsWith("/") ? path.slice(1) : path;
	return `${BACKEND_URL}/${cleanPath}`;
}

/**
 * Get the full proxy URL for a given path (client-side).
 * @param path - The API path (e.g., "blogs", "reviews/1")
 * @returns The full proxy URL
 */
export function getProxyUrl(path: string): string {
	// Remove leading slash if present
	const cleanPath = path.startsWith("/") ? path.slice(1) : path;
	return `${API_PROXY_URL}/${cleanPath}`;
}

/**
 * Default headers for API requests
 */
export const DEFAULT_HEADERS = {
	"Content-Type": "application/json",
};

/**
 * Default cache control headers to prevent caching
 */
export const NO_CACHE_HEADERS = {
	"Cache-Control": "no-cache",
	Pragma: "no-cache",
	Expires: "0",
};
