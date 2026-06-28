import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FreePicksSection } from "@/components/landing/sections/FreePicksSection";
import { NewsSection } from "@/components/landing/sections/NewsSection";

export const metadata = {
  title: "Free Picks | SmartEdgePicks Dashboard",
};

export default function DashboardFreePicksPage() {
  return (
    <div className="w-full">
      <DashboardHeader/>
      <NewsSection />
      <FreePicksSection standalone />
    </div>
  );
}
