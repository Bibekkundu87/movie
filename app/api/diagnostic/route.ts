import { NextResponse } from "next/server";
import { verifyDriveAccess } from "@/lib/drive/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await verifyDriveAccess();
  return NextResponse.json(result, {
    status: result.ok ? 200 : 500,
  });
}
