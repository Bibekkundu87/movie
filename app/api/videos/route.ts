import { NextResponse } from "next/server";
import { getAllVideos } from "@/lib/videos/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { videos, fromCache, folderId, isMock } = await getAllVideos();

    return NextResponse.json(
      {
        videos,
        total: videos.length,
        syncedAt: new Date().toISOString(),
        folderId,
        fromCache,
        isMock,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch video library";
    console.error("GET /api/videos error:", message);

    return NextResponse.json(
      {
        error: message,
        videos: [],
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  }
}
