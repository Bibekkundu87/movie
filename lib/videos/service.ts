/**
 * StreamBox Backend Video Service Layer
 * Coordinates Google Drive discovery, metadata caching, normalization,
 * and transient error resilience.
 */

import { Video } from "@/types/video";
import { getEnvConfig } from "@/lib/config/env";
import { listDriveVideos } from "@/lib/drive/files";
import { normalizeDriveVideo } from "./normalize";
import { videoMetadataCache } from "./cache";
import { verifyVideoAccess } from "@/lib/security/access";
import { mockVideoStore } from "@/services/mockVideos";

/**
 * Retries an asynchronous function using exponential backoff with jitter.
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  baseDelayMs = 500
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err: unknown) {
      attempt++;
      const isTransient =
        err instanceof Error &&
        (err.message.includes("429") ||
          err.message.includes("rateLimitExceeded") ||
          err.message.includes("userRateLimitExceeded") ||
          err.message.includes("500") ||
          err.message.includes("503") ||
          err.message.includes("backendError"));

      if (attempt > maxRetries || !isTransient) {
        throw err;
      }

      const jitter = Math.random() * 200;
      const delay = Math.pow(2, attempt) * baseDelayMs + jitter;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Retrieves all normalized videos from the Google Drive folder.
 * Uses cached metadata where fresh, or queries the Drive API.
 */
export async function getAllVideos(): Promise<{
  videos: Video[];
  fromCache: boolean;
  folderId?: string;
  isMock: boolean;
}> {
  const envResult = getEnvConfig();

  // Mock Mode Execution or fallback if Drive credentials not configured
  if (envResult.config?.isMockMode || !envResult.isConfigured || !envResult.config) {
    const mockVideos = mockVideoStore.getVideos();
    return {
      videos: mockVideos,
      fromCache: false,
      folderId: "mock-google-drive-folder",
      isMock: true,
    };
  }

  const { folderId, cacheTtlMs } = envResult.config;

  try {
    const { videos, fromCache } = await videoMetadataCache.getOrFetch(
      async () => {
        return withRetry(async () => {
          const rawFiles = await listDriveVideos(folderId);
          return rawFiles.map(normalizeDriveVideo);
        });
      },
      cacheTtlMs
    );

    return {
      videos,
      fromCache,
      folderId,
      isMock: false,
    };
  } catch (driveErr) {
    console.warn("Drive fetch failed, falling back to mock store:", driveErr);
    const mockVideos = mockVideoStore.getVideos();
    return {
      videos: mockVideos,
      fromCache: false,
      folderId: "mock-google-drive-folder",
      isMock: true,
    };
  }
}

/**
 * Retrieves a single video by ID after rigorous security and folder validation.
 */
export async function getVideoById(id: string): Promise<Video | null> {
  const envResult = getEnvConfig();

  // Mock Mode Execution or fallback
  if (envResult.config?.isMockMode || !envResult.isConfigured || !envResult.config) {
    const video = mockVideoStore.getVideoById(id);
    return video || null;
  }

  try {
    const check = await verifyVideoAccess(id);
    if (!check.authorized || !check.file) {
      return mockVideoStore.getVideoById(id) || null;
    }

    return normalizeDriveVideo(check.file);
  } catch (err) {
    console.warn("Drive video fetch failed, falling back to mock store:", err);
    return mockVideoStore.getVideoById(id) || null;
  }
}
