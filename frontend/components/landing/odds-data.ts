import { getSportsLeagueLogo } from "@/lib/sports-leagues";

export type OddsSport = "NFL" | "NBA" | "MLB" | "NHL";

export interface OddsTeam {
  name: string;
  abbr: string;
  logo: string;
  record?: string;
}

export interface OddsGame {
  id: string;
  sport: OddsSport;
  startTime: string;
  venue?: string;
  away: OddsTeam;
  home: OddsTeam;
  spread: { away: string; home: string };
  moneyline: { away: string; home: string };
  total: { line: string; over: string; under: string };
  /** e.g. "KC -2.5 opened -3" */
  lineNote?: string;
}

export const ODDS_SPORTS: OddsSport[] = ["NBA", "MLB", "NHL", "NFL"];

function nflLogo(file: string) {
  return `/leagues/nfl/${encodeURIComponent(file)}`;
}

function nbaLogo(file: string) {
  return `/leagues/nba/${encodeURIComponent(file)}`;
}

function mlbLogo(file: string) {
  return `/leagues/mlb/${encodeURIComponent(file)}`;
}

function nhlLogo(file: string) {
  return `/leagues/nhl/${encodeURIComponent(file)}`;
}

export function oddsSportLogo(sport: OddsSport): string | undefined {
  return getSportsLeagueLogo(sport);
}

