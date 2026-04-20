import { NextResponse } from "next/server";
import { getSetupStatus } from "@/lib/setup-status";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = await getSetupStatus();

  return NextResponse.json(status, {
    status: status.ok ? 200 : 503,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
