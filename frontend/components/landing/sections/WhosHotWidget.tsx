"use client";

import * as React from "react";
import { TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { getSportsLeagueLogo } from "@/lib/sports-leagues";
import { LEAGUES, type League } from "@/types/picks";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandImage } from "@/components/ui/brand-image";

type TimePeriod = "3days" | "7days" | "30days";

interface CapperStats {
  name: string;
  wins: number;
  losses: number;
  profit: number;
  nickname?: string;
}

export function WhosHotWidget() {
  const [loading, setLoading] = React.useState(true);
  const [selectedLeague, setSelectedLeague] = React.useState<League | "ALL">("ALL");
  const [selectedPeriod, setSelectedPeriod] = React.useState<TimePeriod>("3days");
  const [cappers, setCappers] = React.useState<CapperStats[]>([]);
  const leagueScrollRef = React.useRef<HTMLDivElement>(null);

  const scrollLeagues = (direction: "left" | "right") => {
    if (leagueScrollRef.current) {
      const scrollAmount = 200;
      leagueScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  React.useEffect(() => {
    const fetchCapperStats = async () => {
      try {
        setLoading(true);
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const response = await fetch(`${backendUrl}/api/picks?page=1&limit=100&status=active`);
        if (!response.ok) throw new Error("Failed to fetch picks");
        const data = await response.json();

        // Calculate date range
        const now = new Date();
        const daysToSubtract = selectedPeriod === "3days" ? 3 : selectedPeriod === "7days" ? 7 : 30;
        const startDate = new Date(now.getTime() - daysToSubtract * 24 * 60 * 60 * 1000);

        // Filter and group picks by capper
        const capperMap = new Map<string, { wins: number; losses: number }>();

        data.picks.forEach((pick: any) => {
          if (!pick.createdBy?.name) return;
          if (new Date(pick.createdAt) < startDate) return;
          if (selectedLeague !== "ALL" && pick.league !== selectedLeague) return;
          if (pick.result === "pending") return;

          const name = pick.createdBy.name;
          if (!capperMap.has(name)) {
            capperMap.set(name, { wins: 0, losses: 0 });
          }

          const stats = capperMap.get(name)!;
          if (pick.result === "won") {
            stats.wins++;
          } else if (pick.result === "lost") {
            stats.losses++;
          }
        });

        // Convert to array and calculate profit
        const capperStats: CapperStats[] = Array.from(capperMap.entries())
          .map(([name, stats]) => ({
            name,
            wins: stats.wins,
            losses: stats.losses,
            profit: stats.wins * 100 - stats.losses * 100,
            nickname: name === "Dustin" ? "The Renaissance Man" : undefined,
          }))
          .sort((a, b) => b.profit - a.profit)
          .slice(0, 9);
        setCappers(capperStats);
      } catch (error) {
        console.error("Failed to load capper stats:", error);
        setCappers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCapperStats();
  }, [selectedLeague, selectedPeriod]);

  const getPeriodLabel = (period: TimePeriod) => {
    switch (period) {
      case "3days":
        return "3 DAYS";
      case "7days":
        return "7 DAYS";
      case "30days":
        return "30 DAYS";
    }
  };

  const getWinPercentage = (wins: number, losses: number) => {
    const total = wins + losses;
    if (total === 0) return "0%";
    return `${Math.round((wins / total) * 100)}%`;
  };

  return (
    <section className="relative z-10 w-full py-20 sm:py-24 md:py-28 px-4 sm:px-6 md:px-8 bg-[#0a0a0a] border-5 border-white rounded-2xl">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header - Bold & Advanced */}
        <div className="mb-16 sm:mb-20">
          <BrandImage
            src="/logo.webp"
            alt="SmartEdgePicks Logo"
            width={80}
            height={80}
            className="mb-4 h-16 w-auto"
          />
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-tight mb-4">
            WHO'S<br className="hidden sm:block" />
            <span className="text-emerald-500">HOT</span>
          </h2>
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-16 bg-linear-to-r from-emerald-500 to-emerald-400"></div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-500">Top Performers</p>
          </div>
        </div>

        {/* Filters - Advanced Grid */}
        <div className="mb-12 sm:mb-16">
          {/* Time Period */}
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Timeframe</p>
            <div className="grid grid-cols-3 gap-3">
              {(["3days", "7days", "30days"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={cn(
                    "py-3 px-4 font-bold text-xs uppercase tracking-wide transition-all border-2",
                    selectedPeriod === period
                      ? "bg-emerald-500 text-black border-emerald-500"
                      : "bg-transparent text-white border-white/20 hover:border-emerald-500/50"
                  )}
                >
                  {getPeriodLabel(period)}
                </button>
              ))}
            </div>
          </div>

          {/* Leagues */}
          <div className="w-full">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">League</p>
            <div className="relative flex items-center w-full px-12">
              <button
                onClick={() => scrollLeagues("left")}
                className="absolute left-0 z-10 p-2 bg-white hover:bg-white/80 rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-black" />
              </button>
              <div
                ref={leagueScrollRef}
                className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full"
              >
              <button
                onClick={() => setSelectedLeague("ALL")}
                className={cn(
                  "px-4 py-3 font-bold text-xs uppercase tracking-wide transition-all border-2 whitespace-nowrap min-w-fit",
                  selectedLeague === "ALL"
                    ? "bg-emerald-500 text-black border-emerald-500"
                    : "bg-transparent text-white border-white/20 hover:border-emerald-500/50"
                )}
              >
                All
              </button>
              {LEAGUES.map((league) => (
                <button
                  key={league}
                  onClick={() => setSelectedLeague(league as League)}
                  className={cn(
                    "px-3 py-3 font-semibold text-xs uppercase tracking-wide transition-all border-2 flex items-center gap-2 whitespace-nowrap min-w-fit",
                    selectedLeague === league
                      ? "bg-emerald-500 text-black border-emerald-500"
                      : "bg-transparent text-white border-white/20 hover:border-emerald-500/50"
                  )}
                >
                  {getSportsLeagueLogo(league as League) && (
                    <Image
                      src={getSportsLeagueLogo(league as League)!}
                      alt={league}
                      width={16}
                      height={16}
                      className="object-contain"
                    />
                  )}
                  {league}
                </button>
              ))}
              </div>
              <button
                onClick={() => scrollLeagues("right")}
                className="absolute right-0 z-10 p-2 bg-white hover:bg-white/80 rounded-full transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-black" />
              </button>
            </div>
          </div>
        </div>

        {/* Leaderboard - Advanced Table */}
        <div className="border-2 border-white/10 bg-black/40">
          {loading ? (
            <div className="w-full">
              <div className="bg-white/5 border-b-2 border-white/10 px-6 py-4">
                <div className="flex gap-12">
                  <Skeleton className="h-4 w-32 bg-white/10" />
                  <Skeleton className="h-4 w-24 bg-white/10 ml-auto" />
                  <Skeleton className="h-4 w-24 bg-white/10" />
                </div>
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="border-b border-white/5 px-6 py-5 flex gap-12">
                  <Skeleton className="h-4 w-40 bg-white/10" />
                  <Skeleton className="h-4 w-20 bg-white/10 ml-auto" />
                  <Skeleton className="h-4 w-28 bg-white/10" />
                </div>
              ))}
            </div>
          ) : cappers.length === 0 ? (
            <div className="flex justify-center py-16">
              <p className="text-sm text-zinc-400">No data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b-2 border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Capper</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Profit</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Record</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {cappers.map((capper) => (
                    <tr key={capper.name} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-5">
                        <div>
                          <span className="text-sm font-bold text-white">
                            {capper.name === "Dustin" ? "D.D" : capper.name}
                          </span>
                          {capper.nickname && (
                            <p className="text-xs text-zinc-400 mt-1 italic">{capper.nickname}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                      
                          <span className={cn(
                            "text-sm font-bold",
                            capper.profit >= 0 ? "text-emerald-500" : "text-red-400"
                          )}>
                            ${Math.abs(capper.profit)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="text-sm font-bold text-emerald-500">
                          {capper.wins}W-{capper.losses}L({getWinPercentage(capper.wins, capper.losses)})
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
