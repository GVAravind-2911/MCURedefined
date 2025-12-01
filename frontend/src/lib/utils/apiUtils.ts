/**
 * API utilities for request management
 */

// Request cache for GET requests
const requestCache = new Map<string, { data: any; timestamp: number }>();

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
export function getCachedData<T>(cacheKey: string, ttl: number): T | null {
	if (isCacheValid(cacheKey, ttl)) {
		return requestCache.get(cacheKey)?.data as T;
	}
	return null;
}

/**
 * Set cache data
 */
export function setCacheData(cacheKey: string, data: any): void {
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

export { generateCacheKey };
