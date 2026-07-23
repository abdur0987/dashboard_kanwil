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
      <div className="dashboard-content-after-redesign">
        <style>{`
          .dashboard-content-after-redesign > main > :nth-child(1),
          .dashboard-content-after-redesign > main > :nth-child(2),
          .dashboard-content-after-redesign > main > :nth-child(3) {
            display: none;
          }
        `}</style>
        <DashboardExperience data={publicData} />
      </div>
    </>
  );
}
