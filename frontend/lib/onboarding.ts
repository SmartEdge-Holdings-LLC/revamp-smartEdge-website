import { isMemberOnboardingComplete } from "@/lib/profile-fields";
import type { SessionMemberUser } from "@/types/member-session";

export { ONBOARDING_PROFILE_FIELDS, isMemberOnboardingComplete } from "@/lib/profile-fields";

/** `false` = show onboarding card; `true` = profile complete. */
export function resolveMemberOnboarding(user: SessionMemberUser): boolean {
  if (typeof user.onboarding === "boolean") return user.onboarding;
  return isMemberOnboardingComplete(user);
}
