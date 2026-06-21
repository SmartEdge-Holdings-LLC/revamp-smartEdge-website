export const LANDING_STATS = [
  { value: "3,000+", label: "Active Members" },
  { value: "8+", label: "Sports Covered Daily" },
  { value: "3+", label: "Years of Documented Picks" },
  { value: "Multiple", label: "Expert Handicappers" },
] as const;

export const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: "Expert Handicapper Analysis",
    body: "Our specialists dive deep into lines, injuries, and game trends. Decades of professional experience distilled into every pick.",
  },
  {
    step: 2,
    title: "Verification & Confirmation",
    body: "Every pick gets verified against market movement and data. SmartEdge® confirms the analytical edge — expertise meets data.",
  },
  {
    step: 3,
    title: "Picks Delivered to You",
    body: "Inbox and SMS alerts before game time with play, edge, and confidence scores from pros who've been doing this for years.",
  },
] as const;

export const SPORTS_COVERAGE = [
  {
    name: "NFL",
    tagline: "Point spreads, totals, and player props every week of the season",
    image: "/sports/nfl.png",
  },
  {
    name: "NBA",
    tagline: "Daily picks covering moneylines, spreads, and game totals",
    image: "/sports/nba.png",
  },
  {
    name: "MLB",
    tagline: "Run lines, first-five-inning picks, and series betting insights",
    image: "/sports/mlb.svg",
  },
  {
    name: "NCAA Football",
    tagline: "College spread analysis covering Power 5 and beyond",
    image: "/sports/NCAAF.svg",
  },
  {
    name: "NHL",
    tagline: "Puck line picks with goalie matchup intelligence",
    image: "/sports/nhl.svg",
  },
  {
    name: "PGA",
    tagline: "Tournament winner, top-10, and head-to-head matchup picks",
    image: "/sports/pga-tour.png",
  },
  {
    name: "MLS",
    tagline: "Match winner and both-teams-to-score analysis",
    image: "/sports/SOCCOR.png",
  },
  {
    name: "UFC",
    tagline: "Method of victory and fight outcome picks from our combat sports team",
    image: "/sports/mma.png",
  },
] as const;


export const FEATURED_HANDICAPPERS = [
  {
    name: "Marcus Cole",
    sport: "NFL Specialist",
    years: "12+ years",
    winRate: "64% ATS this season",
    bio: "Marcus has spent over a decade dissecting NFL lines for professional and recreational bettors. His edge comes from situational trends, market timing, and sharp line shopping across books.",
    initials: "MC",
    avatarClass: "bg-emerald-500/20 text-emerald-300",
  },
  {
    name: "Jenna Ortiz",
    sport: "NBA Specialist",
    years: "9+ years",
    winRate: "58% ATS this season",
    bio: "Jenna tracks pace, rest, and injury impact on nightly NBA boards. She pairs SmartEdge® pace models with live injury feeds to catch mispriced totals before the market adjusts.",
    initials: "JO",
    avatarClass: "bg-sky-500/20 text-sky-300",
  },
  {
    name: "Diego Ramos",
    sport: "MLB & UFC",
    years: "11+ years",
    winRate: "61% units YTD",
    bio: "Diego splits time between MLB run lines and UFC fight metrics. His combat picks lean on striking differential and wrestling control data — areas where the public often overreacts.",
    initials: "DR",
    avatarClass: "bg-violet-500/20 text-violet-300",
  },
] as const;

export const LANDING_FAQ = [
  {
    q: "Do you guarantee wins?",
    a: "No. No legitimate service can guarantee wins — sports betting involves inherent risk. What we guarantee is consistent, data-backed analysis delivered daily.",
  },
  {
    q: "How are picks delivered?",
    a: "Picks are sent via SMS. Members also get access to a picks dashboard inside their account.",
  },
  {
    q: "Can I follow a specific handicapper?",
    a: "Yes. If you purchase that handicapper's plan, you can view that handicapper's premium picks inside your member account.",
  },
  {
    q: "When are picks posted?",
    a: "Picks are typically posted by late morning for that day's games. Updates or notes are added if relevant news breaks closer to game time.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Weekly and Monthly plans can be cancelled anytime before the next billing cycle from inside your account dashboard.",
  },
] as const;

export const TESTIMONIALS = [
  {
    quote:
      "The confidence scores alone changed how I size my bets. I'm not guessing anymore — I'm following a process.",
    name: "Chris M.",
    detail: "VIP member · 14 months",
    avatar: "/avatars/google-1.jpg",
  },
  {
    quote:
      "Line movement alerts paid for my subscription in the first month. SmartEdge catches moves I used to miss.",
    name: "Priya S.",
    detail: "Standard member · NBA focus",
    avatar: "/avatars/google-2.jpg",
  },
  {
    quote:
      "Having NFL and MLB specialists instead of one generic capper is the difference. Real depth on every play.",
    name: "Jordan T.",
    detail: "Weekly member · multi-sport",
    avatar: "/avatars/google-3.jpg",
  },
] as const;
