'use client';

/**
 * Performance monitoring and optimization utilities
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

  constructor(enabled = process.env.NODE_ENV === 'development') {
    this.enabled = enabled;
  }

  start(name: string, metadata?: Record<string, any>): void {
    if (!this.enabled) return;

    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata
    });
  }

  end(name: string): number | null {
    if (!this.enabled) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" not found`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    // Log slow operations
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`, metric.metadata);
    }

    return duration;
  }

  measure<T>(name: string, fn: () => T | Promise<T>, metadata?: Record<string, any>): T | Promise<T> {
    if (!this.enabled) return fn();

    this.start(name, metadata);
    
    try {
      const result = fn();
      
      // Handle async functions
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
    return Array.from(this.metrics.values()).filter(m => m.duration !== undefined);
  }

  clear(): void {
    this.metrics.clear();
  }

  getStats() {
    const metrics = this.getMetrics();
    if (metrics.length === 0) return null;

    const durations = metrics.map(m => m.duration!);
    const total = durations.reduce((a, b) => a + b, 0);
    const average = total / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);

    return {
      count: metrics.length,
      total: total.toFixed(2),
      average: average.toFixed(2),
      min: min.toFixed(2),
      max: max.toFixed(2),
      slowest: metrics.sort((a, b) => (b.duration || 0) - (a.duration || 0)).slice(0, 5)
    };
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for measuring component render performance
import { useEffect, useRef } from 'react';

export function usePerformance(componentName: string, deps?: any[]) {
  const renderCount = useRef(0);
  const mounted = useRef(false);

  useEffect(() => {
    renderCount.current++;
    
    if (!mounted.current) {
      mounted.current = true;
      performanceMonitor.start(`${componentName}-mount`);
      
      return () => {
        performanceMonitor.end(`${componentName}-mount`);
      };
    }
  }, deps);

  useEffect(() => {
    if (renderCount.current > 1) {
      performanceMonitor.start(`${componentName}-render-${renderCount.current}`);
      
      return () => {
        performanceMonitor.end(`${componentName}-render-${renderCount.current}`);
      };
    }
  });

  return {
    renderCount: renderCount.current
  };
}

// Network performance utilities
export class NetworkOptimizer {
  private static pendingRequests = new Map<string, Promise<any>>();
  private static requestCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  // Deduplicate identical requests
  static async dedupeRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    const promise = requestFn();
    this.pendingRequests.set(key, promise);

    try {
      const result = await promise;
      return result;
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  // Batch multiple requests
  static async batchRequests<T>(
    requests: Array<{ key: string; fn: () => Promise<T> }>,
    batchSize = 3
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(req => this.dedupeRequest(req.key, req.fn))
      );
      
      results.push(...batchResults.map(result => 
        result.status === 'fulfilled' ? result.value : null
      ).filter(Boolean));
      
      // Small delay between batches to prevent overwhelming the server
      if (i + batchSize < requests.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }

  // Preload critical resources
  static preloadResources(urls: string[]) {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    });
  }
}

// Bundle size optimization utilities
export const lazyLoad = <T>(importFn: () => Promise<{ default: T }>) => {
  let component: T | null = null;
  let promise: Promise<T> | null = null;

  return (): Promise<T> => {
    if (component) {
      return Promise.resolve(component);
    }

    if (!promise) {
      promise = importFn().then(module => {
        component = module.default;
        return component;
      });
    }

    return promise;
  };
};

// Memory optimization
export class MemoryOptimizer {
  private static observers = new Set<IntersectionObserver>();
  private static timers = new Set<NodeJS.Timeout>();

  static createIntersectionObserver(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ): IntersectionObserver {
    const observer = new IntersectionObserver(callback, {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    });
    
    this.observers.add(observer);
    return observer;
  }

  static createTimer(callback: () => void, delay: number): NodeJS.Timeout {
    const timer = setTimeout(() => {
      callback();
      this.timers.delete(timer);
    }, delay);
    
    this.timers.add(timer);
    return timer;
  }

  static cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.timers.forEach(timer => clearTimeout(timer));
    this.observers.clear();
    this.timers.clear();
  }
}

// Image optimization
export const optimizeImageUrl = (url: string, width?: number, height?: number, quality = 80): string => {
  if (!url) return url;
  
  // Add query parameters for image optimization
  const separator = url.includes('?') ? '&' : '?';
  const params = new URLSearchParams();
  
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  params.set('q', quality.toString());
  params.set('f', 'webp');
  
  return `${url}${separator}${params.toString()}`;
};
