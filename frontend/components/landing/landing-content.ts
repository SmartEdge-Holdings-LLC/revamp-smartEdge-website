export const LANDING_STATS = [
  { value: "3,000+", label: "Active Members" },
  { value: "15+", label: "Sports Covered" },
  { value: "3+ Years", label: "of Documented Positions" },
  { value: "Expert Handicappers", label: "Multiple professional handicappers" },
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
    name: "Jake Sullivan",
    detail: "VIP member · 14 months",
    avatar: "/avatars/google-1.jpg",
  },
  {
    quote:
      "Line movement alerts paid for my subscription in the first month. SmartEdge catches moves I used to miss.",
    name: "Ryan Mitchell",
    detail: "Standard member · NBA focus",
    avatar: "/avatars/google-2.jpg",
  },
  {
    quote:
      "Having NFL and MLB specialists instead of one generic capper is the difference. Real depth on every play.",
    name: "Danny Kowalski",
    detail: "Weekly member · multi-sport",
    avatar: "/avatars/google-3.jpg",
  },
  {
    quote:
      "I used to spend hours researching lines. Now I check SmartEdge in the morning and my card is set by noon. Best investment I've made.",
    name: "Brett Anderson",
    detail: "VIP member · NFL & NBA",
    avatar: "/avatars/google-4.jpg",
  },
  {
    quote:
      "The detailed analysis behind every pick is what sets this apart. It's not just a pick — it's an education in sports betting.",
    name: "Kevin O'Brien",
    detail: "Standard member · 8 months",
    avatar: "/avatars/google-5.jpg",
  },
  {
    quote:
      "Went from losing months to consistent profit. The MLB plays especially have been unreal — hit 11 of my last 14 following SmartEdge.",
    name: "Matt Henderson",
    detail: "VIP member · MLB focus",
    avatar: "/avatars/google-6.jpg",
  },
] as const;

export const WHY_TRUST_CARDS = [
  {
    icon: "experience" as const,
    title: "20+ Years of Combined Experience",
    body: "Our handicapping team has decades of experience across major sports leagues, with proven track records in NFL, NBA, and MLB betting markets.",
  },
  {
    icon: "ai" as const,
    title: "AI-Powered Analysis",
    body: "SmartEdge® combines proprietary machine learning models with expert human insight to deliver picks that outperform the market consistently.",
  },
  {
    icon: "chart" as const,
    title: "Transparent Track Record",
    body: "Every pick is logged, verified, and tracked. No hidden losses, no cherry-picked results — just honest, auditable performance data.",
  },
  {
    icon: "users" as const,
    title: "Trusted by Thousands",
    body: "Join a growing community of serious bettors who rely on SmartEdge® for data-driven picks and real-time line movement alerts.",
  },
] as const;
