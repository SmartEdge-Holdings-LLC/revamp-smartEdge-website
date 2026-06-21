export const SPORTSBOOKS_LOGOS: Record<string, string> = {
  fanduel: "/sportsbooks/fanduel.png",
  "lowvig.ag": "/sportsbooks/lowvig.png",
  fanatics: "/sportsbooks/fanatics.png",
  "mybookie.ag": "/sportsbooks/mybookie.png",
  draftkings: "/sportsbooks/draftkings.png",
  caesars: "/sportsbooks/caesars.png",
  "betus.com": "/sportsbooks/betus.png",
  betmgm: "/sportsbooks/betmgm.png",
  bovada: "/sportsbooks/bovada.png",
};

export function getSportsbookLogo(bookmakerKey: string): string | null {
  return SPORTSBOOKS_LOGOS[bookmakerKey] || null;
}
