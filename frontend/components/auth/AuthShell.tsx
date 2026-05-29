import { BackgroundPattern } from "@/components/landing/BackgroundPattern";
import { LandingBackdrop } from "@/components/landing/LandingBackdrop";
import { Navbar } from "@/components/landing/Navbar";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-black text-slate-100">
      <div className="relative min-h-screen overflow-hidden">
        <LandingBackdrop />
        <BackgroundPattern />
        <div className="relative z-10 flex min-h-screen flex-col">
        
          <div className="flex flex-1 flex-col items-center justify-center px-5 pb-16 pt-6 sm:px-6 md:pb-20 md:pt-10">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
