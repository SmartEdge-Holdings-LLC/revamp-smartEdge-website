import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardHome } from "@/components/dashboard/DashboardHome";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <DashboardHome user={session.user} />;
}
