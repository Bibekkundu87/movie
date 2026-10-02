import { NextRequest } from "next/server";
import { getThumbnailResponse } from "@/lib/drive/thumbnail";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return getThumbnailResponse(id, req.url);
}
