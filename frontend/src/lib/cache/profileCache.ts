// Simple cache utility for profile data
class ProfileCache {
    private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
    
    set(key: string, data: any, ttl = 30000) { // 30 seconds default TTL
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
    }
    
    get(key: string) {
        const entry = this.cache.get(key);
        if (!entry) return null;
        
        const now = Date.now();
        if (now - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }
        
        return entry.data;
    }
    
    clear() {
        this.cache.clear();
    }
    
    delete(key: string) {
        this.cache.delete(key);
    }
    
    // Get stale data while revalidating
    getStale(key: string) {
        const entry = this.cache.get(key);
        return entry?.data || null;
    }
    
    // Check if cache has fresh data
    isFresh(key: string) {
        const entry = this.cache.get(key);
        if (!entry) return false;
        
        const now = Date.now();
        return (now - entry.timestamp) <= entry.ttl;
    }
}

// Export singleton instance
export const profileCache = new ProfileCache();

// Helper function for cache keys
export const getCacheKey = (type: string, params?: Record<string, any>) => {
    const baseKey = `profile-${type}`;
    if (!params) return baseKey;
    
    const paramString = Object.entries(params)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join('&');
    
    return `${baseKey}-${paramString}`;
};

// Enhanced fetch with caching
export const cachedFetch = async (
    url: string, 
    options: RequestInit = {},
    cacheKey?: string,
    ttl = 30000
) => {
    const key = cacheKey || url;
    
    // Try to get fresh data from cache
    const cachedData = profileCache.get(key);
    if (cachedData) {
        return { data: cachedData, fromCache: true };
    }
    
    try {
        const response = await fetch(url, {
            ...options,
            // Add cache headers for browser caching
            headers: {
                ...options.headers,
                'Cache-Control': 'public, max-age=30, stale-while-revalidate=60'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Cache the successful response
        profileCache.set(key, data, ttl);
        
        return { data, fromCache: false };
    } catch (error) {
        // Try to return stale data if available
        const staleData = profileCache.getStale(key);
        if (staleData) {
            console.warn('Returning stale data due to fetch error:', error);
            return { data: staleData, fromCache: true, stale: true };
        }
        
        throw error;
    }
};
