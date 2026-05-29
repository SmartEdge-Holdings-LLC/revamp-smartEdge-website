export const ONBOARDING_PROFILE_FIELDS = [
  "city",
  "country",
  "address",
  "state",
  "zip",
  "discordUsername",
  "phoneNumber",
] as const;

export type OnboardingProfileField = (typeof ONBOARDING_PROFILE_FIELDS)[number];

export function isMemberOnboardingComplete(
  user: Partial<Record<OnboardingProfileField, string | null | undefined>>
): boolean {
  return ONBOARDING_PROFILE_FIELDS.every((field) => {
    const value = user[field];
    return value != null && String(value).trim().length > 0;
  });
}
