import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { OddsPageShell } from "@/components/landing/OddsPageShell";
import { NewsSection } from "@/components/landing/sections/NewsSection";

export const metadata = {
  title: "Odds | SmartEdgePicks Dashboard",
};

export default function DashboardOddsPage() {
  return (
    <div className="w-full">
      <DashboardHeader/>
      <NewsSection />
      <OddsPageShell />
    </div>
  );
}
