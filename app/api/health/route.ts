import { NextResponse } from "next/server";
import { getEnvConfig } from "@/lib/config/env";

export async function GET() {
  const envResult = getEnvConfig();

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "StreamBox Backend",
    version: "1.0.0",
    mode: envResult.config?.isMockMode ? "mock" : "google_drive",
    folderConfigured: Boolean(envResult.config?.folderId),
  });
}
