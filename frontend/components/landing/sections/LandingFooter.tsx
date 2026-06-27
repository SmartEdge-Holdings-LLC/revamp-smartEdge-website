import Image from "next/image";
import Link from "next/link";
import { FREE_PICKS_SOCIAL_LINKS, type FreePicksSocialPlatform } from "@/components/landing/free-picks-content";
import { getSocialPlatformLogo } from "@/lib/social-platform-logos";
import { cn } from "@/lib/utils";

const FOOTER_LINKS = [
  { label: "Pricing", href: "/#pricing" },
  { label: "Free Picks", href: "/free-picks" },
  { label: "Odds", href: "/odds" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Experts", href: "/#meet-experts" },
  { label: "FAQ", href: "/#faq" },
  { label: "Betting Resources", href: "/betting-resources" },
  { label: "Contact Us", href: "/contact-us" },
  { label: "Privacy Policy", href: "/legal/privacy-policy" },
  { label: "Terms of Service", href: "/legal/terms-of-service" },
  { label: "Refund Policy", href: "/legal/refund-policy" },
  { label: "Register", href: "/#pricing" },
  { label: "Log in", href: "/login" },
] as const;

function SocialLinkIcon({ platform }: { platform: FreePicksSocialPlatform }) {
  return (
    <Image
      src={getSocialPlatformLogo(platform)}
      alt=""
      width={24}
      height={24}
      className="size-6 object-contain"
    />
  );
}

const linkClassName =
  "text-sm text-zinc-400 transition-colors hover:text-white";

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="relative z-10 border-t border-white/10 bg-black">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-5 sm:py-14 md:px-6 md:py-16">
        <div className="grid gap-6 sm:gap-10 lg:grid-cols-[minmax(0,18rem)_1fr] lg:items-start lg:gap-16">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-0.5">
              <Image
                src="/logo.webp"
                alt="SmartEdgePicks"
                width={160}
                height={40}
                className="h-8 sm:h-9 w-auto object-contain object-left"
              />
              <span className="text-sm sm:text-base font-bold text-white leading-none -translate-y-1">®</span>
            </Link>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm leading-relaxed text-zinc-500">
              AI-driven sports picks backed by professional handicappers. Analysis and information only — not a
              sportsbook.
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-2 sm:gap-x-6 sm:gap-y-3 sm:grid-cols-4 lg:justify-items-end"
          >
            {FOOTER_LINKS.map((link, idx) => (
              <Link key={`${idx}-${link.href}`} href={link.href} className={linkClassName}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 sm:mt-12 border-t border-white/10 pt-6 sm:pt-8 md:mt-14">
          <div className="text-center mb-8 sm:mb-10">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-300 mb-5">
              Follow Us on Socials
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {FREE_PICKS_SOCIAL_LINKS.map((link) => (
                <a
                  key={link.platform}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "group flex min-w-34 flex-col items-center rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-center transition-colors",
                    "hover:border-accent/35 hover:bg-white/5"
                  )}
                >
                  <span className="flex size-10 items-center justify-center rounded-full bg-white/5 text-zinc-200 ring-1 ring-white/10 transition group-hover:bg-accent/10 group-hover:text-accent">
                    <SocialLinkIcon platform={link.platform} />
                  </span>
                  <span className="mt-2 text-sm font-semibold text-white">{link.label}</span>
                  <span className="mt-0.5 text-[11px] text-zinc-500">{link.blurb}</span>
                </a>
              ))}
            </div>
          </div>

          <p className="mx-auto max-w-3xl text-xs leading-relaxed text-zinc-500 sm:text-[13px] sm:leading-relaxed text-center">
            SmartEdge<sup className="text-[0.9em]">®</sup> provides sports analysis and information only — we do
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

          <p className="mt-4 sm:mt-6 text-[10px] sm:text-xs leading-relaxed text-zinc-600 text-center mx-auto">
            © {year} SmartEdge Holdings LLC · SmartEdge Picks · All Rights Reserved · SmartEdge
            <sup className="text-[0.9em]">®</sup> is a trademark of SmartEdge Holdings LLC · Made in USA
          </p>
        </div>
      </div>
    </footer>
  );
}
