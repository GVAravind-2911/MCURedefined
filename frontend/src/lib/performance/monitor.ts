"use client";

/**
 * Performance monitoring utilities
 * Enabled only in development mode
 */

export interface PerformanceMetrics {
	name: string;
	startTime: number;
	endTime?: number;
	duration?: number;
	metadata?: Record<string, any>;
}

class PerformanceMonitor {
	private metrics: Map<string, PerformanceMetrics> = new Map();
	private enabled: boolean;

	constructor(enabled = process.env.NODE_ENV === "development") {
		this.enabled = enabled;
	}

	start(name: string, metadata?: Record<string, any>): void {
		if (!this.enabled) return;

		this.metrics.set(name, {
			name,
			startTime: performance.now(),
			metadata,
		});
	}

	end(name: string): number | null {
		if (!this.enabled) return null;

		const metric = this.metrics.get(name);
		if (!metric) {
			return null;
		}

		const endTime = performance.now();
		const duration = endTime - metric.startTime;

		metric.endTime = endTime;
		metric.duration = duration;

		return duration;
	}

	measure<T>(
		name: string,
		fn: () => T | Promise<T>,
		metadata?: Record<string, any>,
	): T | Promise<T> {
		if (!this.enabled) return fn();

		this.start(name, metadata);

		try {
			const result = fn();

			if (result instanceof Promise) {
				return result.finally(() => this.end(name)) as T;
			}

			this.end(name);
			return result;
		} catch (error) {
			this.end(name);
			throw error;
		}
	}

	getMetrics(): PerformanceMetrics[] {
		return Array.from(this.metrics.values()).filter(
			(m) => m.duration !== undefined,
		);
	}

	clear(): void {
		this.metrics.clear();
	}
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();
