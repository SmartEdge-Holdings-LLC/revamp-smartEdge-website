import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { VIPPicksHome } from "@/components/dashboard/VIPPicksHome";

export const metadata = {
  title: "VIP Picks | SmartEdgePicks",
  description: "Premium VIP picks with detailed analysis and odds",
};

export default async function VIPPicksPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <DashboardShell user={session.user}>
      <VIPPicksHome user={session.user} />
    </DashboardShell>
  );
}
