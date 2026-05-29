import fs from "fs";
import path from "path";
import type { League } from "../models/Pick";

export type LeagueTeamDto = {
  id: string;
  name: string;
  shortName: string;
  logo: string;
};

/** Display names keyed by logo filename stem (e.g. `lakers.png` → `lakers`). */
const NBA_TEAM_META: Record<string, { name: string; shortName: string }> = {
  hawks: { name: "Atlanta Hawks", shortName: "Hawks" },
  "atlanta-hawks": { name: "Atlanta Hawks", shortName: "Hawks" },
  celtics: { name: "Boston Celtics", shortName: "Celtics" },
  "boston-celtics": { name: "Boston Celtics", shortName: "Celtics" },
  nets: { name: "Brooklyn Nets", shortName: "Nets" },
  "brooklyn-nets": { name: "Brooklyn Nets", shortName: "Nets" },
  hornets: { name: "Charlotte Hornets", shortName: "Hornets" },
  "charlotte-hornets": { name: "Charlotte Hornets", shortName: "Hornets" },
  bulls: { name: "Chicago Bulls", shortName: "Bulls" },
  "chicago-bulls": { name: "Chicago Bulls", shortName: "Bulls" },
  cavaliers: { name: "Cleveland Cavaliers", shortName: "Cavaliers" },
  "cleveland-cavaliers": { name: "Cleveland Cavaliers", shortName: "Cavaliers" },
  mavericks: { name: "Dallas Mavericks", shortName: "Mavericks" },
  "dallas-mavericks": { name: "Dallas Mavericks", shortName: "Mavericks" },
  nuggets: { name: "Denver Nuggets", shortName: "Nuggets" },
  "denver-nuggets": { name: "Denver Nuggets", shortName: "Nuggets" },
  pistons: { name: "Detroit Pistons", shortName: "Pistons" },
  "detroit-pistons": { name: "Detroit Pistons", shortName: "Pistons" },
  warriors: { name: "Golden State Warriors", shortName: "Warriors" },
  "golden-state-warriors": { name: "Golden State Warriors", shortName: "Warriors" },
  rockets: { name: "Houston Rockets", shortName: "Rockets" },
  "houston-rockets": { name: "Houston Rockets", shortName: "Rockets" },
  pacers: { name: "Indiana Pacers", shortName: "Pacers" },
  "indiana-pacers": { name: "Indiana Pacers", shortName: "Pacers" },
  clippers: { name: "LA Clippers", shortName: "Clippers" },
  "la-clippers": { name: "LA Clippers", shortName: "Clippers" },
  lakers: { name: "Los Angeles Lakers", shortName: "Lakers" },
  "los-angeles-lakers": { name: "Los Angeles Lakers", shortName: "Lakers" },
  grizzlies: { name: "Memphis Grizzlies", shortName: "Grizzlies" },
  "memphis-grizzlies": { name: "Memphis Grizzlies", shortName: "Grizzlies" },
  heat: { name: "Miami Heat", shortName: "Heat" },
  "miami-heat": { name: "Miami Heat", shortName: "Heat" },
  bucks: { name: "Milwaukee Bucks", shortName: "Bucks" },
  "milwaukee-bucks": { name: "Milwaukee Bucks", shortName: "Bucks" },
  timberwolves: { name: "Minnesota Timberwolves", shortName: "Timberwolves" },
  "minnesota-timberwolves": { name: "Minnesota Timberwolves", shortName: "Timberwolves" },
  pelicans: { name: "New Orleans Pelicans", shortName: "Pelicans" },
  "new-orleans-pelicans": { name: "New Orleans Pelicans", shortName: "Pelicans" },
  knicks: { name: "New York Knicks", shortName: "Knicks" },
  "new-york-knicks": { name: "New York Knicks", shortName: "Knicks" },
  thunder: { name: "Oklahoma City Thunder", shortName: "Thunder" },
  "oklahoma-city-thunder": { name: "Oklahoma City Thunder", shortName: "Thunder" },
  magic: { name: "Orlando Magic", shortName: "Magic" },
  "orlando-magic": { name: "Orlando Magic", shortName: "Magic" },
  "76ers": { name: "Philadelphia 76ers", shortName: "76ers" },
  sixers: { name: "Philadelphia 76ers", shortName: "76ers" },
  "philadelphia-76ers": { name: "Philadelphia 76ers", shortName: "76ers" },
  suns: { name: "Phoenix Suns", shortName: "Suns" },
  "phoenix-suns": { name: "Phoenix Suns", shortName: "Suns" },
  "trail-blazers": { name: "Portland Trail Blazers", shortName: "Trail Blazers" },
  blazers: { name: "Portland Trail Blazers", shortName: "Trail Blazers" },
  "portland-trail-blazers": { name: "Portland Trail Blazers", shortName: "Trail Blazers" },
  kings: { name: "Sacramento Kings", shortName: "Kings" },
  "sacramento-kings": { name: "Sacramento Kings", shortName: "Kings" },
  spurs: { name: "San Antonio Spurs", shortName: "Spurs" },
  "san-antonio-spurs": { name: "San Antonio Spurs", shortName: "Spurs" },
  raptors: { name: "Toronto Raptors", shortName: "Raptors" },
  "toronto-raptors": { name: "Toronto Raptors", shortName: "Raptors" },
  jazz: { name: "Utah Jazz", shortName: "Jazz" },
  "utah-jazz": { name: "Utah Jazz", shortName: "Jazz" },
  wizards: { name: "Washington Wizards", shortName: "Wizards" },
  "washington-wizards": { name: "Washington Wizards", shortName: "Wizards" },
  atlanta: { name: "Atlanta Hawks", shortName: "Hawks" },
  "chicago bulls": { name: "Chicago Bulls", shortName: "Bulls" },
  "cleveland cavalie": { name: "Cleveland Cavaliers", shortName: "Cavaliers" },
  "dallas mavericks": { name: "Dallas Mavericks", shortName: "Mavericks" },
  "denver nuggets": { name: "Denver Nuggets", shortName: "Nuggets" },
  "detroit pistons": { name: "Detroit Pistons", shortName: "Pistons" },
  "golden state warr": { name: "Golden State Warriors", shortName: "Warriors" },
  "houston rockets": { name: "Houston Rockets", shortName: "Rockets" },
  "indiana pacers": { name: "Indiana Pacers", shortName: "Pacers" },
  "los angeles clipp": { name: "LA Clippers", shortName: "Clippers" },
  "los angeles laker": { name: "Los Angeles Lakers", shortName: "Lakers" },
  "memphis grizzlies": { name: "Memphis Grizzlies", shortName: "Grizzlies" },
  "miami heat": { name: "Miami Heat", shortName: "Heat" },
  "milwaukee bucks": { name: "Milwaukee Bucks", shortName: "Bucks" },
  "minnesota timberw": { name: "Minnesota Timberwolves", shortName: "Timberwolves" },
  "new orleans pelic": { name: "New Orleans Pelicans", shortName: "Pelicans" },
  "new york knicks": { name: "New York Knicks", shortName: "Knicks" },
  "oklahoma city thu": { name: "Oklahoma City Thunder", shortName: "Thunder" },
  "orlando magic": { name: "Orlando Magic", shortName: "Magic" },
  "philadelphia 76er": { name: "Philadelphia 76ers", shortName: "76ers" },
  "phoenix suns": { name: "Phoenix Suns", shortName: "Suns" },
  "portland trail bl": { name: "Portland Trail Blazers", shortName: "Trail Blazers" },
  "sacramento kings": { name: "Sacramento Kings", shortName: "Kings" },
  "san antonio spurs": { name: "San Antonio Spurs", shortName: "Spurs" },
  "toronto raptors": { name: "Toronto Raptors", shortName: "Raptors" },
  "utah jazz": { name: "Utah Jazz", shortName: "Jazz" },
  "washington wizard": { name: "Washington Wizards", shortName: "Wizards" },
};

