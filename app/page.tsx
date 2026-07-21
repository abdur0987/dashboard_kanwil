import { DashboardExperience } from "@/components/dashboard/dashboard-experience";
import { PublicDataGovernanceBanner } from "@/components/dashboard/public-data-governance-banner";
import { getDashboardData } from "@/lib/services/dashboard";
import { preparePublicDashboardData } from "@/lib/services/public-dashboard-governance";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function Home() {
  const rawData = await getDashboardData();
  const publicData = preparePublicDashboardData(rawData);

  return (
    <>
      <PublicDataGovernanceBanner rawData={rawData} />
      <DashboardExperience data={publicData} />
    </>
  );
}
