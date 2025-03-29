import { Email, FetchEmailsResult, FetchEmailsOptions } from './providers/EmailProvider';

/**
 * Key structure for caching email pages
 */
export interface EmailCacheKey {
  type: 'inbox' | 'sent' | 'trash' | 'spam' | 'draft' | 'search';
  pageToken?: string;
  query?: string; 
  labelIds?: string[];
  limit?: number;
}

/**
 * Cached email page with metadata
 */
interface CachedEmailPage {
  result: FetchEmailsResult;
  timestamp: number;
  cacheKey: string;
}

/**
 * Memory usage status
 */
export enum MemoryPressure {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

/**
 * Email cache service using LRU (Least Recently Used) approach
 * Provides caching and prefetching capabilities for email pages
 */
export class EmailCacheService {
  private cache: Map<string, CachedEmailPage>;
  private maxCacheSize: number;
  private cacheTTL: number;
  private tokenToKeyMap: Map<string, string>; // Maps pageTokens to their cache keys
  private keyMap: Map<string, EmailCacheKey>; // Stores the structured keys for each cache key string
  private prefetchQueue: Array<{key: EmailCacheKey, priority: number}>;
  private isPrefetching: boolean;
  private memoryCheckInterval: number | null = null;
  private lastMemoryStatus: MemoryPressure = MemoryPressure.Low;

  constructor(maxCacheSize = 10, cacheTTL = 5 * 60 * 1000) { // TTL = 5 minutes
    this.cache = new Map();
    this.maxCacheSize = maxCacheSize;
    this.cacheTTL = cacheTTL;
    this.tokenToKeyMap = new Map();
    this.keyMap = new Map();
    this.prefetchQueue = [];
    this.isPrefetching = false;
    
    // Start memory monitoring if performance.memory is available
    this.startMemoryMonitoring();
  }

  /**
   * Start monitoring memory usage
   */
  private startMemoryMonitoring() {
    // Only works in Chrome and some Chromium-based browsers
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
      this.memoryCheckInterval = window.setInterval(() => {
        this.checkMemoryPressure();
      }, 30000); // Check every 30 seconds
    }
  }

  /**
   * Stop memory monitoring
   */
  public stopMemoryMonitoring() {
    if (this.memoryCheckInterval !== null) {
      clearInterval(this.memoryCheckInterval);
      this.memoryCheckInterval = null;
    }
  }

  /**
   * Check current memory pressure and adjust cache size if needed
   */
  private checkMemoryPressure(): MemoryPressure {
    if (typeof window === 'undefined' || !('performance' in window) || !('memory' in performance)) {
      return MemoryPressure.Low;
    }
    
    // TypeScript doesn't know about memory API, so we need to use any
    const windowPerformance = window.performance as any;
    
    if (!windowPerformance.memory) {
      return MemoryPressure.Low;
    }
    
    const { usedJSHeapSize, jsHeapSizeLimit } = windowPerformance.memory;
    const usageRatio = usedJSHeapSize / jsHeapSizeLimit;
    
    let memoryStatus: MemoryPressure;
    
    if (usageRatio > 0.8) { // Over 80% memory usage
      memoryStatus = MemoryPressure.High;
    } else if (usageRatio > 0.5) { // Over 50% memory usage
      memoryStatus = MemoryPressure.Medium;
    } else {
      memoryStatus = MemoryPressure.Low;
    }
    
    // Only adjust if status has changed
    if (memoryStatus !== this.lastMemoryStatus) {
      this.adjustCacheSize(memoryStatus);
      this.lastMemoryStatus = memoryStatus;
    }
    
    return memoryStatus;
  }

  /**
   * Adjust cache size based on memory pressure
   */
  private adjustCacheSize(pressure: MemoryPressure) {
    switch (pressure) {
      case MemoryPressure.High:
        // Drastically reduce cache size under high pressure
        this.maxCacheSize = 2;
        this.trimCache();
        break;
      case MemoryPressure.Medium:
        // Moderately reduce cache size under medium pressure
        this.maxCacheSize = 5;
        this.trimCache();
        break;
      case MemoryPressure.Low:
        // Use normal cache size under low pressure
        this.maxCacheSize = 10;
        break;
    }
  }

  /**
   * Trim the cache to fit within the current max size
   */
  private trimCache() {
    if (this.cache.size <= this.maxCacheSize) {
      return;
    }
    
    // Remove oldest entries until we're at the max size
    const entriesToRemove = this.cache.size - this.maxCacheSize;
    let removed = 0;
    
    for (const key of this.cache.keys()) {
      if (removed >= entriesToRemove) {
        break;
      }
      
      const cached = this.cache.get(key);
      if (cached && cached.result.nextPageToken) {
        this.tokenToKeyMap.delete(cached.result.nextPageToken);
      }
      
      this.cache.delete(key);
      this.keyMap.delete(key);
      removed++;
    }
  }

  /**
   * Generates a string key from structured cache key
   */
  private generateCacheKey(key: EmailCacheKey): string {
    const { type, pageToken, query, labelIds, limit } = key;
    const labelIdsStr = labelIds ? labelIds.sort().join(',') : '';
    return `${type}:${pageToken || ''}:${query || ''}:${labelIdsStr}:${limit || 0}`;
  }

