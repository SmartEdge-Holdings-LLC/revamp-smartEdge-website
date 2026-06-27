"use client";

import { useState } from "react";
import Image from "next/image";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardPaidPicksFeed } from "@/components/dashboard/DashboardPaidPicksFeed";
import { DashboardSectionTabs } from "@/components/dashboard/DashboardSectionTabs";
import { PICK_LEAGUES, getSportsLeagueLogo } from "@/lib/sports-leagues";
import { cn } from "@/lib/utils";
import type { SessionMemberUser } from "@/types/member-session";
import type { League } from "@/types/picks";
import type { PaidPickFeed } from "@/lib/api/memberPicksApi";

type VIPPickFeedType = PaidPickFeed | "jonah-vip" | "jonah-vip-premium";

const VIP_PICK_TABS: { id: VIPPickFeedType; label: string; access?: string }[] = [
  { id: "admin", label: "Smartedge VIP Picks" },
  { id: "jonah", label: "Jonah Weekly Picks", access: "jonahweekly" },
  { id: "jonah-vip", label: "Jonah Monthly Standard", access: "jonahvip" },
];

type VIPPicksHomeProps = {
  user: SessionMemberUser;
};

export function VIPPicksHome({ user }: VIPPicksHomeProps) {
  const token = user.backendToken;
  const [activeFeed, setActiveFeed] = useState<VIPPickFeedType>("admin");
  const [selectedLeagues, setSelectedLeagues] = useState<League[]>([]);

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
            <h1 className="text-3xl font-semibold tracking-tight text-white">VIP Picks</h1>
            <DashboardSectionTabs
              tabs={VIP_PICK_TABS}
              active={activeFeed}
              onChange={setActiveFeed}
              ariaLabel="VIP pick feeds"
            />

            {/* League Filter */}
            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-white mb-2">
                Filter by League
              </p>
              <p className="text-sm text-subtle mb-4">
                Filter picks by your favorite sports leagues.
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
              <VIPPicksFeed
                feed={activeFeed}
                token={token}
                leagues={selectedLeagues}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

type VIPPicksFeedProps = {
  feed: VIPPickFeedType;
  token: string;
  leagues: League[];
};

function VIPPicksFeed({ feed, token, leagues }: VIPPicksFeedProps) {
  // Map VIPPickFeedType to PaidPickFeed and access filter
  let actualFeed: PaidPickFeed;
  let accessFilter: string[];

  switch (feed) {
    case "jonah":
      actualFeed = "jonah";
      accessFilter = ["jonahweekly"];
      break;
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
      accessFilter = ["smartedgeVIP"];
      break;
  }

  return (
    <DashboardPaidPicksFeed
      feed={actualFeed}
      token={token}
      hideHeader={false}
      showFullAnalysis={true}
      leagues={leagues}
      accessFilter={accessFilter}
    />
  );
}
