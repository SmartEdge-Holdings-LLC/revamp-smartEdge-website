import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSettingsProfileForm } from "@/components/dashboard/DashboardSettingsProfileForm";
import type { BackendMemberUser } from "@/types/member-session";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

async function getProfile(token: string): Promise<BackendMemberUser> {
  const response = await fetch(`${backendUrl}/api/user/profile`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data.user;
}

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.backendToken) redirect("/login");

  const user = await getProfile(session.user.backendToken);

  return (
    <>
      <DashboardHeader />
      <div className="min-w-0 flex-1 overflow-x-hidden px-4 py-8 md:px-8 lg:px-12">
        <DashboardSettingsProfileForm initialUser={user} />
      </div>
    </>
  );
}
