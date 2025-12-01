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
