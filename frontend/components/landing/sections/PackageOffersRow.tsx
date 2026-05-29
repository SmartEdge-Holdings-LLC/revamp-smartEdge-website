import { PricingPlansPanel } from "@/components/landing/PricingSection";
import type { PublicPickSource } from "@/lib/api/picksApi";

function pricingPlanViewForSource(source: PublicPickSource) {
  return source === "smartedge" ? "vip" : "handicappers";
}

type PackageOffersRowProps = {
  pickSource: PublicPickSource;
};

export function PackageOffersRow({ pickSource }: PackageOffersRowProps) {
  const planView = pricingPlanViewForSource(pickSource);

  return (
    <div className="mt-14 border-t border-white/10 pt-10">
      <h3 className="text-center text-lg font-bold uppercase tracking-wide text-white sm:text-xl">
        Other picks / packages
      </h3>
      <p className="mt-2 text-center text-sm text-zinc-500">
        {pickSource === "smartedge"
          ? "SmartEdge® VIP membership plans"
          : "Featured handicapper packages"}
      </p>
      <PricingPlansPanel
        key={planView}
        className="mt-8"
        tabLayoutId="free-picks-pricing-tab"
        planView={planView}
        showTabs={false}
      />
    </div>
  );
}
