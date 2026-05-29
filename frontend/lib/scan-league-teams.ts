import fs from "fs";
import path from "path";
import { getAllCollegeTeams, isCollegeFootballLeague } from "@/lib/college-football";
import { LEAGUE_TEAM_META } from "@/lib/league-team-meta";
import type { League, LeagueTeam } from "@/types/picks";

const IMAGE_EXT = /\.(png|jpe?g|svg|webp)$/i;

function slugToLabel(slug: string): { name: string; shortName: string } {
  const words = slug.split(/[\s-]+/).filter(Boolean);
  const shortName = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return { name: shortName, shortName };
}

function teamFromFile(leagueSlug: string, file: string): LeagueTeam {
  const id = file.replace(/\.[^.]+$/, "").toLowerCase();
  const meta = LEAGUE_TEAM_META[id] ?? slugToLabel(id);
  return {
    id,
    name: meta.name,
    shortName: meta.shortName,
    logo: `/leagues/${leagueSlug}/${encodeURIComponent(file)}`,
  };
}

function leagueAssetsSlug(league: League): string {
  if (isCollegeFootballLeague(league)) return "ncaaf";
  return league.toLowerCase();
}

/** Scan `public/leagues/{league}/` for team logo files (server-only). */
export function scanLeagueTeamsFromPublic(league: League): LeagueTeam[] {
  if (isCollegeFootballLeague(league)) {
    return getAllCollegeTeams();
  }

  const leagueSlug = leagueAssetsSlug(league);
  const leagueDir = path.join(process.cwd(), "public", "leagues", leagueSlug);

  if (!fs.existsSync(leagueDir)) {
    return [];
  }

  const byId = new Map<string, LeagueTeam>();
  const topEntries = fs.readdirSync(leagueDir, { withFileTypes: true });
  const hasConferenceDirs = topEntries.some((e) => e.isDirectory());

  if (hasConferenceDirs) {
    for (const conf of topEntries) {
      if (!conf.isDirectory()) continue;
      const confDir = path.join(leagueDir, conf.name);
      for (const file of fs.readdirSync(confDir).filter((f) => IMAGE_EXT.test(f))) {
        const id = file.replace(/\.[^.]+$/, "").toLowerCase();
        const meta = LEAGUE_TEAM_META[id] ?? slugToLabel(id);
        if (!byId.has(id)) {
          byId.set(id, {
            id,
            name: meta.name,
            shortName: meta.shortName,
            logo: `/leagues/${leagueSlug}/${conf.name}/${encodeURIComponent(file)}`,
          });
        }
      }
    }
  } else {
    const files = topEntries
      .filter((e) => e.isFile() && IMAGE_EXT.test(e.name))
      .map((e) => e.name)
      .sort((a, b) => a.localeCompare(b));
    for (const file of files) {
      const team = teamFromFile(leagueSlug, file);
      if (!byId.has(team.id)) byId.set(team.id, team);
    }
  }

  return Array.from(byId.values()).sort((a, b) => a.shortName.localeCompare(b.shortName));
}

/** Resolve logo URL from `public/leagues/{league}/` by team id (server-only). */
function findLogoInTree(
  leagueSlug: string,
  dir: string,
  id: string,
  pathPrefix: string
): string | null {
  if (!fs.existsSync(dir)) return null;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const nested = findLogoInTree(
        leagueSlug,
        path.join(dir, entry.name),
        id,
        `${pathPrefix}/${entry.name}`
      );
      if (nested) return nested;
      continue;
    }
    if (!IMAGE_EXT.test(entry.name)) continue;
    const stem = entry.name.replace(/\.[^.]+$/, "").toLowerCase();
    if (stem === id) {
      return `/leagues/${leagueSlug}${pathPrefix}/${encodeURIComponent(entry.name)}`;
    }
  }
  return null;
}

export function resolveTeamLogoFromPublic(league: League, teamId: string): string | null {
  const id = teamId.trim().toLowerCase();
  const leagueSlug = leagueAssetsSlug(league);
  const leagueDir = path.join(process.cwd(), "public", "leagues", leagueSlug);
  return findLogoInTree(leagueSlug, leagueDir, id, "");
}
