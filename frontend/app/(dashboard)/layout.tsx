import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAuthTokenExpired, loginRedirectPath } from "@/lib/authSession";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata = {
  title: "SmartEdgePicks · Dashboard",
};

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const token = session?.user?.backendToken;
  if (!session?.user || !token || isAuthTokenExpired(token)) {
    redirect(loginRedirectPath("/dashboard"));
  }

  return (
    <div className="dark min-h-svh w-full bg-black text-slate-100">
      <DashboardShell user={session.user}>{children}</DashboardShell>
    </div>
  );
}
