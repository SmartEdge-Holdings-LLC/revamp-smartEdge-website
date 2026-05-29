import Image from "next/image";
import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Pricing", href: "/#pricing" },
  { label: "Free Picks", href: "/free-picks" },
  { label: "Odds", href: "/odds" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Experts", href: "/#meet-experts" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact Us", href: "/contact-us" },
  { label: "Register", href: "/#pricing" },
  { label: "Log in", href: "/login" },
] as const;

const linkClassName =
  "text-sm text-zinc-400 transition-colors hover:text-white";

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="relative z-10 border-t border-white/10 bg-black">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,18rem)_1fr] lg:items-start lg:gap-16">
          <div className="max-w-sm">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.webp"
                alt="SmartEdgePicks"
                width={160}
                height={40}
                className="h-9 w-auto object-contain object-left"
              />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-zinc-500">
              AI-driven sports picks backed by professional handicappers. Analysis and information only — not a
              sportsbook.
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4 lg:justify-items-end"
          >
            {FOOTER_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={linkClassName}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center md:mt-14">
          <p className="mx-auto max-w-3xl text-xs leading-relaxed text-zinc-500 sm:text-[13px] sm:leading-relaxed">
            SmartEdge<sup className="text-[0.55em]">®</sup> provides sports analysis and information only — we do
            not accept wagers or operate as a sportsbook. All picks are for informational purposes. Must be 21+ to
            participate. If you or someone you know has a gambling problem, call{" "}
            <a
              href="tel:1-800-426-2537"
              className="font-medium text-zinc-300 underline decoration-white/20 underline-offset-2 transition-colors hover:text-white"
            >
              1-800-GAMBLER
            </a>{" "}
            or visit{" "}
            <Link
              href="https://www.ncpgambling.org"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-300 underline decoration-white/20 underline-offset-2 transition-colors hover:text-white"
            >
              ncpgambling.org
            </Link>
            .
          </p>

          <p className="mt-6 text-xs leading-relaxed text-zinc-600">
            © {year} SmartEdge Holdings LLC · SmartEdge Picks · All Rights Reserved · SmartEdge
            <sup className="text-[0.55em]">®</sup> is a trademark of SmartEdge Holdings LLC · Made in USA
          </p>
        </div>
      </div>
    </footer>
  );
}
