import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardTournaments } from "@/components/dashboard/DashboardTournaments";

export default async function TournamentsPage() {
  const session = await auth();
  if (!session?.user?.backendToken) redirect("/login");

  return (
    <>
      <DashboardHeader />
      <div className="min-w-0 flex-1 overflow-x-hidden px-4 py-8 md:px-8 lg:px-12">
        <DashboardTournaments user={session.user} />
      </div>
    </>
  );
}
