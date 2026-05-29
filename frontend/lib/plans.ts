import type { PlanName } from "@/types";

type LegacyPlanName = Extract<PlanName, "free" | "starter" | "pro" | "enterprise">;

export const PLAN_FEATURES: Record<
  LegacyPlanName,
  { users: number | "unlimited"; projects: number | "unlimited"; features: string[] }
> = {
  free: {
    users: 1,
    projects: 5,
    features: ["Basic support"],
  },
  starter: {
    users: 3,
    projects: 20,
    features: ["Email support"],
  },
  pro: {
    users: 10,
    projects: "unlimited",
    features: ["Priority support"],
  },
  enterprise: {
    users: "unlimited",
    projects: "unlimited",
    features: ["SSO", "Dedicated support", "SLA"],
  },
};
