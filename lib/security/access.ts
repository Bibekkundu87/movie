/**
 * StreamBox Security & Access Control
 * Enforces folder membership, file ID validation, and download capability restrictions.
 */

import { DriveVideoFile, getDriveFile } from "@/lib/drive/files";
import { requireDriveConfig, getEnvConfig } from "@/lib/config/env";
import { mockVideoStore } from "@/services/mockVideos";
import { videoMetadataCache } from "@/lib/videos/cache";

// Valid Google Drive file ID format (alphanumeric, hyphens, underscores)
const GOOGLE_DRIVE_ID_REGEX = /^[a-zA-Z0-9_-]{10,128}$/;

/**
 * Validates that an incoming file ID adheres to the Google Drive ID format.
 */
export function isValidDriveId(fileId?: string | null): boolean {
  if (!fileId || typeof fileId !== "string") return false;
  return GOOGLE_DRIVE_ID_REGEX.test(fileId.trim());
}

export interface FileAccessCheck {
  authorized: boolean;
  status: number;
  reason?: string;
  file?: DriveVideoFile;
}

// In-memory cache for streaming access checks to eliminate 500-1500ms delay per range request
interface CachedAccess {
  check: FileAccessCheck;
  expiresAt: number;
}

const accessCache = new Map<string, CachedAccess>();
const ACCESS_CACHE_TTL_MS = 600_000; // 10 minutes cache to avoid mid-stream delay

export function invalidateAccessCache(fileId?: string): void {
  if (fileId) {
    accessCache.delete(fileId);
  } else {
    accessCache.clear();
  }
}

/**
 * Verifies that a requested file belongs directly to the configured Google Drive folder,
 * is an active video, is not trashed, and is allowed to be downloaded/streamed.
 */
export async function verifyVideoAccess(fileId: string): Promise<FileAccessCheck> {
  const envResult = getEnvConfig();

  // Validate ID format first to prevent path traversal or injection
  if (!isValidDriveId(fileId)) {
    return {
      authorized: false,
      status: 400,
      reason: "Invalid video identifier format.",
    };
  }

  // Check fast in-memory access cache to avoid redundant Google Drive metadata roundtrips
  const now = Date.now();
  const cached = accessCache.get(fileId);
  if (cached && cached.expiresAt > now) {
    return cached.check;
  }

  // If in mock mode, validate against the mock store
  if (envResult.config?.isMockMode) {
    const mockVideo = mockVideoStore.getVideoById(fileId);
    if (!mockVideo) {
      return {
        authorized: false,
        status: 404,
        reason: "Video not found in mock library.",
      };
    }
    const result: FileAccessCheck = {
      authorized: true,
      status: 200,
    };
    accessCache.set(fileId, { check: result, expiresAt: now + ACCESS_CACHE_TTL_MS });
    return result;
  }

  // Check if video is already present in the active videoMetadataCache
  const knownVideo =
    typeof videoMetadataCache?.getVideoById === "function"
      ? videoMetadataCache.getVideoById(fileId)
      : undefined;
  if (knownVideo) {
    const result: FileAccessCheck = {
      authorized: true,
      status: 200,
      file: {
        id: knownVideo.id,
        name: knownVideo.title,
        mimeType: knownVideo.mimeType || "video/mp4",
        size: knownVideo.size?.toString(),
        capabilities: { canDownload: true },
      },
    };
    accessCache.set(fileId, { check: result, expiresAt: now + ACCESS_CACHE_TTL_MS });
    return result;
  }

  const config = requireDriveConfig();

  // Retrieve fresh file metadata from Drive
  const file = await getDriveFile(fileId);

  if (!file) {
    return {
      authorized: false,
      status: 404,
      reason: "Video not found in Google Drive.",
    };
  }

  // 1. Verify not trashed
  if (file.trashed) {
    return {
      authorized: false,
      status: 404,
      reason: "Video has been moved to the trash in Google Drive.",
    };
  }

  // 2. Verify folder membership: file must have the configured folderId in its parents
  const isDirectChild = file.parents && file.parents.includes(config.folderId);
  if (!isDirectChild) {
    return {
      authorized: false,
      status: 403,
      reason: "Access denied: The requested file does not belong to the configured Google Drive folder.",
    };
  }

  // 3. Verify video MIME type
  if (!file.mimeType || !file.mimeType.startsWith("video/")) {
    return {
      authorized: false,
      status: 400,
      reason: "The requested file is not a supported video asset.",
    };
  }

  // 4. Verify downloading is permitted
  if (file.capabilities?.canDownload === false) {
    return {
      authorized: false,
      status: 403,
      reason: "Google Drive permissions restrict downloading or streaming for this video.",
    };
  }

  const result: FileAccessCheck = {
    authorized: true,
    status: 200,
    file,
  };

  accessCache.set(fileId, { check: result, expiresAt: now + ACCESS_CACHE_TTL_MS });
  return result;
}