const NBA_FALLBACK_IDS = [
  "hawks",
  "celtics",
  "nets",
  "hornets",
  "bulls",
  "cavaliers",
  "mavericks",
  "nuggets",
  "pistons",
  "warriors",
  "rockets",
  "pacers",
  "clippers",
  "lakers",
  "grizzlies",
  "heat",
  "bucks",
  "timberwolves",
  "pelicans",
  "knicks",
  "thunder",
  "magic",
  "76ers",
  "suns",
  "trail-blazers",
  "kings",
  "spurs",
  "raptors",
  "jazz",
  "wizards",
] as const;

function slugToLabel(slug: string): { name: string; shortName: string } {
  const words = slug.split(/[\s-]+/).filter(Boolean);
  const shortName = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return { name: shortName, shortName };
}

const LOGO_EXTENSIONS = ["png", "svg", "webp", "jpg", "jpeg"] as const;

function resolveFrontendPublicDir(): string | null {
  const candidates = [
    path.resolve(process.cwd(), "public"),
    path.resolve(process.cwd(), "../frontend/public"),
    path.resolve(process.cwd(), "frontend/public"),
    path.resolve(__dirname, "../../../frontend/public"),
    path.resolve(__dirname, "../../../../frontend/public"),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(dir)) return dir;
  }
  return null;
}

