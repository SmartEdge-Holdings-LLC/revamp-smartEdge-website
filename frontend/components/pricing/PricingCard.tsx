"use client";

import { Plan, PlanName } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/stripe";

interface PricingCardProps {
  plan: Plan;
  annual: boolean;
  currentPlan?: PlanName;
  onCheckout: (productId?: string, plan?: PlanName) => void;
}

export const PricingCard = ({ plan, annual, currentPlan, onCheckout }: PricingCardProps) => {
  const isCurrent = currentPlan === plan.name;
  const price = annual ? plan.annualPrice : plan.monthlyPrice;

  return (
    <Card className="relative flex flex-col gap-4">
      {isCurrent && <Badge className="absolute right-4 top-4">Current Plan</Badge>}
      <h3 className="text-xl font-semibold capitalize">{plan.name}</h3>
      <p className="text-sm text-slate-600">{plan.description}</p>
      <p className="text-3xl font-bold">
        {formatCurrency(price)}
        <span className="text-sm font-normal text-slate-500">/{annual ? "year" : "month"}</span>
      </p>
      <ul className="flex-1 space-y-2 text-sm text-slate-700">
        {plan.features.map((feature) => (
          <li key={feature}>- {feature}</li>
        ))}
      </ul>
      <Button
        disabled={isCurrent}
        onClick={() => onCheckout(plan.productId, plan.name)}
        className={plan.name === "pro" ? "bg-blue-600 hover:bg-blue-500" : ""}
      >
        {plan.name === "free" ? "Get Started" : "Upgrade"}
      </Button>
    </Card>
  );
};
