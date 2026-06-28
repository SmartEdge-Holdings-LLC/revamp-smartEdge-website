import type { PublicPick, PublicPickSource } from "@/lib/api/picksApi";
import { getPickLeagueLogo } from "@/lib/sports-leagues";
import type { League } from "@/types/picks";

export type { PublicPickSource };

export type SportHighlight = {
  label: string;
  image: string;
};

/** Leagues shown with logos under the free-picks intro (SmartEdge® tab). */
export const SMARTEDGE_SPORT_HIGHLIGHTS: SportHighlight[] = [
  { label: "NBA", image: getPickLeagueLogo("NBA") },
  { label: "NFL", image: getPickLeagueLogo("NFL") },
  { label: "MLB", image: getPickLeagueLogo("MLB") },
  { label: "NHL", image: getPickLeagueLogo("NHL") },
  { label: "NCAAF", image: getPickLeagueLogo("NCAAF") },
  { label: "NCAAM", image: getPickLeagueLogo("NCAAM") },
  { label: "WNBA", image: getPickLeagueLogo("WNBA") },
  { label: "PGA", image: getPickLeagueLogo("PGA TOUR") },
  { label: "MLS", image: getPickLeagueLogo("SOCCER") },
  { label: "UFC", image: getPickLeagueLogo("MMA") },
];

/** Leagues shown with logos under the free-picks intro (Handicappers tab). */
export const HANDICAPPER_SPORT_HIGHLIGHTS: SportHighlight[] = [
  { label: "NFL", image: getPickLeagueLogo("NFL") },
  { label: "NBA", image: getPickLeagueLogo("NBA") },
  { label: "MLB", image: getPickLeagueLogo("MLB") },
  { label: "NHL", image: getPickLeagueLogo("NHL") },
  { label: "UFC", image: getPickLeagueLogo("MMA") },
  { label: "PGA", image: getPickLeagueLogo("PGA TOUR") },
  { label: "Soccer", image: getPickLeagueLogo("SOCCER") },
];

export const SOURCE_TABS: { value: PublicPickSource; label: string }[] = [
  { value: "smartedge", label: "SmartEdge® free picks" },
  { value: "handicapper", label: "Handicappers free picks" },
];

export type IntroBlock = {
  paragraphs: string[];
  sections: { heading: string; body: string }[];
  sportHighlights: SportHighlight[];
};

export const INTRO_COPY: Record<PublicPickSource, IntroBlock> = {
  smartedge: {
    paragraphs: [
      "SmartEdge® publishes free sports picks so you can sample our AI-backed analysis before upgrading. Every free play includes the matchup, recommended wager, odds, and a clear situational breakdown — the same structure members receive on paid cards.",
      "Use these plays to follow how our models and verification team think about lines, not as a substitute for your own bankroll rules. Free picks rotate as slates go live; paid members get the full board, alerts, and confidence scores on every play.",
    ],
    sections: [
      {
        heading: "Free Sports Picks — Best Bets Today",
        body: "",
      },
     
    ],
    sportHighlights: SMARTEDGE_SPORT_HIGHLIGHTS,
  },
  handicapper: {
    paragraphs: [
      "Featured handicappers on SmartEdge® release free plays so you can evaluate their style before subscribing to a specialist package. Each card shows the expert, league, event, play, and written angle — just like our premium handicapper feed.",
      "Handicapper free picks are independent of the core SmartEdge® AI board. Follow the expert whose sport and bet types match how you wager.",
    ],
    sections: [
      {
        heading: "Handicapper Free Picks — Best Bets Today",
        body: "Today’s featured free play comes from a verified specialist on the platform. Full analysis, recommended side, and posted time are included on every card.",
      },
      {
        heading: "Specialists by Sport",
        body: "We assign dedicated experts to NFL, NBA, MLB, combat sports, and more so you are not relying on one generalist for every market.",
      },
    ],
    sportHighlights: HANDICAPPER_SPORT_HIGHLIGHTS,
  },
};

