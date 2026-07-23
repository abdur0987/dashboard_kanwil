import { DashboardExperience } from "@/components/dashboard/dashboard-experience";
import { DashboardTopShell } from "@/components/dashboard/dashboard-top-shell";
import { PublicDataGovernanceBanner } from "@/components/dashboard/public-data-governance-banner";
import { ServiceAchievementShowcase } from "@/components/dashboard/service-achievement-showcase";
import { getDashboardData } from "@/lib/services/dashboard";
import { preparePublicDashboardData } from "@/lib/services/public-dashboard-governance";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function Home() {
  const rawData = await getDashboardData();
  const publicData = preparePublicDashboardData(rawData);

  return (
    <>
      <DashboardTopShell contact={publicData.contact} />
      <PublicDataGovernanceBanner rawData={rawData} />
      <ServiceAchievementShowcase />
      <div className="[&>main>:nth-child(1)]:hidden [&>main>:nth-child(2)]:hidden [&>main>:nth-child(3)]:hidden">
        <DashboardExperience data={publicData} />
      </div>
    </>
  );
}
