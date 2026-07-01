"use client";

import * as React from "react";
import Link from "next/link";
import { listPaidPicks } from "@/lib/api/memberPicksApi";
import { enrichPaidPicks } from "@/lib/enrich-member-pick";
import { getDateStringInET, getTodayDateStringInET, getYesterdayDateStringInET } from "@/lib/datetime";
import type { PaidPickFeed } from "@/lib/subscription-access";
import type { League } from "@/types/picks";
import { DashboardPickDetailCard } from "@/components/dashboard/DashboardPickDetailCard";
import { DashboardPicksGridSkeleton } from "@/components/dashboard/DashboardPickDetailCardSkeleton";
import { Button } from "@/components/ui/button";

const FEED_META: Record<
  PaidPickFeed,
  { title: string; subtitle: string; empty: string }
> = {
  admin: {
    title: "SmartEdge® VIP picks",
    subtitle: "Paid plays from the SmartEdge admin desk",
    empty: "No active SmartEdge VIP picks right now. Check back soon.",
  },
  jonah: {
    title: "Jonah VIP picks",
    subtitle: "Paid plays from Jonah handicapper",
    empty: "No active Jonah VIP picks right now. Check back soon.",
  },
};

function getDateLabel(dateStringInET: string): string {
  const today = getTodayDateStringInET();
  const yesterday = getYesterdayDateStringInET();

  if (dateStringInET === today) return "Today's Picks";
  if (dateStringInET === yesterday) return "Yesterday's Picks";
  return dateStringInET;
}

function groupPicksByDate(picks: any[]): Array<{ dateString: string; label: string; picks: any[] }> {
  const grouped = new Map<string, any[]>();

  picks.forEach((pick) => {
    // Group by matchTime converted to ET date string
    const dateKeyInET = getDateStringInET(pick.matchTime) || getDateStringInET(pick.createdAt) || "Unknown";
    if (!grouped.has(dateKeyInET)) {
      grouped.set(dateKeyInET, []);
    }
    grouped.get(dateKeyInET)!.push(pick);
  });

  return Array.from(grouped.entries())
    .map(([dateStr, picksForDate]) => ({
      dateString: dateStr,
      label: getDateLabel(dateStr),
      picks: picksForDate,
    }))
    .sort((a, b) => {
      // Parse date strings in reverse chronological order (newest first)
      const dateA = new Date(a.dateString);
      const dateB = new Date(b.dateString);
      return dateB.getTime() - dateA.getTime();
    });
}

type DashboardPaidPicksFeedProps = {
  feed: PaidPickFeed;
  token: string;
  hideHeader?: boolean;
  showFullAnalysis?: boolean;
  leagues?: League[];
  accessFilter?: string[];
};

