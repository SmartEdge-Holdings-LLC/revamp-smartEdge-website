"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Activity, MapPin, TrendingUp } from "lucide-react";
import { BrandImage } from "@/components/ui/brand-image";
import { PricingAccentButton } from "@/components/pricing/PricingAccentButton";
import { OddsSportSubNav } from "@/components/landing/OddsSportSubNav";
import { fetchMlbOdds, fetchNflOdds, type ParlayEvent } from "@/lib/api/parlayOddsApi";
import { ODDS_GAMES, oddsSportLogo, type OddsGame, type OddsSport } from "./odds-data";

interface OddsContentProps {
  sport: OddsSport;
  onSportChange: (sport: OddsSport) => void;
}

function OddsCell({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-0.5 text-center sm:min-w-19">
      <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{label}</span>
      <span className="text-sm font-semibold tabular-nums text-white">{value}</span>
      {sub ? <span className="text-[11px] tabular-nums text-zinc-400">{sub}</span> : null}
    </div>
  );
}

function TeamMark({
  logo,
  name,
  abbr,
  record,
  align = "left",
}: {
  logo: string;
  name: string;
  abbr: string;
  record?: string;
  align?: "left" | "right";
}) {
  return (
    <div
      className={`flex min-w-0 items-center gap-3 ${align === "right" ? "flex-row-reverse text-right" : ""}`}
    >
      <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5 sm:size-12">
        <BrandImage
          src={logo}
          alt={name}
          width={40}
          height={40}
          className="h-8 w-8 object-contain sm:h-9 sm:w-9"
          fallback={
            <span className="text-[10px] font-bold text-accent">{abbr}</span>
          }
        />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white sm:text-[15px]">{name}</p>
        <p className="mt-0.5 text-xs text-zinc-500">
          {abbr}
          {record ? <span className="text-zinc-600"> · {record}</span> : null}
        </p>
      </div>
    </div>
  );
}

function OddsGameRow({ game }: { game: OddsGame }) {
  const leagueLogo = oddsSportLogo(game.sport);

  return (
    <article className="rounded-2xl border border-white/10 bg-white/3 p-4 transition-colors hover:border-white/15 hover:bg-white/5 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/6 pb-4">
        <div className="flex flex-wrap items-center gap-2.5">
          {leagueLogo ? (
            <span className="flex size-7 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-white/5">
              <BrandImage
                src={leagueLogo}
                alt={game.sport}
                width={24}
                height={24}
                className="h-5 w-5 object-contain"
              />
            </span>
          ) : null}
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            {game.startTime}
          </span>
          {game.venue ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-zinc-600">
              <MapPin className="size-3 shrink-0" aria-hidden />
              {game.venue}
            </span>
          ) : null}
        </div>
        <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
          {game.sport}
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid min-w-0 flex-1 grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4">
          <TeamMark
            logo={game.away.logo}
            name={game.away.name}
            abbr={game.away.abbr}
            record={game.away.record}
            align="left"
          />
          <span className="px-1 text-center text-xs font-semibold uppercase tracking-widest text-zinc-600">
            @
          </span>
          <TeamMark
            logo={game.home.logo}
            name={game.home.name}
            abbr={game.home.abbr}
            record={game.home.record}
            align="right"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/6 pt-4 sm:justify-end sm:gap-5 sm:border-t-0 sm:pt-0 lg:border-l lg:border-white/6 lg:pl-6">
          <OddsCell label="Spread" value={game.spread.away} sub={game.spread.home} />
          <OddsCell label="Moneyline" value={game.moneyline.away} sub={game.moneyline.home} />
          <OddsCell label={`Total ${game.total.line}`} value={game.total.over} sub={game.total.under} />
        </div>
      </div>

      {game.lineNote ? (
        <p className="mt-3 flex items-center gap-1.5 border-t border-white/5 pt-3 text-[11px] text-zinc-500">
          <TrendingUp className="size-3 shrink-0 text-accent/80" aria-hidden />
          {game.lineNote}
        </p>
      ) : null}
    </article>
  );
}

