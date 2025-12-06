/**
 * Cache invalidation event system
 * Allows components to notify when data changes that should invalidate cache
 */

type CacheEventType = "like_changed" | "profile_updated" | "content_updated";

interface CacheEvent {
	type: CacheEventType;
	data?: any;
}

type CacheEventListener = (event: CacheEvent) => void;

class CacheEventEmitter {
	private listeners: Map<CacheEventType, Set<CacheEventListener>> = new Map();

	on(eventType: CacheEventType, listener: CacheEventListener) {
		if (!this.listeners.has(eventType)) {
			this.listeners.set(eventType, new Set());
		}
		this.listeners.get(eventType)!.add(listener);

		// Return cleanup function
		return () => {
			this.listeners.get(eventType)?.delete(listener);
		};
	}

	emit(eventType: CacheEventType, data?: any) {
		const event: CacheEvent = { type: eventType, data };
		const listeners = this.listeners.get(eventType);
		if (listeners) {
			listeners.forEach((listener) => {
				try {
					listener(event);
				} catch (error) {
					console.error("Error in cache event listener:", error);
				}
			});
		}
	}

	off(eventType: CacheEventType, listener: CacheEventListener) {
		this.listeners.get(eventType)?.delete(listener);
	}

	clear() {
		this.listeners.clear();
	}
}

// Global cache event emitter
export const cacheEvents = new CacheEventEmitter();

// Helper functions for common events
export const notifyLikeChanged = (
	contentType: "blog" | "review" | "project",
	contentId: string,
	isLiked: boolean,
) => {
	cacheEvents.emit("like_changed", { contentType, contentId, isLiked });
};

export const notifyProfileUpdated = (profileData?: any) => {
	cacheEvents.emit("profile_updated", profileData);
};

export const notifyContentUpdated = (contentType?: string) => {
	cacheEvents.emit("content_updated", { contentType });
};