function leagueAssetsSlug(league: League): string {
  if (league === "COLLEGE" || league === "NCAAF") return "ncaaf";
  return league.toLowerCase();
}

function findLogoInDir(
  leagueSlug: string,
  dir: string,
  id: string,
  pathPrefix: string
): string | null {
  if (!fs.existsSync(dir)) return null;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const nested = findLogoInDir(
        leagueSlug,
        path.join(dir, entry.name),
        id,
        `${pathPrefix}/${entry.name}`
      );
      if (nested) return nested;
      continue;
    }
    if (!/\.(png|jpe?g|svg|webp)$/i.test(entry.name)) continue;
    const stem = entry.name.replace(/\.[^.]+$/, "").toLowerCase();
    if (stem === id) {
      return `/leagues/${leagueSlug}${pathPrefix}/${encodeURIComponent(entry.name)}`;
    }
  }

  for (const ext of LOGO_EXTENSIONS) {
    const file = `${id}.${ext}`;
    if (fs.existsSync(path.join(dir, file))) {
      return `/leagues/${leagueSlug}${pathPrefix}/${encodeURIComponent(file)}`;
    }
  }

  return null;
}

/** Resolve `/leagues/{league}/{filename}` from team id (matches filename stem, case-insensitive). */
export function resolveTeamLogoPath(league: League, teamId: string, preferredExt = "png"): string {
  const id = teamId.trim().toLowerCase();
  const leagueSlug = leagueAssetsSlug(league);
  const publicDir = resolveFrontendPublicDir();
  if (publicDir) {
    const leagueDir = path.join(publicDir, "leagues", leagueSlug);
    const found = findLogoInDir(leagueSlug, leagueDir, id, "");
    if (found) return found;
  }
  return `/leagues/${leagueSlug}/${encodeURIComponent(teamId)}.${preferredExt}`;
}

/** Fill missing team names/logos from `public/leagues/{league}/` assets. */
export function hydratePickMatchup<T extends {
  league: League;
  awayTeamId?: string | null;
  homeTeamId?: string | null;
  awayTeamName?: string | null;
  homeTeamName?: string | null;
  awayTeamLogo?: string | null;
  homeTeamLogo?: string | null;
}>(pick: T): T {
  const hydrated = { ...pick };

  if (hydrated.awayTeamId) {
    const away = findLeagueTeam(hydrated.league, hydrated.awayTeamId);
    if (away) {
      if (!hydrated.awayTeamLogo) hydrated.awayTeamLogo = away.logo;
      if (!hydrated.awayTeamName) hydrated.awayTeamName = away.shortName;
    } else if (!hydrated.awayTeamLogo) {
      hydrated.awayTeamLogo = resolveTeamLogoPath(hydrated.league, hydrated.awayTeamId);
    }
  }

  if (hydrated.homeTeamId) {
    const home = findLeagueTeam(hydrated.league, hydrated.homeTeamId);
    if (home) {
      if (!hydrated.homeTeamLogo) hydrated.homeTeamLogo = home.logo;
      if (!hydrated.homeTeamName) hydrated.homeTeamName = home.shortName;
    } else if (!hydrated.homeTeamLogo) {
      hydrated.homeTeamLogo = resolveTeamLogoPath(hydrated.league, hydrated.homeTeamId);
    }
  }

  return hydrated;
}

