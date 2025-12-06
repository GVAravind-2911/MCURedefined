/**
 * Shared data fetching utilities for content pages (blogs and reviews)
 */

import type {
	ContentConfig,
	ContentListResponse,
	ErrorState,
} from "@/types/ContentTypes";
import { handleApiError } from "@/lib/content/utils";
import { getBackendUrl, NO_CACHE_HEADERS } from "@/lib/config/backend";
import axios from "axios";

export interface ContentListData<T = unknown> {
	items: T[];
	total: number;
	totalPages: number;
	tags: string[];
	authors: string[];
}

/**
 * Fetch paginated content list with tags and authors
 */
export async function getContentList<T = unknown>(
	config: ContentConfig,
	page = 1,
	limit = 5,
): Promise<ContentListData<T> | ErrorState> {
	try {
		// Make parallel requests to fetch all needed data at once
		const [contentResponse, tagsResponse, authorsResponse] = await Promise.all([
			axios.get<ContentListResponse>(
				getBackendUrl(`${config.apiPath}?page=${page}&limit=${limit}`),
				{
					headers: NO_CACHE_HEADERS,
					timeout: 10000,
				},
			),
			axios.get<{ tags: string[] }>(getBackendUrl(`${config.apiPath}/tags`), {
				headers: NO_CACHE_HEADERS,
				timeout: 5000,
			}),
			axios.get<{ authors: string[] }>(
				getBackendUrl(`${config.apiPath}/authors`),
				{
					headers: NO_CACHE_HEADERS,
					timeout: 5000,
				},
			),
		]);

		const { blogs, total } = contentResponse.data;
		const totalPages =
			contentResponse.data.total_pages || Math.ceil(total / limit);

		return {
			items: (blogs || []) as T[],
			total: total || 0,
			totalPages,
			tags: tagsResponse.data.tags || [],
			authors: authorsResponse.data.authors || [],
		};
	} catch (error) {
		return handleApiError(error, config.singularName);
	}
}

/**
 * Fetch a single content item by ID
 */
export async function getContentById<T>(
	config: ContentConfig,
	id: number,
): Promise<T | ErrorState> {
	try {
		const response = await axios.get<T>(
			getBackendUrl(`${config.apiPath}/${id}`),
			{
				timeout: 10000,
				headers: NO_CACHE_HEADERS,
			},
		);
		return response.data;
	} catch (error) {
		return handleApiError(error, config.singularName);
	}
}

/**
 * Fetch latest content items
 */
export async function getLatestContent<T>(
	config: ContentConfig,
): Promise<T[] | null> {
	try {
		const response = await axios.get<T[]>(
			getBackendUrl(`${config.apiPath}/latest`),
			{
				timeout: 5000,
				headers: NO_CACHE_HEADERS,
			},
		);
		return response.data;
	} catch (error) {
		console.error(`Failed to fetch latest ${config.pluralName}:`, error);
		return null;
	}
}
