/**
 * Shared utilities for content management
 */

import type { ContentBlock, ContentConfig, ErrorState } from "@/types/ContentTypes";
import type { AxiosError } from "axios";
import { getProxyUrl as getApiProxyUrl, API_PROXY_URL } from "@/lib/config/backend";

// Re-export for backward compatibility
export { API_PROXY_URL };

/**
 * Get the full API URL for a given path (client-side proxy)
 * @deprecated Use getProxyUrl from @/lib/config/backend instead
 */
export function getApiUrl(path: string): string {
	return getApiProxyUrl(path);
}

/**
 * Generate a unique block ID
 */
export function generateBlockId(): string {
	return `block_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Read a file as DataURL
 */
export function readFileAsDataURL(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (e) => resolve(e.target?.result as string);
		reader.onerror = (e) => reject(e);
		reader.readAsDataURL(file);
	});
}

/**
 * Get the localStorage key for a draft
 */
export function getDraftStorageKey(config: ContentConfig, id?: string): string {
	if (id) {
		return `${config.storageKeyPrefix}-${id}`;
	}
	return `create-${config.storageKeyPrefix}-draft`;
}

/**
 * Create a new content block of the specified type
 */
export function createContentBlock(type: ContentBlock["type"]): ContentBlock {
	switch (type) {
		case "text":
			return { id: generateBlockId(), type, content: "" };
		case "image":
			return { id: generateBlockId(), type, content: { link: "" } };
		case "embed":
			return { id: generateBlockId(), type, content: "" };
	}
}

/**
 * Handle API errors and return appropriate error state
 */
export function handleApiError(
	error: unknown,
	contentType: string,
): ErrorState {
	const axiosError = error as AxiosError;

	if (axiosError.code === "ECONNREFUSED") {
		return {
			hasError: true,
			title: "Connection Failed",
			reasons: [
				`The ${contentType} server appears to be offline`,
				"Unable to establish connection to the API",
				"Please try again later",
			],
		};
	}
	
	if (
		axiosError.code === "ETIMEDOUT" ||
		axiosError.message?.includes("timeout")
	) {
		return {
			hasError: true,
			title: "Connection Timeout",
			reasons: [
				"The server took too long to respond",
				"This may be due to high traffic or server load",
				"Please try refreshing the page",
			],
		};
	}

	if (axiosError.response?.status === 404) {
		return {
			hasError: true,
			title: `${contentType} Not Found`,
			reasons: [
				`The requested ${contentType.toLowerCase()} could not be found`,
				"It may have been deleted or moved",
				`Please check the ${contentType.toLowerCase()} ID and try again`,
			],
		};
	}

	return {
		hasError: true,
		title: `Unable to Load ${contentType}`,
		reasons: [
			`The ${contentType.toLowerCase()} service may be temporarily unavailable`,
			"Server may be undergoing maintenance",
			"Please try again later",
		],
	};
}

/**
 * Normalize content blocks to ensure proper structure
 */
export function normalizeContentBlocks(blocks: ContentBlock[]): ContentBlock[] {
	return blocks.map((block) => {
		const id = block.id || generateBlockId();
		if (block.type === "image") {
			return {
				id,
				type: "image" as const,
				content: {
					link:
						typeof block.content === "string"
							? block.content
							: (block.content as { link: string }).link,
				},
			};
		}
		return { ...block, id } as ContentBlock;
	});
}

/**
 * Process content blocks for submission
 */
export function processContentBlocksForSubmission(
	blocks: ContentBlock[],
): ContentBlock[] {
	return blocks.map((block) => {
		if (block.type === "image") {
			return {
				...block,
				content: { link: block.content.link },
			};
		}
		return block;
	});
}

/**
 * Default cache headers for API requests
 */
export const DEFAULT_CACHE_HEADERS = {
	"Cache-Control": "no-cache",
	Pragma: "no-cache",
	Expires: "0",
};
