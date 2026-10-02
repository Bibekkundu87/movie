/**
 * StreamBox Video Metadata Normalizer
 * Transforms Google Drive files into the unified frontend Video interface.
 */

import { Video } from "@/types/video";
import { DriveVideoFile } from "@/lib/drive/files";

const VIDEO_EXTENSIONS_REGEX = /\.(mp4|mkv|mov|webm|avi|flv|wmv|m4v|ts|3gp|ogv)$/i;

/**
 * Strips common video file extensions from file titles for a clean UI presentation.
 */
export function cleanVideoTitle(filename: string): string {
  if (!filename) return "Untitled Video";
  return filename.replace(VIDEO_EXTENSIONS_REGEX, "").trim() || filename;
}

/**
 * Normalizes a Google Drive file entity into the canonical Video schema.
 */
export function normalizeDriveVideo(file: DriveVideoFile): Video {
  const durationMillis = file.videoMediaMetadata?.durationMillis;
  const durationSeconds =
    durationMillis && !isNaN(Number(durationMillis))
      ? Math.round(Number(durationMillis) / 1000)
      : undefined;

  const sizeBytes = file.size && !isNaN(Number(file.size)) ? Number(file.size) : undefined;

  return {
    id: file.id,
    title: cleanVideoTitle(file.name),
    thumbnail: `/api/videos/${encodeURIComponent(file.id)}/thumbnail`,
    streamUrl: `/api/videos/${encodeURIComponent(file.id)}/stream`,
    duration: durationSeconds,
    size: sizeBytes,
    mimeType: file.mimeType || "video/mp4",
    createdAt: file.createdTime,
    updatedAt: file.modifiedTime,
  };
}
