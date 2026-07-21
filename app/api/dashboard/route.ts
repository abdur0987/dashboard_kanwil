import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { ensureDatabaseReady } from "@/lib/db/migrate";
import { getDashboardData, replaceDashboardData } from "@/lib/services/dashboard";
import { preparePublicDashboardData } from "@/lib/services/public-dashboard-governance";
import type { DashboardData } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const data = preparePublicDashboardData(await getDashboardData());

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

export async function PUT(request: Request) {
  await ensureDatabaseReady();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as DashboardData;
  await replaceDashboardData(payload);

  // Admin tetap menerima data mentah agar nilai internal dan data yang masih
  // perlu validasi tidak hilang setelah penyimpanan.
  return NextResponse.json(await getDashboardData());
}
