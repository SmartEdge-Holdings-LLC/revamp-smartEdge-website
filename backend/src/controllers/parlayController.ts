import { Request, Response } from "express";
import {
  fetchNflEvents,
  fetchNflOdds,
  listParlaySports,
  NFL_SPORT_KEY,
  ParlayApiError,
  type ParlayEventOdds,
} from "../services/parlayApiService";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatAmericanOdds(price: number): string {
  return price > 0 ? `+${price}` : String(price);
}

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

function renderNflOddsHtml(events: ParlayEventOdds[], meta: { sandbox: boolean }): string {
  const rows = events
    .map((event) => {
      const books = event.bookmakers
        .map((book) => {
          const lines = book.markets
            .map((market) => {
              const outcomes = market.outcomes
                .map((o) => {
                  const point =
                    o.point !== undefined ? ` (${o.point > 0 ? "+" : ""}${o.point})` : "";
                  return `${escapeHtml(o.name)}${point}: ${formatAmericanOdds(o.price)}`;
                })
                .join(" · ");
              return `<div class="market"><span class="market-key">${escapeHtml(market.key)}</span> ${outcomes}</div>`;
            })
            .join("");
          return `<div class="book"><strong>${escapeHtml(book.title)}</strong>${lines}</div>`;
        })
        .join("");

      return `
        <article class="event">
          <h2>${escapeHtml(event.away_team)} @ ${escapeHtml(event.home_team)}</h2>
          <p class="time">${escapeHtml(formatCommenceTime(event.commence_time))} ET</p>
          ${books || '<p class="muted">No bookmaker lines returned.</p>'}
        </article>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>NFL Odds · Parlay API</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 1.5rem; background: #0f1115; color: #e8eaed; }
    h1 { font-size: 1.5rem; margin: 0 0 0.25rem; }
    .meta { color: #9aa0a6; font-size: 0.875rem; margin-bottom: 1.5rem; }
    .meta a { color: #8ab4f8; }
    .event { border: 1px solid #2a2f3a; border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: 1rem; background: #171a21; }
    .event h2 { margin: 0 0 0.35rem; font-size: 1.125rem; }
    .time { margin: 0 0 0.75rem; color: #9aa0a6; font-size: 0.875rem; }
    .book { margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #2a2f3a; font-size: 0.9rem; }
    .book strong { display: block; margin-bottom: 0.35rem; color: #f4b183; }
    .market { margin: 0.25rem 0 0.25rem 0.5rem; color: #c4c7c5; }
    .market-key { text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.04em; color: #9aa0a6; margin-right: 0.35rem; }
    .muted { color: #9aa0a6; }
    .links { margin-bottom: 1rem; font-size: 0.875rem; }
    .links a { color: #8ab4f8; margin-right: 1rem; }
  </style>
</head>
<body>
  <h1>NFL odds</h1>
  <p class="meta">
    Sport key: <code>${NFL_SPORT_KEY}</code>
    · ${events.length} game(s)
    ${meta.sandbox ? " · <strong>Sandbox (sample) data</strong>" : ""}
  </p>
  <p class="links">
    <a href="?format=json">JSON</a>
    <a href="/api/parlay/sports">All sports</a>
    <a href="/api/parlay/nfl/events">NFL events</a>
  </p>
  ${rows || '<p class="muted">No NFL games with odds right now.</p>'}
</body>
</html>`;
}

function handleParlayError(err: unknown, res: Response): void {
  if (err instanceof ParlayApiError) {
    res.status(err.statusCode).json({
      error: err.message,
      details: err.body,
    });
    return;
  }
  const message = err instanceof Error ? err.message : "Parlay API request failed";
  res.status(500).json({ error: message });
}

export async function getParlaySports(_req: Request, res: Response): Promise<void> {
  try {
    const { sports, meta } = await listParlaySports();
    res.json({
      source: "https://parlay-api.com/v1/sports",
      count: sports.length,
      sports,
      meta,
    });
  } catch (err) {
    handleParlayError(err, res);
  }
}

export async function getNflOdds(req: Request, res: Response): Promise<void> {
  try {
    const regions = typeof req.query.regions === "string" ? req.query.regions : undefined;
    const markets = typeof req.query.markets === "string" ? req.query.markets : undefined;
    const bookmakers =
      typeof req.query.bookmakers === "string" ? req.query.bookmakers : undefined;

    const { events, meta } = await fetchNflOdds({ regions, markets, bookmakers });

    const wantsHtml =
      req.query.format === "html" ||
      req.query.view === "html" ||
      req.accepts(["html", "json"]) === "html";

    if (wantsHtml) {
      res.type("html").send(renderNflOddsHtml(events, meta));
      return;
    }

    res.json({
      sportKey: NFL_SPORT_KEY,
      sportTitle: "NFL",
      count: events.length,
      events,
      meta,
      links: {
        html: "/api/parlay/nfl/odds?format=html",
        events: "/api/parlay/nfl/events",
        sports: "/api/parlay/sports",
      },
    });
  } catch (err) {
    handleParlayError(err, res);
  }
}

export async function getNflEvents(_req: Request, res: Response): Promise<void> {
  try {
    const { events, meta } = await fetchNflEvents();
    res.json({
      sportKey: NFL_SPORT_KEY,
      sportTitle: "NFL",
      count: events.length,
      events,
      meta,
    });
  } catch (err) {
    handleParlayError(err, res);
  }
}
