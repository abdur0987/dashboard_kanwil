import { NextResponse } from "next/server";

import { clearDashboardDataCache, getDashboardData } from "@/lib/services/dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  clearDashboardDataCache();

  const data = await getDashboardData();

  return NextResponse.json(
    {
      ok: true,
      trainedAt: new Date().toISOString(),
      summary: {
        indicators: data.indicators.length,
        rows: data.rows.length,
        datasets: data.datasets.length,
        datasetDetails: data.datasetDetails.length,
        schedules: data.executiveSchedules.length,
        awards: data.awardCollections.reduce(
          (total, collection) => total + collection.items.length,
          0,
        ),
        releases: data.releaseSchedules.length,
        offices: data.officeLocations.length,
        news: data.latestNews.length,
        publications: data.publications.length,
        videos: data.videos.length,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    },
  );
}
