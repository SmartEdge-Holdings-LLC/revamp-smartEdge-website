"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardPaidPicksFeed } from "@/components/dashboard/DashboardPaidPicksFeed";
import { DashboardSectionTabs } from "@/components/dashboard/DashboardSectionTabs";
import {
  hasJonahPaidAccess,
  hasSmartedgePaidAccess,
  type PaidPickFeed,
} from "@/lib/subscription-access";
import type { SessionMemberUser } from "@/types/member-session";

const viewPlansButtonClass =
  "inline-flex w-fit rounded-md bg-white px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50";

const PICK_TABS: { id: PaidPickFeed; label: string }[] = [
  { id: "admin", label: "Smartedge picks" },
  { id: "jonah", label: "Jonah's Picks" },
];

type DashboardHomeProps = {
  user: SessionMemberUser;
};

function FeedAccessGate({
  feed,
  hasAccess,
  children,
}: {
  feed: PaidPickFeed;
  hasAccess: boolean;
  children: ReactNode;
}) {
  if (hasAccess) return <>{children}</>;

  const brand = feed === "admin" ? "SmartEdge®" : "Jonah";
  return (
    <div className="rounded-xl border border-white/10 bg-[#0c0c0c] p-6 text-center">
      <h2 className="text-lg font-semibold text-white">{brand} VIP picks</h2>
      <p className="mt-2 text-sm text-subtle">
        Subscribe to {brand} to unlock this feed on your dashboard.
      </p>
      <Link href="/#pricing" className={`mt-4 ${viewPlansButtonClass}`}>
        View plans
      </Link>
    </div>
  );
}

export function DashboardHome({ user: initialUser }: DashboardHomeProps) {
  const { data: session } = useSession();
  const user = session?.user ?? initialUser;
  const token = user.backendToken;
  const [activeFeed, setActiveFeed] = useState<PaidPickFeed>("admin");

  const hasSmartedge = hasSmartedgePaidAccess(user);
  const hasJonah = hasJonahPaidAccess(user);
  const hasAccess = activeFeed === "admin" ? hasSmartedge : hasJonah;

  return (
    <>
      <DashboardHeader />

      <div className="min-w-0 flex-1 overflow-x-hidden px-4 py-8 md:px-8 lg:px-12">
        <div className="w-full">
          <div className="max-w-4xl text-left">
            <h1 className="text-3xl font-semibold tracking-tight text-white">Premium picks</h1>
            <DashboardSectionTabs
              tabs={PICK_TABS}
              active={activeFeed}
              onChange={setActiveFeed}
              ariaLabel="Premium pick feeds"
            />
          </div>

          <div className="mt-16 w-full">
            {!token ? (
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
                <p className="text-sm text-subtle">Sign in again to load picks.</p>
              </div>
            ) : (
              <FeedAccessGate feed={activeFeed} hasAccess={hasAccess}>
                <DashboardPaidPicksFeed feed={activeFeed} token={token} hideHeader />
              </FeedAccessGate>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
