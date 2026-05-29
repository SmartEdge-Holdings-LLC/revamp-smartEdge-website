import type { IUser } from "../models/User";

export const ONBOARDING_PROFILE_FIELDS = [
  "city",
  "country",
  "address",
  "state",
  "zip",
  "discordUsername",
  "phoneNumber",
] as const satisfies readonly (keyof IUser)[];

export type OnboardingProfileField = (typeof ONBOARDING_PROFILE_FIELDS)[number];

export function isMemberOnboardingComplete(
  user: Pick<IUser, OnboardingProfileField>
): boolean {
  return ONBOARDING_PROFILE_FIELDS.every((field) => {
    const value = user[field];
    return typeof value === "string" && value.trim().length > 0;
  });
}
