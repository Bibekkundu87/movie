/**
 * StreamBox Lightweight Metadata Cache
 * Caches Drive video metadata in-memory with automatic TTL expiration,
 * in-flight request deduplication, and stale-on-error fallback resilience.
 */

import { Video } from "@/types/video";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class VideoMetadataCache {
  private cache: CacheEntry<Video[]> | null = null;
  private inFlightPromise: Promise<Video[]> | null = null;

  /**
   * Retrieves videos from cache if fresh, or executes the loader.
   * Concurrent requests while a load is in progress will wait for the same promise.
   */
  async getOrFetch(
    loader: () => Promise<Video[]>,
    ttlMs: number
  ): Promise<{ videos: Video[]; fromCache: boolean }> {
    const now = Date.now();

    // Cache hit
    if (this.cache && now - this.cache.timestamp < ttlMs) {
      return { videos: this.cache.data, fromCache: true };
    }

    // Deduplicate in-flight fetch across concurrent requests
    if (this.inFlightPromise) {
      const videos = await this.inFlightPromise;
      return { videos, fromCache: false };
    }

    this.inFlightPromise = (async () => {
      try {
        const freshVideos = await loader();
        this.cache = {
          data: freshVideos,
          timestamp: Date.now(),
        };
        return freshVideos;
      } catch (err) {
        // If an error occurs (e.g. transient 5xx or rate limit),
        // fallback to previously cached data if available rather than wiping the library.
        if (this.cache && this.cache.data.length > 0) {
          console.warn(
            "Drive API fetch failed, serving stale cached metadata:",
            err instanceof Error ? err.message : err
          );
          return this.cache.data;
        }
        throw err;
      } finally {
        this.inFlightPromise = null;
      }
    })();

    const videos = await this.inFlightPromise;
    return { videos, fromCache: false };
  }

  /**
   * Force invalidate the metadata cache.
   */
  invalidate(): void {
    this.cache = null;
    this.inFlightPromise = null;
  }

  /**
   * Check if cache has existing data
   */
  hasCachedData(): boolean {
    return this.cache !== null;
  }

  /**
   * Fast sync lookup for a video in metadata cache
   */
  getVideoById(id: string): Video | undefined {
    return this.cache?.data.find((v) => v.id === id);
  }
}

// Global singleton to persist across module re-evaluations
const globalForCache = globalThis as unknown as { __videoMetadataCache?: VideoMetadataCache };
export const videoMetadataCache =
  (globalForCache.__videoMetadataCache && typeof globalForCache.__videoMetadataCache.getVideoById === "function")
    ? globalForCache.__videoMetadataCache
    : new VideoMetadataCache();

if (process.env.NODE_ENV !== "production") {
  globalForCache.__videoMetadataCache = videoMetadataCache;
}
