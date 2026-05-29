import type { BackendMemberUser } from "@/types/member-session";

/** Reference-style profile fields (label + hint + input). */
export const profileFieldInputClass =
  "h-10 w-full rounded-md border border-white/20 bg-[#1a1a1a] px-3 text-sm text-white shadow-none placeholder:text-zinc-500 focus:border-white/40 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60";

export const profileFieldLabelClass = "text-sm font-medium text-white";

export const profileFieldHintClass = "text-xs leading-relaxed text-zinc-500";

/** Onboarding dialog — accent focus variant */
export const profileInputClass =
  "rounded-xl border-white/15 bg-white/5 px-4 py-3 typo-body-md text-white shadow-inner shadow-black/20 placeholder:text-subtle placeholder:opacity-90 ring-0 transition-colors focus:border-accent/55 focus:ring-2 focus:ring-accent/25";

export const profileLabelClass =
  "typo-caption font-semibold uppercase tracking-[0.12em] text-subtle";

export type ProfileFormValues = {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phoneNumber: string;
  discordUsername: string;
};

export function profileFormFromUser(user: Pick<
  BackendMemberUser,
  | "name"
  | "address"
  | "city"
  | "state"
  | "zip"
  | "country"
  | "phoneNumber"
  | "discordUsername"
>): ProfileFormValues {
  return {
    name: user.name?.trim() ?? "",
    address: user.address?.trim() ?? "",
    city: user.city?.trim() ?? "",
    state: user.state?.trim() ?? "",
    zip: user.zip?.trim() ?? "",
    country: user.country?.trim() ?? "",
    phoneNumber: user.phoneNumber?.trim() ?? "",
    discordUsername: user.discordUsername?.trim() ?? "",
  };
}
