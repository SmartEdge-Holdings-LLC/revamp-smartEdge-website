import { BackgroundPattern } from "@/components/landing/BackgroundPattern";
import { LandingBackdrop } from "@/components/landing/LandingBackdrop";
import { Navbar } from "@/components/landing/Navbar";
import { LandingFooter } from "@/components/landing/sections";

/** Shared shell for Odds, Free Picks, and similar marketing subpages. */
export function LandingSubpageLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-black/10 text-slate-100">
      <div className="relative min-h-screen overflow-hidden">
      
        <div className="relative z-10 flex min-h-screen flex-col">
          <header className="relative shrink-0">
            <Navbar />
          </header>
          {children}
          <LandingFooter />
        </div>
      </div>
    </main>
  );
}