export function DashboardPaidPicksFeed({ feed, token, hideHeader, showFullAnalysis = true, leagues = [], accessFilter }: DashboardPaidPicksFeedProps) {
  const meta = FEED_META[feed];
  const [picks, setPicks] = React.useState<ReturnType<typeof enrichPaidPicks>>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    // Use provided accessFilter or determine based on feed type
    const accessTypes = accessFilter ?? (feed === "admin" ? ["smartedgeVIPPremium"] : undefined);

    void listPaidPicks(token, feed, {
      page: 1,
      limit: 50,
      league: leagues.length > 0 ? leagues : undefined,
      access: accessTypes
    })
      .then((res) => {
        if (cancelled) return;
        const enriched = enrichPaidPicks(res.picks, { stripAnalysis: !showFullAnalysis });
        const sorted = enriched.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setPicks(sorted);
      })
      .catch((err) => {
        if (cancelled) return;
        setPicks([]);
        setError((err as Error).message || "Could not load picks");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [feed, token, leagues, showFullAnalysis, accessFilter]);

  return (
    <section className="space-y-4">
      {!hideHeader ? (
        <div>
          <h2 className="text-lg font-semibold text-white">{meta.title}</h2>
          <p className="mt-1 text-sm text-subtle">{meta.subtitle}</p>
        </div>
      ) : null}

      {loading ? (
        <DashboardPicksGridSkeleton count={4} />
      ) : error ? (
        <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-5 py-8 text-center text-sm text-red-200">
          {error}
        </div>
      ) : (
        <div className="space-y-12">
          {picks.length > 0 && groupPicksByDate(picks).map((group, groupIndex) => (
            <div key={group.label}>
              <div className={groupIndex > 0 ? "pt-8 border-t border-white/10" : ""}>
                <h3 className="text-left text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wide text-white">
                  {group.label}
                </h3>
                <p className="mt-1 text-left text-xs text-zinc-500">
                  Premium picks with full matchup, odds, and analysis
                </p>
              </div>
              <div className="mt-6 grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">
                {group.picks.map((pick) => (
                  <div key={pick._id} className="flex h-full w-full min-w-0">
                    <DashboardPickDetailCard pick={pick} feed={feed} showFullAnalysis={showFullAnalysis} />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {picks.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-10 text-center text-sm text-subtle">
              {meta.empty}
            </div>
          )}

          {/* NFL Language Guide */}
          {leagues.includes("NFL") && (
            <div className="mt-8 rounded-lg border-3 border-white bg-white/5 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">The Ultimate NFL Betting Guide: Key Terms and Wager Types Explained</h3>

              <div className="space-y-6 text-sm text-subtle">
                <div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-white font-medium">Against the Spread (ATS)</p>
                      <p className="text-xs mt-1">A metric that tracks a team's win-loss record specifically in relation to the point spread handicap rather than their actual on-field victories. It indicates how consistently a franchise outperforms or underperforms the point margins established by oddsmakers.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Backdoor Cover</p>
                      <p className="text-xs mt-1">A scenario where a team trailing by a wide margin scores structurally meaningless points late in the final minutes of a game. While these late points have no impact on the actual game outcome, they allow the underdog to unexpectedly beat the point spread for bettors.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Bankroll</p>
                      <p className="text-xs mt-1">The dedicated pool of capital set aside strictly for sports betting purposes. Maintaining a distinct bankroll separate from personal living expenses is the foundation of responsible risk management.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Betting Unit</p>
                      <p className="text-xs mt-1">A standard measurement used to quantify the size of a single wager, typically calculated as a small, consistent percentage of a bettor's total bankroll. Utilizing units standardizes tracking and prevents erratic sizing during hot or cold streaks.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Chalk</p>
                      <p className="text-xs mt-1">A betting term used to describe a heavy favorite on the board. Wagering on the chalk yields a higher probability of winning but offers a lower financial return on the investment.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Circled Game</p>
                      <p className="text-xs mt-1">A matchup on the betting board where the sportsbook heavily restricts the maximum amount a bettor can wager. Sportsbooks circle games when severe external factors, such as a star quarterback injury or extreme impending weather, introduce massive volatility into the lines.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Cover</p>
                      <p className="text-xs mt-1">Successfully beating the point spread handicap. A favorite covers by winning the contest by a margin greater than the point spread, while an underdog covers by winning outright or losing by fewer points than the spread allows.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Underdog (Dog)</p>
                      <p className="text-xs mt-1">The team expected to lose a given matchup. On the betting board, underdogs are identified by a plus sign, which indicates either a points advantage on the spread or a higher profit yield on a moneyline wager.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Even Money</p>
                      <p className="text-xs mt-1">A balanced wager where the net profit matches the exact amount of the original stake.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Fade</p>
                      <p className="text-xs mt-1">The strategy of purposefully betting against a specific team, public trend, or a particular handicapper's recommendation.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Favorite</p>
                      <p className="text-xs mt-1">The team oddsmakers project to win the contest. Favorites are universally designated by a minus sign accompanying their point spread and moneyline listings.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Futures</p>
                      <p className="text-xs mt-1">Long-term wagers placed on outcomes that will not be decided until later in the calendar year, such as predicting a division champion or the winner of the Super Bowl prior to the conclusion of the postseason.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Handle</p>
                      <p className="text-xs mt-1">The total cumulative dollar amount accepted by a sportsbook or market on a specific game, sport, or designated time frame. The handle indicates overall public and professional betting volume.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Handicapping</p>
                      <p className="text-xs mt-1">The comprehensive process of studying and analyzing sports data, injury reports, weather conditions, and situational trends to calculate the true probability of an outcome and locate betting value.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Juice (Vigorish / Vig)</p>
                      <p className="text-xs mt-1">The built-in commission or booking fee charged by a sportsbook for processing a wager. This premium acts as the house's profit margin for brokering the bet.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Line</p>
                      <p className="text-xs mt-1">The specific point spread, game total, or moneyline odds currently posted by a sportsbook for a given matchup.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Live Betting (In-Game Betting)</p>
                      <p className="text-xs mt-1">The act of placing wagers on a game while the action is actively unfolding in real time. The odds shift rapidly second-by-second based on live game momentum, scoring plays, and injuries.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Lock</p>
                      <p className="text-xs mt-1">A casual term used by bettors to describe a selection they believe is an absolute certainty to win.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Moneyline</p>
                      <p className="text-xs mt-1">A straightforward wager on which team will win the contest outright, completely independent of a point spread. Payouts are dictated by a negative sign for the favorite and a positive sign for the underdog.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Middle</p>
                      <p className="text-xs mt-1">A high-level betting strategy where a gambler places wagers on both sides of the same game at different point spreads (usually due to line movement). This creates a targeted window where the bettor can potentially win both wagers simultaneously with zero risk of a total loss.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">NFL Parlay</p>
                      <p className="text-xs mt-1">A single wager that links multiple football selections together on one ticket. For the ticket to cash, every single selection must win; a tie or push on one leg typically removes that leg from the ticket and reverts the parlay to a lower tier.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Nickel</p>
                      <p className="text-xs mt-1">Industry slang used to denote a single wager of five hundred dollars.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Off the Board (OTB)</p>
                      <p className="text-xs mt-1">A temporary status where a sportsbook removes a game from its platform and refuses to accept further wagers. This occurs when sudden, critical news—such as a last-minute player injury—renders the current lines inaccurate.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Over/Under (Total)</p>
                      <p className="text-xs mt-1">A wager based on the collective points scored by both teams combined. Bettors predict whether the final cumulative score will fall above or below the baseline set by the oddsmaker.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Parlay</p>
                      <p className="text-xs mt-1">A combined wager featuring two or more individual selections where every single pick must be correct for the bet to win.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Pick'em</p>
                      <p className="text-xs mt-1">A matchup where oddsmakers perceive both teams as perfectly equal, resulting in a point spread of zero. Bettors simply select the outright winner of the game.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Point Spread</p>
                      <p className="text-xs mt-1">The projected margin of victory established by oddsmakers to balance the field between uneven teams. It requires the favorite to win by a certain number of points, or allows the underdog to lose within a specific point threshold.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Push</p>
                      <p className="text-xs mt-1">A tie between the bettor and the sportsbook, occurring when the final game score lands exactly on the listed point spread or total. In a push scenario, the bettor's original stake is fully refunded.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">ROI (Return on Investment)</p>
                      <p className="text-xs mt-1">The primary metric used to calculate long-term betting efficiency and profitability, expressed as a percentage of total profit relative to the total capital risked.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Same-Game Parlay</p>
                      <p className="text-xs mt-1">A specialized parlay that allows bettors to combine multiple correlated outcomes, player props, and totals from within the exact same game onto a single wagering ticket.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Sharp</p>
                      <p className="text-xs mt-1">A professional, data-driven, or highly skilled sports bettor whose substantial wagering volume can directly cause sportsbooks to shift their lines.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Spread</p>
                      <p className="text-xs mt-1">The point handicap assigned to a game to create an even betting market between two mismatched teams.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Steam</p>
                      <p className="text-xs mt-1">A sudden, uniform movement of a betting line across multiple competitive sportsbooks simultaneously, typically triggered by a massive influx of professional money targeting one specific side.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Straight Bet</p>
                      <p className="text-xs mt-1">A fundamental wager placed on a single, isolated outcome, such as an individual point spread, moneyline, or total.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Teaser</p>
                      <p className="text-xs mt-1">A variation of a parlay wager where bettors are allowed to shift multiple point spreads or game totals by a set number of points in their favor, accepting a lower payout in exchange for a higher probability of winning.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Total</p>
                      <p className="text-xs mt-1">The benchmark number set by oddsmakers predicting the cumulative score of an event, allowing wagers on the over or the under.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Units</p>
                      <p className="text-xs mt-1">The standard measurement used to communicate betting profits, losses, and records independently of a bettor's specific financial net worth or bankroll size.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Vigorish</p>
                      <p className="text-xs mt-1">The standard mathematical premium or fee retained by a sportsbook for facilitating sports wagers.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Wager</p>
                      <p className="text-xs mt-1">The financial stake risked on the outcome of a sporting event.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NBA Language Guide */}
          {leagues.includes("NBA") && (
            <div className="mt-8 rounded-lg border-3 border-white bg-white/5 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">The Top 15 NBA Betting Terms Every Fan Needs to Know: Key Terms and Wager Types Explained</h3>

              <p className="text-sm text-subtle mb-6">
                If you are diving into basketball betting for the first time, the sports board can look like an overwhelming wall of numbers. You don't need to master every advanced market overnight—you just need to lock down the core vocabulary. Think of this as your baseline rotation: the foundational terms required to read NBA odds and place your first wager with confidence.
              </p>

              <div className="space-y-6 text-sm text-subtle">
                <div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-white font-medium">Moneyline</p>
                      <p className="text-xs mt-1">The most fundamental bet on the board: picking the outright winner of the basketball game. There are no point spreads or victory margins to calculate; your selected team simply needs to win the game.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Point Spread</p>
                      <p className="text-xs mt-1">The handicap established by oddsmakers to balance the scales between uneven teams. The favorite must win the game by more than the designated point handicap to clear the wager, while the underdog can cover by winning the game outright or losing by fewer points than the spread dictates.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Total (Over/Under)</p>
                      <p className="text-xs mt-1">A wager centered on the collective offensive output of both teams. The sportsbook sets a benchmark for the total combined points scored in the game, and you bet on whether the actual final score will fall above or below that line.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Parlay</p>
                      <p className="text-xs mt-1">A single wager that chains multiple individual selections (referred to as "legs") together onto one ticket. To cash a parlay, every single basketball pick must win. Because the odds compound with each added team, parlays offer elevated payouts but carry significantly higher risk.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Prop Bet (Proposition)</p>
                      <p className="text-xs mt-1">A targeted wager on specific milestones within an NBA game rather than the final score. These are split into Game Props (e.g., which team scores the first basket) and Player Props (e.g., wagering on an individual superstar's total points, rebounds, or assists).</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Futures</p>
                      <p className="text-xs mt-1">Long-term wagers placed on events that will not be decided until later in the calendar year. Popular NBA futures markets include betting on the Rookie of the Year, tracking division winners, or predicting which franchise will hoist the Larry O'Brien Championship Trophy.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">ATS (Against the Spread)</p>
                      <p className="text-xs mt-1">A term tracking the statistical performance of a team relative to the oddsmaker's point spread rather than their actual win-loss record. A team might lose an NBA game in real life but still win "Against the Spread" for bettors if they beat the handicap.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Juice (Vig / Vigorish)</p>
                      <p className="text-xs mt-1">The built-in fee or commission that a sportsbook charges for accepting your wager. This processing premium ensures the house turns a profit over time, acting as the fee for brokering the bet.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Favorite</p>
                      <p className="text-xs mt-1">The franchise mathematically projected by oddsmakers to win the matchup. On the betting board, favorites are universally designated by a minus sign accompanying both their point spread and moneyline odds.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Underdog</p>
                      <p className="text-xs mt-1">The team projected to lose the contest. Underdogs are designated on the board by a plus sign, indicating they are receiving a points advantage on the spread or offering a higher profit yield on the moneyline.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Push</p>
                      <p className="text-xs mt-1">A scenario where the final score of the game lands precisely on the sportsbook's listed betting line. Because there is no winning or losing outcome against the number, the wager is declared a tie and your stake is fully refunded.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Cover</p>
                      <p className="text-xs mt-1">Successfully winning a point spread wager. For a favorite, covering means winning by more than the point handicap. For an underdog, covering means keeping the final score closer than the point spread or winning the game outright.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Bankroll</p>
                      <p className="text-xs mt-1">The designated pool of capital you set aside specifically for sports betting. Your bankroll should consist strictly of disposable funds completely separate from your daily living expenses.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Unit</p>
                      <p className="text-xs mt-1">The baseline, standard dollar amount you risk on a single wager. Betting in consistent "units" rather than erratic cash amounts is the foundational rule of long-term bankroll management and prevents heavy losses during a cold streak.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Odds</p>
                      <p className="text-xs mt-1">The numerical value assigned to a selection that reflects its perceived probability. This calculated price dictates exactly how much profit the sportsbook will pay out relative to the size of your stake if your bet hits.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MLB Language Guide */}
          {leagues.includes("MLB") && (
            <div className="mt-8 rounded-lg border-3 border-white bg-white/5 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">The Ultimate MLB Betting Guide: Key Terms and Wager Types Explained</h3>

              <p className="text-sm text-subtle mb-6">
                With a grueling 162-game regular season, professional baseball offers an unparalleled volume of daily wagering opportunities. For newcomers diving into the world of sports gambling, the sheer volume of available markets and betting terminology can feel overwhelming. To help you navigate the boards and build a sharper betting strategy, we have broken down the essential baseball betting terms every player needs to know.
              </p>

              <div className="space-y-6 text-sm text-subtle">
                <div>
                  <h4 className="font-semibold text-white mb-3">1. Core Game Bets</h4>
                  <p className="mb-4">These are the foundational markets you will see at the top of every sportsbook board for any given baseball game.</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-white font-medium">Moneyline</p>
                      <p className="text-xs mt-1">The most straightforward wager in sports betting: picking the outright winner of the game. Favorites are designated with a minus sign (-), showing how much you need to risk to win $100. Underdogs feature a plus sign (+), indicating how much profit a $100 bet will return.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Run Line</p>
                      <p className="text-xs mt-1">Baseball's version of the point spread. Because baseball is typically low-scoring, the run line is almost universally set at 1.5 runs. The Favorite (-1.5): Must win the game by 2 or more runs to cover. The Underdog (+1.5): Covers the bet if they win the game outright or lose by exactly 1 run.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Game Total (Over/Under)</p>
                      <p className="text-xs mt-1">A wager on the combined number of runs scored by both teams. The sportsbook sets a line (e.g., 8.5 runs), and you bet on whether the actual final score will be higher (Over) or lower (Under) than that baseline.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Parlay</p>
                      <p className="text-xs mt-1">A high-risk, high-reward wager that combines two or more individual baseball picks into a single ticket. To win a parlay, every single selection must hit. If even one leg loses, the entire wager is a loss. The appeal lies in the compounding odds, allowing for large payouts on smaller stakes.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Futures</p>
                      <p className="text-xs mt-1">Long-term wagers placed on outcomes that won't be decided until later in the season or after the postseason. Common examples include betting on a team to win the World Series or wagering on a team's total regular-season wins.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-3">2. Game & Inning Micro-Bets</h4>
                  <p className="mb-4">These markets allow you to wager on specific segments of the game or isolated team performances rather than the full 9-inning final outcome.</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-white font-medium">First Five Innings (F5)</p>
                      <p className="text-xs mt-1">A popular market for bettors who want to focus strictly on the starting pitching matchup. This wager is graded solely on the score at the conclusion of the fifth inning, completely bypassing anything that happens with the bullpen later in the game.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Team Totals</p>
                      <p className="text-xs mt-1">Similar to a game total, but isolated to just one team. For example, if a team's individual total is set at 4.5, an Over bettor needs that specific team to score 5 or more runs to cash, regardless of who wins the game.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">NRFI (No Runs First Inning)</p>
                      <p className="text-xs mt-1">A fast-paced wager on whether the first inning will end completely scoreless (0-0). While lucrative and quick to resolve, it carries inherent risk because managers stack their most dangerous hitters at the very top of the batting order.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Correct Score</p>
                      <p className="text-xs mt-1">An exact-prediction market where you guess the precise final score of the ballgame. Because the exact score is highly volatile and difficult to project, these markets offer exceptionally long, plus-money payouts.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-3">3. Player Performance Props</h4>
                  <p className="mb-4">Proposition (prop) bets allow you to look past the team outcomes and wager directly on individual player statistics.</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-white font-medium">Batter Props</p>
                      <p className="text-xs mt-1">To Hit a Home Run: A simple wager on whether a specific player will hit a long ball during the game. To Record a Hit: Sportsbooks set over/under baselines for individual players. Total Bases: A popular metric that tracks a batter's production from safe hits (single = 1 base, double = 2, triple = 3, home run = 4). To Record an RBI: An over/under market on Runs Batted In. Player Strikeouts: A market tracking how many times a specific hitter will strike out.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium">Pitcher Props & Performance Combos</p>
                      <p className="text-xs mt-1">Pitcher Strikeouts: A staple prop bet where you wager on whether a starting pitcher will go over or under a set number of strikeouts. Player Performance Doubles: A specialized mini-parlay offered by sportsbooks that pairs a player prop with a team outcome.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

type DashboardPaidPicksProps = {
  token: string;
  feeds: PaidPickFeed[];
};

export function DashboardPaidPicks({ token, feeds }: DashboardPaidPicksProps) {
  if (feeds.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
        <h2 className="text-lg font-semibold text-white">No active VIP subscription</h2>
        <p className="mt-2 text-sm text-subtle">
          Subscribe to SmartEdge® or Jonah to unlock paid picks on your dashboard.
        </p>
        <Link href="/#pricing" className="mt-4 inline-block">
          <Button className="bg-white text-black hover:bg-white/80">View plans</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {feeds.map((feed) => (
        <DashboardPaidPicksFeed key={feed} feed={feed} token={token} />
      ))}
    </div>
  );
}
