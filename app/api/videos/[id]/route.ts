import { NextRequest, NextResponse } from "next/server";
import { getVideoById } from "@/lib/videos/service";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing video ID parameter" }, { status: 400 });
  }

  try {
    const video = await getVideoById(id);

    if (!video) {
      return NextResponse.json(
        { error: `Video with ID "${id}" was not found or is unavailable.` },
        { status: 404 }
      );
    }

    return NextResponse.json(video);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error retrieving video details";
    console.error(`GET /api/videos/${id} error:`, message);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