function OddsTable({ events, sport }: { events: ParlayEvent[]; sport: OddsSport }) {
  // Extract unique sportsbooks
  const sportsbooks = Array.from(
    new Map(
      events
        .flatMap((e) => e.bookmakers)
        .map((b) => [b.key, b.title])
    ).entries()
  );

  function formatCommenceTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      timeZone: "America/New_York",
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function formatOdds(price: number | null | undefined): string {
    if (price === null || price === undefined) return "—";
    if (Math.abs(price) > 10 || price < 0) {
      return price > 0 ? `+${price}` : String(price);
    } else {
      return price.toFixed(2);
    }
  }

  function getOddsForBookmakerAndGame(
    event: ParlayEvent,
    bookmakerId: string
  ): { h2h: [string, string] | null; spreads: [string, string] | null; totals: [string, string] | null } {
    const bookmaker = event.bookmakers.find((b) => b.key === bookmakerId);
    if (!bookmaker) return { h2h: null, spreads: null, totals: null };

    const h2hMarket = bookmaker.markets.find((m) => m.key === "h2h");
    const spreadsMarket = bookmaker.markets.find((m) => m.key === "spreads");
    const totalsMarket = bookmaker.markets.find((m) => m.key === "totals");

    return {
      h2h: h2hMarket
        ? [
            `${formatOdds(h2hMarket.outcomes[0]?.price)}`,
            `${formatOdds(h2hMarket.outcomes[1]?.price)}`,
          ]
        : null,
      spreads: spreadsMarket
        ? [
            `${formatOdds(spreadsMarket.outcomes[0]?.price)} ${spreadsMarket.outcomes[0]?.point ? `(${spreadsMarket.outcomes[0].point})` : ""}`,
            `${formatOdds(spreadsMarket.outcomes[1]?.price)} ${spreadsMarket.outcomes[1]?.point ? `(${spreadsMarket.outcomes[1].point})` : ""}`,
          ]
        : null,
      totals: totalsMarket
        ? [
            `O ${formatOdds(totalsMarket.outcomes[0]?.price)} (${totalsMarket.outcomes[0]?.point})`,
            `U ${formatOdds(totalsMarket.outcomes[1]?.price)} (${totalsMarket.outcomes[1]?.point})`,
          ]
        : null,
    };
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-white/10 bg-white/3">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/5">
            <th className="sticky left-0 w-48 border-r border-white/10 bg-white/8 px-4 py-3 text-left font-semibold text-white">
              Game
            </th>
            {sportsbooks.map(([key, title]) => (
              <th key={key} className="min-w-36 border-r border-white/10 px-3 py-3 text-center font-semibold text-accent">
                {title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id} className="border-b border-white/10 hover:bg-white/5">
              <td className="sticky left-0 w-48 border-r border-white/10 bg-white/3 px-4 py-4">
                <div className="space-y-1">
                  <div className="text-xs text-zinc-400">{formatCommenceTime(event.commence_time)}</div>
                  <div className="font-semibold text-white">
                    {event.away_team.substring(0, 3).toUpperCase()}
                  </div>
                  <div className="font-semibold text-white">
                    {event.home_team.substring(0, 3).toUpperCase()}
                  </div>
                </div>
              </td>
              {sportsbooks.map(([bookmakerId]) => {
                const odds = getOddsForBookmakerAndGame(event, bookmakerId);
                return (
                  <td key={bookmakerId} className="min-w-36 border-r border-white/10 px-3 py-4 text-center text-xs">
                    <div className="space-y-2">
                      {odds.h2h && (
                        <div>
                          <div className="text-zinc-400">ML</div>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-white">{odds.h2h[0]}</span>
                            <span className="font-semibold text-white">{odds.h2h[1]}</span>
                          </div>
                        </div>
                      )}
                      {odds.spreads && (
                        <div>
                          <div className="text-zinc-400">Spread</div>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-white">{odds.spreads[0]}</span>
                            <span className="font-semibold text-white">{odds.spreads[1]}</span>
                          </div>
                        </div>
                      )}
                      {odds.totals && (
                        <div>
                          <div className="text-zinc-400">Total</div>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-white">{odds.totals[0]}</span>
                            <span className="font-semibold text-white">{odds.totals[1]}</span>
                          </div>
                        </div>
                      )}
                      {!odds.h2h && !odds.spreads && !odds.totals && (
                        <div className="text-zinc-500">—</div>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function OddsContent({ sport, onSportChange }: OddsContentProps) {
  const [apiEvents, setApiEvents] = useState<ParlayEvent[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setApiEvents(null);

    const fetchOdds = async () => {
      let data;
      if (sport === "MLB") {
        data = await fetchMlbOdds();
      } else if (sport === "NFL") {
        data = await fetchNflOdds();
      }

      if (data?.events) {
        setApiEvents(data.events);
      }
      setIsLoading(false);
    };

    fetchOdds();
  }, [sport]);

  const games = useMemo(() => {
    if (apiEvents && apiEvents.length > 0) {
      return null;
    }
    return ODDS_GAMES.filter((g) => g.sport === sport);
  }, [sport, apiEvents]);

  const sportLogo = oddsSportLogo(sport);

  return (
    <div className="relative z-10 flex flex-1 flex-col">
      <OddsSportSubNav sport={sport} onSportChange={onSportChange} />

      <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-6 sm:px-6 md:pb-32 md:pt-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3.5 py-1.5 text-[13px] text-zinc-300">
            {sportLogo ? (
              <span className="flex size-5 items-center justify-center overflow-hidden">
                <BrandImage
                  src={sportLogo}
                  alt=""
                  width={20}
                  height={20}
                  className="h-4 w-4 object-contain"
                />
              </span>
            ) : (
              <Activity className="size-3.5 text-accent" strokeWidth={1.75} />
            )}
            Live market lines · {sport}
          </div>
          <h1 className="typo-hero-title mt-6 text-white">Odds Board</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-subtle md:text-xl">
            Compare spreads, moneylines, and totals across major leagues. Sample lines below mirror
            what members track in the dashboard.
          </p>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-[13px] text-zinc-500">
          <TrendingUp className="size-3.5 text-accent" />
          <span>
            Showing{" "}
            <span className="font-medium text-zinc-300">
              {apiEvents?.length ?? games?.length ?? 0}
            </span>{" "}
            games · <span className="font-medium text-zinc-300">{sport}</span>
          </span>
        </div>

        <div className="mt-6" role="tabpanel">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-sm text-zinc-400">Loading odds...</div>
            </div>
          ) : apiEvents && apiEvents.length > 0 ? (
            <OddsTable events={apiEvents} sport={sport} />
          ) : games && games.length > 0 ? (
            <div className="space-y-4">
              {games.map((game) => (
                <OddsGameRow key={game.id} game={game} />
              ))}
            </div>
          ) : (
            <div className="flex justify-center py-8">
              <div className="text-sm text-zinc-400">No games available</div>
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-xs leading-relaxed text-zinc-600">
          Odds shown are sample lines for display purposes. Always verify lines with your sportsbook
          before placing wagers.
        </p>

        <div className="mx-auto mt-12 flex max-w-md flex-col items-center gap-4 text-center">
          <p className="text-sm text-zinc-400">
            Want model-backed picks with confidence scores on these matchups?
          </p>
          <PricingAccentButton href="/#pricing" fullWidth={false} className="typo-button-md">
            View pick plans
          </PricingAccentButton>
          <Link href="/#pricing" className="text-sm text-zinc-500 transition hover:text-zinc-300">
            Or create a free account →
          </Link>
        </div>
      </div>
    </div>
  );
}
