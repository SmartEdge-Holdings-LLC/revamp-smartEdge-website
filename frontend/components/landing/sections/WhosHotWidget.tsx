"use client";

import * as React from "react";
import { type AdminPick } from "@/types/picks";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandImage } from "@/components/ui/brand-image";
import { cn } from "@/lib/utils";

interface CapperStats {
  name: string;
  wins: number;
  losses: number;
  profit: number;
}

type TimePeriod = "4days";

export function WhosHotWidget() {
  const [loading, setLoading] = React.useState(true);
  const [cappersByPeriod, setCappersByPeriod] = React.useState<Record<TimePeriod, CapperStats[]>>({
    "4days": [],
  });

  React.useEffect(() => {
    const fetchAndProcessHottestPicks = async () => {
      try {
        setLoading(true);
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const response = await fetch(`${backendUrl}/api/picks/hottest?page=1&limit=100`);
        if (!response.ok) throw new Error("Failed to fetch hottest picks");
        const data = await response.json();
        const picks = (data.picks || []) as AdminPick[];

        // Calculate stats for the last 4 days
        const periods: TimePeriod[] = ["4days"];
        const newCappersByPeriod: Record<TimePeriod, CapperStats[]> = {
          "4days": [],
        };

        periods.forEach((period) => {
          const now = new Date();
          const daysToSubtract = 4;
          const startDate = new Date(now.getTime() - daysToSubtract * 24 * 60 * 60 * 1000);

          const capperMap = new Map<string, { wins: number; losses: number; totalProfit: number }>();

          picks.forEach((pick) => {
            if (!pick.createdBy) return;
            if (new Date(pick.createdAt) < startDate) return;
            if (pick.result === "pending") return;

            const name = typeof pick.createdBy === "string" ? pick.createdBy : pick.createdBy.name;
            if (!capperMap.has(name)) {
              capperMap.set(name, { wins: 0, losses: 0, totalProfit: 0 });
            }

            const stats = capperMap.get(name)!;
            if (pick.result === "won") {
              stats.wins++;
            } else if (pick.result === "lost") {
              stats.losses++;
            }
            // Add actual profit from pick if available
            if (pick.profit !== undefined && pick.profit !== null) {
              stats.totalProfit += pick.profit;
            }
          });

          const capperStats: CapperStats[] = Array.from(capperMap.entries())
            .map(([name, stats]) => ({
              name,
              wins: stats.wins,
              losses: stats.losses,
              profit: stats.totalProfit,
            }))
            .sort((a, b) => b.profit - a.profit);

          newCappersByPeriod[period] = capperStats;
        });

        setCappersByPeriod(newCappersByPeriod);
      } catch (error) {
        console.error("Failed to load hottest picks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessHottestPicks();
  }, []);

  const getWinPercentage = (wins: number, losses: number) => {
    const total = wins + losses;
    if (total === 0) return "0%";
    return `${Math.round((wins / total) * 100)}%`;
  };

  const getPeriodLabel = () => {
    return "Last 4 Days";
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

        {/* Leaderboard Section */}
        <div className="space-y-12">
          {(["4days"] as const).map((period) => (
            <div key={period}>
              <h3 className="text-lg font-bold text-white mb-4">{getPeriodLabel()}</h3>
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
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="border-b border-white/5 px-6 py-5 flex gap-12">
                        <Skeleton className="h-4 w-40 bg-white/10" />
                        <Skeleton className="h-4 w-20 bg-white/10 ml-auto" />
                        <Skeleton className="h-4 w-28 bg-white/10" />
                      </div>
                    ))}
                  </div>
                ) : cappersByPeriod[period].length === 0 ? (
                  <div className="flex justify-center py-8">
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
                        {cappersByPeriod[period].map((capper) => (
                          <tr key={`${period}-${capper.name}`} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-5">
                              <span className="text-sm font-bold text-white">{capper.name}</span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <span className={cn(
                                "text-sm font-bold",
                                capper.profit >= 0 ? "text-emerald-500" : "text-red-400"
                              )}>
                                ${Math.abs(capper.profit)}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <span className="text-sm font-bold text-emerald-500">
                                {capper.wins}-{capper.losses}({getWinPercentage(capper.wins, capper.losses)})
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
          ))}
        </div>
      </div>
    </section>
  );
}