export const TRACK_RECORD_LINE: Record<PublicPickSource, string> = {
  smartedge: "",
  handicapper:
    "Handicapper free plays include published records where available. Past performance is shown for transparency — past results do not guarantee future outcomes.",
};

/** Shown when the API returns no rows for the active tab. */
export const DEMO_PICKS: Record<PublicPickSource, PublicPick[]> = {
  smartedge: [
    {
      _id: "demo-smartedge-1",
      league: "MLB",
      awayTeamId: "new-york-yankees",
      homeTeamId: "baltimore-orioles",
      awayTeamName: "Yankees",
      homeTeamName: "Orioles",
      awayTeamLogo: "/leagues/mlb/New%20York%20Yankees.png",
      homeTeamLogo: "/leagues/mlb/Baltimore%20Orioles.png",
      game: "Yankees @ Orioles",
      pickTitle: "Yankees -1.5",
      detailedAnalysis:
        "New York opens with their ace in a spot where Baltimore has struggled against right-handed pitching over the last two weeks. The Orioles bullpen has been used heavily in this homestand, and our model flags a run-line edge after line movement favored the visitor.\n\nExpert Analysis: Yankees starter profiles with strong xERA lately; Orioles rank bottom-third in wRC+ vs RHP. Market opened -1.5 (+120) and was steamed toward the favorite.",
      odds: "-135",
      betType: "spread",
      confidence: 74,
      access: "free",
      status: "active",
      createdBy: { name: "SmartEdge AI Desk", role: "admin" },
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  handicapper: [
    {
      _id: "demo-handicapper-1",
      league: "NFL",
      awayTeamId: "buffalo-bills",
      homeTeamId: "kansas-city-chief",
      awayTeamName: "Bills",
      homeTeamName: "Chiefs",
      awayTeamLogo: "/leagues/nfl/Buffalo%20Bills.png",
      homeTeamLogo: "/leagues/nfl/Kansas%20City%20Chief.png",
      game: "Bills @ Chiefs",
      pickTitle: "Chiefs -2.5",
      detailedAnalysis:
        "Kansas City at home in a playoff-form split spot where they have covered as favorites of three or fewer. Buffalo’s road red-zone rate has dipped, and pressure rate trends favor the Chiefs’ front.\n\nExpert Analysis: line opened -3 and was bought back to -2.5 with sharp money on KC. Weather clear — no total distortion expected.",
      odds: "-108",
      betType: "spread",
      confidence: 72,
      access: "free",
      status: "active",
      createdBy: { name: "Marcus Cole", role: "handicapper" },
      createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

const LEAGUE_LABELS: Partial<Record<League, string>> = {
  NBA: "NATIONAL BASKETBALL ASSOCIATION",
  NFL: "NATIONAL FOOTBALL LEAGUE",
  MLB: "MAJOR LEAGUE BASEBALL",
  NHL: "NATIONAL HOCKEY LEAGUE",
  WNBA: "WNBA",
  NCAAF: "NCAA FOOTBALL",
  NCAAM: "NCAA BASKETBALL",
  SOCCER: "SOCCER",
  MMA: "UFC / MMA",
  "PGA TOUR": "PGA TOUR",
};

export function leagueDisplayName(league: League): string {
  return LEAGUE_LABELS[league] ?? league;
}

/** Update hrefs with your live channel URLs */
export type FreePicksSocialPlatform = "youtube" | "instagram" | "tiktok";

export const FREE_PICKS_SOCIAL_LINKS: {
  platform: FreePicksSocialPlatform;
  label: string;
  href: string;
  blurb: string;
}[] = [
  {
    platform: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com",
    blurb: "Full card breakdowns",
  },
  {
    platform: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com",
    blurb: "Daily picks & clips",
  },
  {
    platform: "tiktok",
    label: "TikTok",
    href: "https://www.tiktok.com",
    blurb: "Quick takes",
  },
];