export const ODDS_GAMES: OddsGame[] = [
  // NFL
  {
    id: "nfl-1",
    sport: "NFL",
    startTime: "Sun 1:00 PM ET",
    venue: "Arrowhead Stadium",
    away: {
      name: "Buffalo Bills",
      abbr: "BUF",
      logo: nflLogo("Buffalo Bills.png"),
      record: "11-5",
    },
    home: {
      name: "Kansas City Chiefs",
      abbr: "KC",
      logo: nflLogo("Kansas City Chief.png"),
      record: "12-4",
    },
    spread: { away: "+2.5 (-110)", home: "-2.5 (-110)" },
    moneyline: { away: "+124", home: "-148" },
    total: { line: "47.5", over: "O 47.5 (-110)", under: "U 47.5 (-110)" },
    lineNote: "Opened KC -3",
  },
  {
    id: "nfl-2",
    sport: "NFL",
    startTime: "Sun 4:25 PM ET",
    venue: "AT&T Stadium",
    away: {
      name: "Philadelphia Eagles",
      abbr: "PHI",
      logo: nflLogo("Philadelphia Eagl.png"),
      record: "10-6",
    },
    home: {
      name: "Dallas Cowboys",
      abbr: "DAL",
      logo: nflLogo("Dallas Cowboys.png"),
      record: "9-7",
    },
    spread: { away: "-3.5 (-108)", home: "+3.5 (-112)" },
    moneyline: { away: "-175", home: "+145" },
    total: { line: "44.0", over: "O 44 (-108)", under: "U 44 (-112)" },
    lineNote: "Total down from 44.5",
  },
  {
    id: "nfl-3",
    sport: "NFL",
    startTime: "Sun 8:20 PM ET",
    venue: "Ford Field",
    away: {
      name: "Green Bay Packers",
      abbr: "GB",
      logo: nflLogo("Green Bay Packers.png"),
      record: "10-6",
    },
    home: {
      name: "Detroit Lions",
      abbr: "DET",
      logo: nflLogo("Detroit Lions.png"),
      record: "12-4",
    },
    spread: { away: "+6.5 (-110)", home: "-6.5 (-110)" },
    moneyline: { away: "+245", home: "-305" },
    total: { line: "51.5", over: "O 51.5 (-105)", under: "U 51.5 (-115)" },
  },
  // NBA
  {
    id: "nba-1",
    sport: "NBA",
    startTime: "Tonight 7:30 PM ET",
    venue: "Madison Square Garden",
    away: {
      name: "Boston Celtics",
      abbr: "BOS",
      logo: nbaLogo("boston-celtics.png"),
      record: "32-14",
    },
    home: {
      name: "New York Knicks",
      abbr: "NYK",
      logo: nbaLogo("New York Knicks.png"),
      record: "28-18",
    },
    spread: { away: "-4.5 (-110)", home: "+4.5 (-110)" },
    moneyline: { away: "-192", home: "+158" },
    total: { line: "218.5", over: "O 218.5 (-110)", under: "U 218.5 (-110)" },
    lineNote: "BOS -3.5 opener",
  },
  {
    id: "nba-2",
    sport: "NBA",
    startTime: "Tonight 10:00 PM ET",
    venue: "Ball Arena",
    away: {
      name: "Los Angeles Lakers",
      abbr: "LAL",
      logo: nbaLogo("Los Angeles Laker.png"),
      record: "24-22",
    },
    home: {
      name: "Denver Nuggets",
      abbr: "DEN",
      logo: nbaLogo("Denver Nuggets.png"),
      record: "30-16",
    },
    spread: { away: "+6.5 (-110)", home: "-6.5 (-110)" },
    moneyline: { away: "+210", home: "-260" },
    total: { line: "224.0", over: "O 224 (-105)", under: "U 224 (-115)" },
  },
  {
    id: "nba-3",
    sport: "NBA",
    startTime: "Tonight 8:00 PM ET",
    venue: "Chase Center",
    away: {
      name: "Golden State Warriors",
      abbr: "GSW",
      logo: nbaLogo("Golden State Warr.png"),
      record: "22-24",
    },
    home: {
      name: "Phoenix Suns",
      abbr: "PHX",
      logo: nbaLogo("Phoenix Suns.png"),
      record: "26-20",
    },
    spread: { away: "+2.5 (-108)", home: "-2.5 (-112)" },
    moneyline: { away: "+118", home: "-142" },
    total: { line: "229.5", over: "O 229.5 (-110)", under: "U 229.5 (-110)" },
  },
  // MLB
  {
    id: "mlb-1",
    sport: "MLB",
    startTime: "Today 7:10 PM ET",
    venue: "Oriole Park",
    away: {
      name: "New York Yankees",
      abbr: "NYY",
      logo: mlbLogo("New York Yankees.png"),
      record: "0-0",
    },
    home: {
      name: "Baltimore Orioles",
      abbr: "BAL",
      logo: mlbLogo("Baltimore Orioles.png"),
      record: "0-0",
    },
    spread: { away: "-1.5 (+135)", home: "+1.5 (-155)" },
    moneyline: { away: "-142", home: "+118" },
    total: { line: "8.5", over: "O 8.5 (-115)", under: "U 8.5 (-105)" },
    lineNote: "Gerrit Cole listed probable",
  },
  {
    id: "mlb-2",
    sport: "MLB",
    startTime: "Today 9:40 PM ET",
    venue: "Petco Park",
    away: {
      name: "Los Angeles Dodgers",
      abbr: "LAD",
      logo: mlbLogo("Los Angeles Dodge.png"),
      record: "0-0",
    },
    home: {
      name: "San Diego Padres",
      abbr: "SD",
      logo: mlbLogo("San Diego Padres.png"),
      record: "0-0",
    },
    spread: { away: "+1.5 (-165)", home: "-1.5 (+140)" },
    moneyline: { away: "+108", home: "-128" },
    total: { line: "7.0", over: "O 7 (-110)", under: "U 7 (-110)" },
  },
  {
    id: "mlb-3",
    sport: "MLB",
    startTime: "Today 7:40 PM ET",
    venue: "Truist Park",
    away: {
      name: "Atlanta Braves",
      abbr: "ATL",
      logo: mlbLogo("Atlanta Braves.png"),
      record: "0-0",
    },
    home: {
      name: "Philadelphia Phillies",
      abbr: "PHI",
      logo: mlbLogo("Philadelphia Phil.png"),
      record: "0-0",
    },
    spread: { away: "-1.5 (+120)", home: "+1.5 (-140)" },
    moneyline: { away: "-158", home: "+132" },
    total: { line: "8.0", over: "O 8 (-108)", under: "U 8 (-112)" },
  },
  // NHL
  {
    id: "nhl-1",
    sport: "NHL",
    startTime: "Tonight 7:00 PM ET",
    venue: "TD Garden",
    away: {
      name: "Toronto Maple Leafs",
      abbr: "TOR",
      logo: nhlLogo("Toronto Maple Lea.png"),
      record: "28-15-4",
    },
    home: {
      name: "Boston Bruins",
      abbr: "BOS",
      logo: nhlLogo("Boston Bruins.png"),
      record: "26-17-5",
    },
    spread: { away: "+1.5 (-180)", home: "-1.5 (+150)" },
    moneyline: { away: "+165", home: "-195" },
    total: { line: "6.0", over: "O 6 (-108)", under: "U 6 (-112)" },
    lineNote: "BOS PP 24.1% last 10",
  },
  {
    id: "nhl-2",
    sport: "NHL",
    startTime: "Tonight 10:00 PM ET",
    venue: "Rogers Place",
    away: {
      name: "Vegas Golden Knights",
      abbr: "VGK",
      logo: nhlLogo("Vegas Golden Knig.png"),
      record: "27-14-6",
    },
    home: {
      name: "Edmonton Oilers",
      abbr: "EDM",
      logo: nhlLogo("Edmonton Oilers.png"),
      record: "29-13-5",
    },
    spread: { away: "-1.5 (+135)", home: "+1.5 (-155)" },
    moneyline: { away: "-135", home: "+112" },
    total: { line: "6.5", over: "O 6.5 (-110)", under: "U 6.5 (-110)" },
  },
  {
    id: "nhl-3",
    sport: "NHL",
    startTime: "Tonight 7:30 PM ET",
    venue: "PPG Paints Arena",
    away: {
      name: "New York Rangers",
      abbr: "NYR",
      logo: nhlLogo("New York Rangers.png"),
      record: "27-16-4",
    },
    home: {
      name: "Pittsburgh Penguins",
      abbr: "PIT",
      logo: nhlLogo("Pittsburgh Pengu.png"),
      record: "22-19-6",
    },
    spread: { away: "-1.5 (+125)", home: "+1.5 (-145)" },
    moneyline: { away: "-148", home: "+124" },
    total: { line: "6.0", over: "O 6 (-105)", under: "U 6 (-115)" },
  },
];
