/**
 * StreamBox Thumbnail Proxy Layer
 * Secures thumbnail retrieval from Google Drive with local SVG placeholder fallback.
 */

import { NextResponse } from "next/server";
import { verifyVideoAccess } from "@/lib/security/access";
import { getEnvConfig } from "@/lib/config/env";
import { mockVideoStore } from "@/services/mockVideos";

/**
 * Handles GET /api/videos/:id/thumbnail requests.
 */
export async function getThumbnailResponse(
  fileId: string,
  requestUrl: string
): Promise<NextResponse> {
  const envResult = getEnvConfig();

  // Handle Mock Mode
  if (envResult.config?.isMockMode) {
    const video = mockVideoStore.getVideoById(fileId);
    if (video && video.thumbnail) {
      if (video.thumbnail.startsWith("http://") || video.thumbnail.startsWith("https://")) {
        return NextResponse.redirect(video.thumbnail);
      }
    }
    const placeholder = new URL("/images/placeholder-poster.svg", requestUrl);
    return NextResponse.redirect(placeholder);
  }

  // Real Google Drive Mode Security Verification
  const check = await verifyVideoAccess(fileId);
  if (!check.authorized || !check.file) {
    const placeholder = new URL("/images/placeholder-poster.svg", requestUrl);
    return NextResponse.redirect(placeholder);
  }

  const thumbnailLink = check.file.thumbnailLink;
  if (!thumbnailLink) {
    // If Drive hasn't generated the thumbnail yet for a recent upload,
    // fallback gracefully to local placeholder without failing the video listing.
    const placeholder = new URL("/images/placeholder-poster.svg", requestUrl);
    return NextResponse.redirect(placeholder);
  }

  try {
    // Fetch high-res thumbnail by requesting s1280 size variant if available
    const highResUrl = thumbnailLink.includes("=")
      ? thumbnailLink.replace(/=s\d+/, "=s1280")
      : thumbnailLink;

    const upstreamRes = await fetch(highResUrl, {
      headers: {
        Accept: "image/*",
      },
    });

    if (!upstreamRes.ok || !upstreamRes.body) {
      const placeholder = new URL("/images/placeholder-poster.svg", requestUrl);
      return NextResponse.redirect(placeholder);
    }

    const contentType = upstreamRes.headers.get("content-type") || "image/jpeg";

    return new NextResponse(upstreamRes.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
      },
    });
  } catch {
    const placeholder = new URL("/images/placeholder-poster.svg", requestUrl);
    return NextResponse.redirect(placeholder);
  }
}
