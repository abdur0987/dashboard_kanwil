import { DashboardExperience } from "@/components/dashboard/dashboard-experience";
import { getDashboardData } from "@/lib/services/dashboard";

export default async function Home() {
  const data = await getDashboardData();

  return <DashboardExperience data={data} />;
}
