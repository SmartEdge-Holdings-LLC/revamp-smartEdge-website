"use client";

import { useSession } from "next-auth/react";
import { resolveMemberOnboarding } from "@/lib/onboarding";
import type { SessionMemberUser } from "@/types/member-session";
import { DashboardOnboardingDialog } from "@/components/dashboard/DashboardOnboardingDialog";
import { MemberSessionRefresh } from "@/components/dashboard/MemberSessionRefresh";

type DashboardShellProps = {
  children: React.ReactNode;
  user: SessionMemberUser;
};

export function DashboardShell({ children, user: initialUser }: DashboardShellProps) {
  const { data: session } = useSession();
  const user = session?.user ?? initialUser;
  const onboardingComplete = resolveMemberOnboarding(user);

  return (
    <>
      <MemberSessionRefresh />
      <DashboardOnboardingDialog open={!onboardingComplete} />
      {children}
    </>
  );
}
