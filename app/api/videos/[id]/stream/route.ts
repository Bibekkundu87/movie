import { NextRequest } from "next/server";
import { handleVideoStreamRequest } from "@/lib/drive/stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rangeHeader = req.headers.get("range");

  return handleVideoStreamRequest(id, rangeHeader, req.signal);
}
