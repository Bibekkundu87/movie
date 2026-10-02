import { NextResponse } from "next/server";
import { runAllBackendTests } from "@/lib/testing/backend-tests";

export const dynamic = "force-dynamic";

export async function GET() {
  const testResults = await runAllBackendTests();
  return NextResponse.json(testResults);
}
