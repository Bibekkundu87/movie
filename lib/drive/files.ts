/**
 * StreamBox Google Drive Video Files Discovery
 * Scans the configured folder using pagination to discover video assets.
 */

import { drive_v3 } from "googleapis";
import { getDriveClient } from "./client";

export interface DriveVideoFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  thumbnailLink?: string;
  videoMediaMetadata?: {
    width?: number;
    height?: number;
    durationMillis?: string;
  };
  parents?: string[];
  capabilities?: {
    canDownload?: boolean;
  };
}

const FIELDS_LIST =
  "nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, thumbnailLink, videoMediaMetadata, parents, capabilities(canDownload))";

const FIELDS_SINGLE =
  "id, name, mimeType, size, createdTime, modifiedTime, thumbnailLink, videoMediaMetadata, parents, capabilities(canDownload), trashed";

/**
 * Retrieves all video files directly inside the specified folder.
 * Uses pagination to ensure no files are truncated.
 */
export async function listDriveVideos(
  folderId: string,
  pageSize = 100
): Promise<DriveVideoFile[]> {
  const drive = await getDriveClient();
  const allFiles: DriveVideoFile[] = [];
  let pageToken: string | undefined | null = undefined;

  // Single source of truth query:
  // Must be in parents, must be a video MIME type, must not be trashed.
  const query = `'${folderId}' in parents and mimeType contains 'video/' and trashed = false`;

  do {
    const res = await (drive.files.list as Function)({
      q: query,
      fields: FIELDS_LIST,
      pageSize,
      pageToken: pageToken ?? undefined,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      orderBy: "createdTime desc",
    }) as { data: drive_v3.Schema$FileList };

    const files = (res.data.files as DriveVideoFile[]) || [];
    allFiles.push(...files);

    pageToken = res.data.nextPageToken || undefined;
  } while (pageToken);

  // Deterministic secondary sort: createdTime descending, then ID ascending
  allFiles.sort((a, b) => {
    const timeA = a.createdTime ? new Date(a.createdTime).getTime() : 0;
    const timeB = b.createdTime ? new Date(b.createdTime).getTime() : 0;
    if (timeB !== timeA) return timeB - timeA;
    return (a.id || "").localeCompare(b.id || "");
  });

  return allFiles;
}

/**
 * Retrieves the raw metadata for a single Google Drive file.
 */
export async function getDriveFile(fileId: string): Promise<DriveVideoFile & { trashed?: boolean } | null> {
  try {
    const drive = await getDriveClient();
    const res = await drive.files.get({
      fileId,
      fields: FIELDS_SINGLE,
      supportsAllDrives: true,
    });
    return (res.data as DriveVideoFile & { trashed?: boolean }) || null;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("404") || msg.includes("File not found")) {
      return null;
    }
    throw error;
  }
}
