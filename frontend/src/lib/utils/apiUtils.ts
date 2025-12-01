/**
 * API utilities for request management and optimization
 */

import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";

// Request cache for GET requests
const requestCache = new Map<string, { data: any; timestamp: number }>();

// In-flight requests map to prevent duplicate concurrent requests
const inFlightRequests = new Map<string, Promise<any>>();

interface CacheOptions {
	/** Cache TTL in milliseconds (default: 30000 = 30 seconds) */
	ttl?: number;
	/** Whether to use cache (default: true for GET requests) */
	useCache?: boolean;
	/** Custom cache key (default: url + params) */
	cacheKey?: string;
}

interface ThrottleOptions {
	/** Minimum delay between same requests in ms (default: 300) */
	minDelay?: number;
	/** Whether to dedupe in-flight requests (default: true) */
	dedupeInFlight?: boolean;
}

const lastRequestTimes = new Map<string, number>();

/**
 * Generate a cache key from URL and params
 */
function generateCacheKey(url: string, params?: Record<string, any>): string {
	const paramString = params ? JSON.stringify(params) : "";
	return `${url}::${paramString}`;
}

/**
 * Check if cached data is still valid
 */
function isCacheValid(cacheKey: string, ttl: number): boolean {
	const cached = requestCache.get(cacheKey);
	if (!cached) return false;
	return Date.now() - cached.timestamp < ttl;
}

/**
 * Get cached data if valid
 */
function getCachedData<T>(cacheKey: string, ttl: number): T | null {
	if (isCacheValid(cacheKey, ttl)) {
		return requestCache.get(cacheKey)?.data as T;
	}
	return null;
}

/**
 * Set cache data
 */
function setCacheData(cacheKey: string, data: any): void {
	requestCache.set(cacheKey, { data, timestamp: Date.now() });
}

/**
 * Clear specific cache entry or all cache
 */
export function clearCache(cacheKey?: string): void {
	if (cacheKey) {
		requestCache.delete(cacheKey);
	} else {
		requestCache.clear();
	}
}

/**
 * Clear cache entries matching a pattern
 */
export function clearCachePattern(pattern: string | RegExp): void {
	const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern;
	for (const key of requestCache.keys()) {
		if (regex.test(key)) {
			requestCache.delete(key);
		}
	}
}

/**
 * Throttled and cached API GET request
 */
export async function cachedGet<T = any>(
	url: string,
	config?: AxiosRequestConfig & CacheOptions & ThrottleOptions
): Promise<T> {
	const {
		ttl = 30000,
		useCache = true,
		cacheKey: customCacheKey,
		minDelay = 300,
		dedupeInFlight = true,
		...axiosConfig
	} = config || {};

	const cacheKey = customCacheKey || generateCacheKey(url, axiosConfig.params);

	// Check cache first
	if (useCache) {
		const cached = getCachedData<T>(cacheKey, ttl);
		if (cached !== null) {
			return cached;
		}
	}

	// Dedupe in-flight requests
	if (dedupeInFlight && inFlightRequests.has(cacheKey)) {
		return inFlightRequests.get(cacheKey) as Promise<T>;
	}

	// Throttle requests
	const lastRequestTime = lastRequestTimes.get(cacheKey) || 0;
	const timeSinceLastRequest = Date.now() - lastRequestTime;
	if (timeSinceLastRequest < minDelay) {
		await new Promise((resolve) =>
			setTimeout(resolve, minDelay - timeSinceLastRequest)
		);
	}

	// Make the request
	const requestPromise = (async () => {
		try {
			lastRequestTimes.set(cacheKey, Date.now());
			const response: AxiosResponse<T> = await axios.get(url, axiosConfig);
			
			if (useCache) {
				setCacheData(cacheKey, response.data);
			}
			
			return response.data;
		} finally {
			inFlightRequests.delete(cacheKey);
		}
	})();

	if (dedupeInFlight) {
		inFlightRequests.set(cacheKey, requestPromise);
	}

	return requestPromise;
}

/**
 * Batched API requests - combine multiple requests into one
 */
export class RequestBatcher<T = any> {
	private queue: Map<string, { resolve: (data: T) => void; reject: (error: any) => void }[]> = new Map();
	private timeout: NodeJS.Timeout | null = null;
	private batchDelay: number;
	private batchFn: (ids: string[]) => Promise<Record<string, T>>;

	constructor(
		batchFn: (ids: string[]) => Promise<Record<string, T>>,
		batchDelay: number = 50
	) {
		this.batchFn = batchFn;
		this.batchDelay = batchDelay;
	}

	async request(id: string): Promise<T> {
		return new Promise((resolve, reject) => {
			if (!this.queue.has(id)) {
				this.queue.set(id, []);
			}
			this.queue.get(id)!.push({ resolve, reject });

			// Schedule batch execution
			if (this.timeout === null) {
				this.timeout = setTimeout(() => this.executeBatch(), this.batchDelay);
			}
		});
	}

	private async executeBatch(): Promise<void> {
		this.timeout = null;
		const currentQueue = new Map(this.queue);
		this.queue.clear();

		const ids = Array.from(currentQueue.keys());
		if (ids.length === 0) return;

		try {
			const results = await this.batchFn(ids);
			
			for (const [id, callbacks] of currentQueue) {
				const data = results[id];
				for (const { resolve, reject } of callbacks) {
					if (data !== undefined) {
						resolve(data);
					} else {
						reject(new Error(`No data returned for id: ${id}`));
					}
				}
			}
		} catch (error) {
			for (const [, callbacks] of currentQueue) {
				for (const { reject } of callbacks) {
					reject(error);
				}
			}
		}
	}
}

/**
 * Create a request queue for sequential API calls
 */
export function createRequestQueue(concurrency: number = 1) {
	const queue: (() => Promise<any>)[] = [];
	let running = 0;

	const processQueue = async () => {
		while (queue.length > 0 && running < concurrency) {
			running++;
			const request = queue.shift()!;
			try {
				await request();
			} finally {
				running--;
				processQueue();
			}
		}
	};

	return {
		add: <T>(request: () => Promise<T>): Promise<T> => {
			return new Promise((resolve, reject) => {
				queue.push(async () => {
					try {
						const result = await request();
						resolve(result);
					} catch (error) {
						reject(error);
					}
				});
				processQueue();
			});
		},
		clear: () => {
			queue.length = 0;
		},
		size: () => queue.length,
	};
}

export default {
	cachedGet,
	clearCache,
	clearCachePattern,
	RequestBatcher,
	createRequestQueue,
};