  /**
   * Get cached email page if it exists and is valid
   */
  get(key: EmailCacheKey): FetchEmailsResult | null {
    const cacheKey = this.generateCacheKey(key);
    const cached = this.cache.get(cacheKey);
    
    // Check if we have a cache hit and it's still valid
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      // Move this key to the end of the map to mark as most recently used
      this.cache.delete(cacheKey);
      this.cache.set(cacheKey, cached);
      return cached.result;
    }
    
    // Cache miss or expired cache
    if (cached) {
      this.cache.delete(cacheKey);
      // Only delete from tokenToKeyMap if nextPageToken exists
      if (cached.result.nextPageToken) {
        this.tokenToKeyMap.delete(cached.result.nextPageToken);
      }
    }
    
    return null;
  }

  /**
   * Store email page in cache
   */
  set(key: EmailCacheKey, result: FetchEmailsResult): void {
    const cacheKey = this.generateCacheKey(key);
    
    // Store the relation between this key's structure and string version
    this.keyMap.set(cacheKey, key);
    
    // Add the new page to cache
    this.cache.set(cacheKey, {
      result,
      timestamp: Date.now(),
      cacheKey
    });
    
    // If this result has a next page token, map it to this cache key
    if (result.nextPageToken) {
      this.tokenToKeyMap.set(result.nextPageToken, cacheKey);
    }
    
    // Enforce max cache size (LRU policy)
    if (this.cache.size > this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      const oldestEntry = this.cache.get(oldestKey);
      if (oldestEntry && oldestEntry.result.nextPageToken) {
        this.tokenToKeyMap.delete(oldestEntry.result.nextPageToken);
      }
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Queue email page for prefetching based on priority
   * Higher priority = fetched sooner
   */
  queueForPrefetch(key: EmailCacheKey, priority: number): void {
    // Don't queue if already in cache
    if (this.get(key)) {
      return;
    }
    
    // Add to queue with priority
    this.prefetchQueue.push({ key, priority });
    
    // Sort queue by priority (descending)
    this.prefetchQueue.sort((a, b) => b.priority - a.priority);
    
    // Start prefetching if not already in progress
    this.processPrefetchQueue();
  }

  /**
   * Process the prefetch queue
   */
  private async processPrefetchQueue(): Promise<void> {
    if (this.isPrefetching || this.prefetchQueue.length === 0) {
      return;
    }

    this.isPrefetching = true;
    
    try {
      // Take the highest priority item
      const item = this.prefetchQueue.shift();
      if (!item) {
        this.isPrefetching = false;
        return;
      }
      
      // Call the prefetch callback if available
      if (this.prefetchCallback) {
        const result = await this.prefetchCallback(item.key);
        if (result) {
          this.set(item.key, result);
        }
      }
    } catch (error) {
      console.error('Error during prefetch:', error);
    } finally {
      this.isPrefetching = false;
      
      // Continue processing the queue if more items exist
      if (this.prefetchQueue.length > 0) {
        // Add small delay to prevent too many requests at once
        setTimeout(() => this.processPrefetchQueue(), 500);
      }
    }
  }

  /**
   * Callback to use for prefetching emails
   */
  private prefetchCallback: ((key: EmailCacheKey) => Promise<FetchEmailsResult | null>) | null = null;

  /**
   * Set the function to call when prefetching emails
   */
  setPrefetchCallback(callback: (key: EmailCacheKey) => Promise<FetchEmailsResult | null>): void {
    this.prefetchCallback = callback;
  }

  /**
   * Find cache key for a given page token
   */
  getCacheKeyForToken(pageToken: string): EmailCacheKey | null {
    const cacheKey = this.tokenToKeyMap.get(pageToken);
    if (cacheKey) {
      return this.keyMap.get(cacheKey) || null;
    }
    return null;
  }

  /**
   * Get cache key for next page of a cached page
   */
  getNextPageKey(currentKey: EmailCacheKey): EmailCacheKey | null {
    const cacheKey = this.generateCacheKey(currentKey);
    const cached = this.cache.get(cacheKey);
    
    if (cached && cached.result.nextPageToken) {
      // Create a key for the next page
      return {
        ...currentKey,
        pageToken: cached.result.nextPageToken
      };
    }
    
    return null;
  }

  /**
   * Clear the entire cache or specific entries
   */
  clear(key?: EmailCacheKey): void {
    if (key) {
      const cacheKey = this.generateCacheKey(key);
      const cached = this.cache.get(cacheKey);
      if (cached && cached.result.nextPageToken) {
        this.tokenToKeyMap.delete(cached.result.nextPageToken);
      }
      this.cache.delete(cacheKey);
      this.keyMap.delete(cacheKey);
    } else {
      this.cache.clear();
      this.tokenToKeyMap.clear();
      this.keyMap.clear();
    }
  }

  /**
   * Invalidate all cached data older than a specific timestamp
   */
  invalidateOlderThan(timestamp: number): void {
    for (const [key, cached] of this.cache.entries()) {
      if (cached.timestamp < timestamp) {
        if (cached.result.nextPageToken) {
          this.tokenToKeyMap.delete(cached.result.nextPageToken);
        }
        this.cache.delete(key);
        this.keyMap.delete(key);
      }
    }
  }

  /**
   * Get total number of items in cache
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Get memory pressure status
   */
  getMemoryStatus(): MemoryPressure {
    return this.lastMemoryStatus;
  }

  /**
   * Get current max cache size
   */
  getMaxCacheSize(): number {
    return this.maxCacheSize;
  }
}

// Create a singleton instance for global use
export const emailCacheService = new EmailCacheService(); 