const MLB_TEAM_META: Record<string, { name: string; shortName: string }> = {
  "arizona diamondba": { name: "Arizona Diamondbacks", shortName: "Diamondbacks" },
  athletics: { name: "Oakland Athletics", shortName: "Athletics" },
  "atlanta braves": { name: "Atlanta Braves", shortName: "Braves" },
  "baltimore orioles": { name: "Baltimore Orioles", shortName: "Orioles" },
  "boston red sox": { name: "Boston Red Sox", shortName: "Red Sox" },
  "chicago cubs": { name: "Chicago Cubs", shortName: "Cubs" },
  "chicago white sox": { name: "Chicago White Sox", shortName: "White Sox" },
  "cincinnati reds": { name: "Cincinnati Reds", shortName: "Reds" },
  "cleveland guardia": { name: "Cleveland Guardians", shortName: "Guardians" },
  "colorado rockies": { name: "Colorado Rockies", shortName: "Rockies" },
  "detroit tigers": { name: "Detroit Tigers", shortName: "Tigers" },
  "houston astros": { name: "Houston Astros", shortName: "Astros" },
  "kansas city royal": { name: "Kansas City Royals", shortName: "Royals" },
  "los angeles angel": { name: "Los Angeles Angels", shortName: "Angels" },
  "los angeles dodge": { name: "Los Angeles Dodgers", shortName: "Dodgers" },
  "miami marlins": { name: "Miami Marlins", shortName: "Marlins" },
  "milwaukee brewers": { name: "Milwaukee Brewers", shortName: "Brewers" },
  "minnesota twins": { name: "Minnesota Twins", shortName: "Twins" },
  "new york mets": { name: "New York Mets", shortName: "Mets" },
  "new york yankees": { name: "New York Yankees", shortName: "Yankees" },
  "philadelphia phil": { name: "Philadelphia Phillies", shortName: "Phillies" },
  "pittsburgh pirate": { name: "Pittsburgh Pirates", shortName: "Pirates" },
  "san diego padres": { name: "San Diego Padres", shortName: "Padres" },
  "san francisco gia": { name: "San Francisco Giants", shortName: "Giants" },
  "seattle mariners": { name: "Seattle Mariners", shortName: "Mariners" },
  "st. louis cardina": { name: "St. Louis Cardinals", shortName: "Cardinals" },
  "tampa bay rays": { name: "Tampa Bay Rays", shortName: "Rays" },
  "texas rangers": { name: "Texas Rangers", shortName: "Rangers" },
  "toronto blue jays": { name: "Toronto Blue Jays", shortName: "Blue Jays" },
  "washington nation": { name: "Washington Nationals", shortName: "Nationals" },
};

const NHL_TEAM_META: Record<string, { name: string; shortName: string }> = {
  "anaheim ducks": { name: "Anaheim Ducks", shortName: "Ducks" },
  "boston bruins": { name: "Boston Bruins", shortName: "Bruins" },
  "buffalo sabres": { name: "Buffalo Sabres", shortName: "Sabres" },
  "calgary flames": { name: "Calgary Flames", shortName: "Flames" },
  "carolina hurrican": { name: "Carolina Hurricanes", shortName: "Hurricanes" },
  "chicago blackhawk": { name: "Chicago Blackhawks", shortName: "Blackhawks" },
  "colorado avalanch": { name: "Colorado Avalanche", shortName: "Avalanche" },
  "columbus blue jac": { name: "Columbus Blue Jackets", shortName: "Blue Jackets" },
  "dallas stars": { name: "Dallas Stars", shortName: "Stars" },
  "detroit red wings": { name: "Detroit Red Wings", shortName: "Red Wings" },
  "edmonton oilers": { name: "Edmonton Oilers", shortName: "Oilers" },
  "florida panthers": { name: "Florida Panthers", shortName: "Panthers" },
  "los angeles kings": { name: "Los Angeles Kings", shortName: "Kings" },
  "minnesota wild": { name: "Minnesota Wild", shortName: "Wild" },
  "montreal canadien": { name: "Montreal Canadiens", shortName: "Canadiens" },
  "nashville predato": { name: "Nashville Predators", shortName: "Predators" },
  "new jersey devils": { name: "New Jersey Devils", shortName: "Devils" },
  "new york islander": { name: "New York Islanders", shortName: "Islanders" },
  "new york rangers": { name: "New York Rangers", shortName: "Rangers" },
  "ottawa senators": { name: "Ottawa Senators", shortName: "Senators" },
  "philadelphia flye": { name: "Philadelphia Flyers", shortName: "Flyers" },
  "pittsburgh pengu": { name: "Pittsburgh Penguins", shortName: "Penguins" },
  "san jose sharks": { name: "San Jose Sharks", shortName: "Sharks" },
  "seattle kraken": { name: "Seattle Kraken", shortName: "Kraken" },
  "st. louis blues": { name: "St. Louis Blues", shortName: "Blues" },
  "tampa bay lightni": { name: "Tampa Bay Lightning", shortName: "Lightning" },
  "toronto maple lea": { name: "Toronto Maple Leafs", shortName: "Maple Leafs" },
  "utah mammoth": { name: "Utah Mammoth", shortName: "Mammoth" },
  "vancouver canucks": { name: "Vancouver Canucks", shortName: "Canucks" },
  "vegas golden knig": { name: "Vegas Golden Knights", shortName: "Golden Knights" },
  "washington capita": { name: "Washington Capitals", shortName: "Capitals" },
  "winnipeg jets": { name: "Winnipeg Jets", shortName: "Jets" },
};

