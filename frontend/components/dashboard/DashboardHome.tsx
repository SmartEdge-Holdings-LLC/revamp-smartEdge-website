"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardPaidPicksFeed } from "@/components/dashboard/DashboardPaidPicksFeed";
import { DashboardSectionTabs } from "@/components/dashboard/DashboardSectionTabs";
import {
  hasJonahPaidAccess,
  hasSmartedgePaidAccess,
  type PaidPickFeed,
} from "@/lib/subscription-access";
import { PICK_LEAGUES, getSportsLeagueLogo } from "@/lib/sports-leagues";
import { cn } from "@/lib/utils";
import type { SessionMemberUser } from "@/types/member-session";
import type { League } from "@/types/picks";

type DashboardFeedType = PaidPickFeed | "jonah-vip" | "jonah-vip-premium";

const PICK_TABS: { id: DashboardFeedType; label: string; access?: string }[] = [
  { id: "admin", label: "Smartedge Premium VIP Picks" },
  { id: "jonah-vip-premium", label: "Jonah Premium VIP Picks", access: "jonah-vip-premium" },
];

type DashboardHomeProps = {
  user: SessionMemberUser;
};

function FeedAccessGate({
  children,
}: {
  children: ReactNode;
}) {
  // Always show picks - blurring is handled by DashboardPickDetailCard based on hasAccess
  return <>{children}</>;
}

export function DashboardHome({ user: initialUser }: DashboardHomeProps) {
  const { data: session } = useSession();
  const user = session?.user ?? initialUser;
  const token = user.backendToken;
  const [activeFeed, setActiveFeed] = useState<DashboardFeedType>("admin");
  const [selectedLeagues, setSelectedLeagues] = useState<League[]>([]);

  const hasSmartedge = hasSmartedgePaidAccess(user);
  const hasJonah = hasJonahPaidAccess(user);
  const hasAccess = activeFeed === "admin" ? hasSmartedge : hasJonah;

  // Map dashboard feed type to API feed and access filter
  let actualFeed: PaidPickFeed;
  let accessFilter: string[] | undefined;

  switch (activeFeed) {
    case "jonah-vip":
      actualFeed = "jonah";
      accessFilter = ["jonahvip"];
      break;
    case "jonah-vip-premium":
      actualFeed = "jonah";
      accessFilter = ["jonah-vip-premium"];
      break;
    case "admin":
    default:
      actualFeed = "admin";
      accessFilter = undefined;
      break;
  }

  const toggleLeague = (league: League) => {
    setSelectedLeagues((prev) =>
      prev.includes(league)
        ? prev.filter((l) => l !== league)
        : [...prev, league]
    );
  };

  return (
    <>
      <DashboardHeader />
      <div className="min-h-screen w-full overflow-x-hidden px-4 py-8 md:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-7xl">
          <div className="text-left">
            <h1 className="text-3xl font-semibold tracking-tight text-white">Premium Picks</h1>
            <DashboardSectionTabs
              tabs={PICK_TABS}
              active={activeFeed}
              onChange={setActiveFeed}
              ariaLabel="Premium pick feeds"
            />

            {/* League Filter */}
            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-white mb-2">
                Filter by League
              </p>
              <p className="text-sm text-subtle mb-4">
                We're offering expert picks across {PICK_LEAGUES.length} leagues including NBA, NFL, MLB, NHL, and more.
              </p>
              <div className="flex flex-wrap gap-3">
                {PICK_LEAGUES.map((league) => {
                  const isSelected = selectedLeagues.includes(league as League);
                  const logoSrc = getSportsLeagueLogo(league as League);

                  return (
                    <button
                      key={league}
                      onClick={() => toggleLeague(league as League)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-4 py-2.5 transition-all",
                        "border text-sm font-medium",
                        isSelected
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-white/10 bg-white/5 text-subtle hover:border-white/20 hover:text-white"
                      )}
                    >
                      {logoSrc && (
                        <Image
                          src={logoSrc}
                          alt={league}
                          width={16}
                          height={16}
                          className="object-contain"
                        />
                      )}
                      <span>{league}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-16 w-full">
            {!token ? (
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
                <p className="text-sm text-subtle">Sign in again to load picks.</p>
              </div>
            ) : (
              <FeedAccessGate>
                <DashboardPaidPicksFeed
                  feed={actualFeed}
                  token={token}
                  hideHeader
                  showFullAnalysis={hasAccess}
                  leagues={selectedLeagues}
                  accessFilter={accessFilter}
                />
              </FeedAccessGate>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
