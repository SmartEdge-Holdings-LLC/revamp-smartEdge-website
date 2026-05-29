import { env } from "../config/env";

const PARLAY_API_BASE = "https://parlay-api.com/v1";
const PARLAY_SANDBOX_BASE = "https://parlay-api.com/v1/sandbox";
export const NFL_SPORT_KEY = "americanfootball_nfl";

export type ParlaySport = {
  key: string;
  group: string;
  title: string;
  description: string;
  active: boolean;
  has_outrights: boolean;
};

export type ParlayOutcome = {
  name: string;
  price: number;
  point?: number;
};

export type ParlayMarket = {
  key: string;
  outcomes: ParlayOutcome[];
};

export type ParlayBookmaker = {
  key: string;
  title: string;
  markets: ParlayMarket[];
};

export type ParlayEventOdds = {
  id: string;
  sport_key: string;
  sport_title?: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: ParlayBookmaker[];
};

type ParlayFetchMeta = {
  sandbox: boolean;
  creditsRemaining?: string;
  creditsUsed?: string;
};

export class ParlayApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public body?: unknown
  ) {
    super(message);
    this.name = "ParlayApiError";
  }
}

function useSandbox(): boolean {
  return !env.parlayApiKey && env.nodeEnv === "development";
}

async function parlayGet<T>(
  path: string,
  query: Record<string, string> = {}
): Promise<{ data: T; meta: ParlayFetchMeta }> {
  const sandbox = useSandbox();
  const base = sandbox ? PARLAY_SANDBOX_BASE : PARLAY_API_BASE;
  const url = new URL(`${base}${path}`);

  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }

  if (!sandbox && env.parlayApiKey) {
    url.searchParams.set("apiKey", env.parlayApiKey);
  }

  const res = await fetch(url.toString(), {
    headers: env.parlayApiKey ? { "X-API-Key": env.parlayApiKey } : undefined,
  });

  const creditsRemaining = res.headers.get("x-requests-remaining") ?? undefined;
  const creditsUsed = res.headers.get("x-requests-used") ?? undefined;

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof (body as { message: unknown }).message === "string"
        ? (body as { message: string }).message
        : `Parlay API error (${res.status})`;
    throw new ParlayApiError(message, res.status, body);
  }

  return {
    data: body as T,
    meta: { sandbox, creditsRemaining, creditsUsed },
  };
}

export async function listParlaySports(): Promise<{
  sports: ParlaySport[];
  meta: ParlayFetchMeta;
}> {
  const path = useSandbox() ? "/sports" : "/sports";
  const { data, meta } = await parlayGet<ParlaySport[]>(path);
  return { sports: Array.isArray(data) ? data : [], meta };
}

export async function fetchNflOdds(options?: {
  regions?: string;
  markets?: string;
  bookmakers?: string;
}): Promise<{
  events: ParlayEventOdds[];
  meta: ParlayFetchMeta;
}> {
  if (!env.parlayApiKey && !useSandbox()) {
    throw new ParlayApiError(
      "PARLAY_API_KEY is not set. Add your key to .env or run in development to use sandbox data.",
      503
    );
  }

  const regions = options?.regions ?? "us";
  const markets = options?.markets ?? "h2h,spreads,totals";

  const query: Record<string, string> = {
    regions,
    markets,
    oddsFormat: "american",
  };
  if (options?.bookmakers) {
    query.bookmakers = options.bookmakers;
  }

  const path = `/sports/${NFL_SPORT_KEY}/odds`;
  const { data, meta } = await parlayGet<ParlayEventOdds[]>(path, query);

  return {
    events: Array.isArray(data) ? data : [],
    meta,
  };
}

export async function fetchNflEvents(): Promise<{
  events: Array<{
    id: string;
    sport_key: string;
    commence_time: string;
    home_team: string;
    away_team: string;
  }>;
  meta: ParlayFetchMeta;
}> {
  if (!env.parlayApiKey && !useSandbox()) {
    throw new ParlayApiError(
      "PARLAY_API_KEY is not set. Add your key to .env or run in development to use sandbox data.",
      503
    );
  }

  const path = `/sports/${NFL_SPORT_KEY}/events`;
  const { data, meta } = await parlayGet<
    Array<{
      id: string;
      sport_key: string;
      commence_time: string;
      home_team: string;
      away_team: string;
    }>
  >(path);

  return {
    events: Array.isArray(data) ? data : [],
    meta,
  };
}