const NFL_TEAM_META: Record<string, { name: string; shortName: string }> = {
  "arizona cardinals": { name: "Arizona Cardinals", shortName: "Cardinals" },
  "atlanta falcons": { name: "Atlanta Falcons", shortName: "Falcons" },
  "baltimore ravens": { name: "Baltimore Ravens", shortName: "Ravens" },
  "buffalo bills": { name: "Buffalo Bills", shortName: "Bills" },
  "carolina panthers": { name: "Carolina Panthers", shortName: "Panthers" },
  "chicago bears": { name: "Chicago Bears", shortName: "Bears" },
  "cincinnati bengal": { name: "Cincinnati Bengals", shortName: "Bengals" },
  "cleveland browns": { name: "Cleveland Browns", shortName: "Browns" },
  "dallas cowboys": { name: "Dallas Cowboys", shortName: "Cowboys" },
  "denver broncos": { name: "Denver Broncos", shortName: "Broncos" },
  "detroit lions": { name: "Detroit Lions", shortName: "Lions" },
  "green bay packers": { name: "Green Bay Packers", shortName: "Packers" },
  "houston texans": { name: "Houston Texans", shortName: "Texans" },
  "indianapolis colt": { name: "Indianapolis Colts", shortName: "Colts" },
  "jacksonville jagu": { name: "Jacksonville Jaguars", shortName: "Jaguars" },
  "kansas city chief": { name: "Kansas City Chiefs", shortName: "Chiefs" },
  "las vegas raiders": { name: "Las Vegas Raiders", shortName: "Raiders" },
  "los angeles charg": { name: "Los Angeles Chargers", shortName: "Chargers" },
  "los angeles rams": { name: "Los Angeles Rams", shortName: "Rams" },
  "miami dolphins": { name: "Miami Dolphins", shortName: "Dolphins" },
  "minnesota vikings": { name: "Minnesota Vikings", shortName: "Vikings" },
  "new england patri": { name: "New England Patriots", shortName: "Patriots" },
  "new orleans saint": { name: "New Orleans Saints", shortName: "Saints" },
  "new york giants": { name: "New York Giants", shortName: "Giants" },
  "new york jets": { name: "New York Jets", shortName: "Jets" },
  "philadelphia eagl": { name: "Philadelphia Eagles", shortName: "Eagles" },
  "pittsburgh steele": { name: "Pittsburgh Steelers", shortName: "Steelers" },
  "san francisco 49e": { name: "San Francisco 49ers", shortName: "49ers" },
  "seattle seahawks": { name: "Seattle Seahawks", shortName: "Seahawks" },
  "tampa bay buccane": { name: "Tampa Bay Buccaneers", shortName: "Buccaneers" },
  "tennessee titans": { name: "Tennessee Titans", shortName: "Titans" },
  "washington comman": { name: "Washington Commanders", shortName: "Commanders" },
};

const WNBA_TEAM_META: Record<string, { name: string; shortName: string }> = {
  "atlanta dream": { name: "Atlanta Dream", shortName: "Dream" },
  "chicago sky": { name: "Chicago Sky", shortName: "Sky" },
  "connecticut sun": { name: "Connecticut Sun", shortName: "Sun" },
  "dallas wings": { name: "Dallas Wings", shortName: "Wings" },
  "golden state va": { name: "Golden State Valkyries", shortName: "Valkyries" },
  "indiana fever": { name: "Indiana Fever", shortName: "Fever" },
  "las vegas aces": { name: "Las Vegas Aces", shortName: "Aces" },
  "los angeles spa": { name: "Los Angeles Sparks", shortName: "Sparks" },
  "minnesota lynx": { name: "Minnesota Lynx", shortName: "Lynx" },
  "new york libert": { name: "New York Liberty", shortName: "Liberty" },
  "phoenix mercury": { name: "Phoenix Mercury", shortName: "Mercury" },
  "portland fire": { name: "Portland Fire", shortName: "Fire" },
  "seattle storm": { name: "Seattle Storm", shortName: "Storm" },
  "toronto tempo": { name: "Toronto Tempo", shortName: "Tempo" },
  "washington myst": { name: "Washington Mystics", shortName: "Mystics" },
};

