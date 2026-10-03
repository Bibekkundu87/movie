/**
 * StreamBox Secure HTTP Range Video Streaming Engine
 * Streams video bytes incrementally from Google Drive without loading entire
 * files into server memory. Full support for RFC 7233 Range requests.
 */

import { Readable } from "node:stream";
import { getDriveClient } from "./client";
import { verifyVideoAccess } from "@/lib/security/access";
import { getEnvConfig } from "@/lib/config/env";
import { mockVideoStore } from "@/services/mockVideos";

export interface ParsedRange {
  start: number;
  end: number;
  total: number;
}

/**
 * Parses and validates an HTTP Range header string against the file size.
 * Format: "bytes=start-end" or "bytes=start-"
 */
export function parseRangeHeader(
  rangeHeader: string | null,
  fileSize: number
): { status: 200 } | { status: 206; range: ParsedRange } | { status: 416 } {
  if (!rangeHeader || !rangeHeader.startsWith("bytes=")) {
    return { status: 200 };
  }

  const parts = rangeHeader.replace(/bytes=/, "").trim().split("-");
  const rawStart = parts[0]?.trim();
  const rawEnd = parts[1]?.trim();

  const DEFAULT_CHUNK_BYTES = 2 * 1024 * 1024; // 2MB incremental chunking
  let start = parseInt(rawStart, 10);
  let end = rawEnd ? parseInt(rawEnd, 10) : Math.min(start + DEFAULT_CHUNK_BYTES - 1, fileSize - 1);

  // Suffix byte range: bytes=-500 (last 500 bytes)
  if (isNaN(start) && !isNaN(end)) {
    start = Math.max(0, fileSize - end);
    end = fileSize - 1;
  }

  // Validate range numbers
  if (isNaN(start) || isNaN(end) || start < 0 || start >= fileSize || start > end) {
    return { status: 416 };
  }

  // Clamp end to the file size boundary
  end = Math.min(end, fileSize - 1);

  return {
    status: 206,
    range: { start, end, total: fileSize },
  };
}

/**
 * Streams video content from Google Drive with incremental HTTP Range chunking.
 */
export async function handleVideoStreamRequest(
  fileId: string,
  rangeHeader: string | null,
  signal?: AbortSignal
): Promise<Response> {
  const envResult = getEnvConfig();

  // Mock Mode: redirect or proxy to sample video
  if (envResult.config?.isMockMode) {
    const mockVideo = mockVideoStore.getVideoById(fileId);
    if (!mockVideo || !mockVideo.streamUrl) {
      return new Response(JSON.stringify({ error: "Video stream not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // In mock mode, 307 temporary redirect enables the native HTML5 player to stream directly
    return new Response(null, {
      status: 307,
      headers: {
        Location: mockVideo.streamUrl,
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  // 1. Verify viewer authorization and folder membership
  const check = await verifyVideoAccess(fileId);
  if (!check.authorized || !check.file) {
    return new Response(
      JSON.stringify({ error: check.reason || "Video unavailable" }),
      {
        status: check.status || 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const file = check.file;
  const fileSize = file.size ? parseInt(file.size, 10) : 0;
  const mimeType = file.mimeType || "video/mp4";

  // 2. Process Range Header
  const rangeResult = fileSize > 0 ? parseRangeHeader(rangeHeader, fileSize) : { status: 200 as const };

  if (rangeResult.status === 416) {
    return new Response("Range Not Satisfiable", {
      status: 416,
      headers: {
        "Content-Range": `bytes */${fileSize}`,
        "Accept-Ranges": "bytes",
      },
    });
  }

  const drive = await getDriveClient();

  // 3. Prepare headers for upstream Google Drive API
  const requestHeaders: Record<string, string> = {};
  let expectedContentLength = fileSize;
  let status = 200;
  const responseHeaders: Record<string, string> = {
    "Content-Type": mimeType,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
  };

  if (rangeResult.status === 206) {
    status = 206;
    const { start, end, total } = rangeResult.range;
    requestHeaders["Range"] = `bytes=${start}-${end}`;
    expectedContentLength = end - start + 1;
    responseHeaders["Content-Range"] = `bytes ${start}-${end}/${total}`;
    responseHeaders["Content-Length"] = expectedContentLength.toString();
  } else if (fileSize > 0) {
    responseHeaders["Content-Length"] = fileSize.toString();
  }

  try {
    // 4. Request byte stream from Google Drive
    // responseType: "stream" prevents reading the entire video into Node.js buffer
    const upstream = await drive.files.get(
      {
        fileId,
        alt: "media",
        supportsAllDrives: true,
      },
      {
        responseType: "stream",
        headers: requestHeaders,
        signal,
      }
    );

    const nodeStream = upstream.data as Readable;

    // Attach client disconnect listener to cancel upstream Drive transfer
    if (signal) {
      signal.addEventListener("abort", () => {
        nodeStream.destroy();
      });
    }

    // Convert Node.js readable stream into standard Web ReadableStream
    const webStream = Readable.toWeb(nodeStream);

    return new Response(webStream as ReadableStream, {
      status,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    if (signal?.aborted || msg.includes("aborted") || msg.includes("ERR_STREAM_PREMATURE_CLOSE")) {
      return new Response(null, { status: 499 });
    }
    if (msg.includes("416")) {
      return new Response("Range Not Satisfiable", {
        status: 416,
        headers: {
          "Content-Range": `bytes */${fileSize}`,
          "Accept-Ranges": "bytes",
        },
      });
    }

    console.error(`Streaming error for video "${fileId}":`, msg);
    return new Response(
      JSON.stringify({ error: "Failed to stream video from Google Drive" }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