const LEAGUE_TEAM_META: Record<string, { name: string; shortName: string }> = {
  ...NBA_TEAM_META,
  ...MLB_TEAM_META,
  ...NHL_TEAM_META,
  ...NFL_TEAM_META,
  ...WNBA_TEAM_META,
};

function teamFromFile(league: League, file: string, _publicDir: string): LeagueTeamDto {
  const id = file.replace(/\.[^.]+$/, "").toLowerCase();
  const meta = LEAGUE_TEAM_META[id] ?? slugToLabel(id);
  const leagueSlug = league.toLowerCase();
  return {
    id,
    name: meta.name,
    shortName: meta.shortName,
    logo: `/leagues/${leagueSlug}/${encodeURIComponent(file)}`,
  };
}

function scanLeagueTeamsFromDisk(league: League): LeagueTeamDto[] {
  const publicDir = resolveFrontendPublicDir();
  if (!publicDir) return [];

  const leagueSlug = leagueAssetsSlug(league);
  const leagueDir = path.join(publicDir, "leagues", leagueSlug);
  if (!fs.existsSync(leagueDir)) return [];

  const byId = new Map<string, LeagueTeamDto>();

  const scanDir = (dir: string, conferencePath: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        scanDir(path.join(dir, entry.name), `${conferencePath}/${entry.name}`);
        continue;
      }
      if (!/\.(png|jpe?g|svg|webp)$/i.test(entry.name)) continue;
      const id = entry.name.replace(/\.[^.]+$/, "").toLowerCase();
      const meta = LEAGUE_TEAM_META[id] ?? slugToLabel(id);
      const logo = `/leagues/${leagueSlug}${conferencePath}/${encodeURIComponent(entry.name)}`;
      if (!byId.has(id)) {
        byId.set(id, { id, name: meta.name, shortName: meta.shortName, logo });
      }
    }
  };

  const topEntries = fs.readdirSync(leagueDir, { withFileTypes: true });
  const hasConferenceDirs = topEntries.some((e) => e.isDirectory());

  if (hasConferenceDirs) {
    for (const entry of topEntries) {
      if (!entry.isDirectory()) continue;
      scanDir(path.join(leagueDir, entry.name), `/${entry.name}`);
    }
  } else {
    const files = topEntries
      .filter((e) => e.isFile() && /\.(png|jpe?g|svg|webp)$/i.test(e.name))
      .map((e) => e.name)
      .sort((a, b) => a.localeCompare(b));
    for (const file of files) {
      const team = teamFromFile(league, file, publicDir);
      if (!byId.has(team.id)) byId.set(team.id, team);
    }
  }

  return Array.from(byId.values()).sort((a, b) => a.shortName.localeCompare(b.shortName));
}

function nbaFallbackTeams(): LeagueTeamDto[] {
  return NBA_FALLBACK_IDS.map((id) => {
    const meta = NBA_TEAM_META[id] ?? slugToLabel(id);
    return {
      id,
      name: meta.name,
      shortName: meta.shortName,
      logo: resolveTeamLogoPath("NBA", id),
    };
  });
}

/** Teams for a league — prefers logos found under `frontend/public/leagues/{league}/`. */
export function getLeagueTeams(league: League): LeagueTeamDto[] {
  const scanned = scanLeagueTeamsFromDisk(league);
  if (scanned.length > 0) return scanned;
  if (league === "NBA") return nbaFallbackTeams();
  return [];
}

export function findLeagueTeam(league: League, teamId: string): LeagueTeamDto | undefined {
  const id = teamId.trim().toLowerCase();
  return getLeagueTeams(league).find((t) => t.id === id);
}

export function formatMatchupGame(away: LeagueTeamDto, home: LeagueTeamDto): string {
  return `${away.shortName} @ ${home.shortName}`;
}
