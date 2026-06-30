import type { UserBrandSubscriptions } from "@/types/brand-subscriptions";
import type { MemberEntitlements } from "@/types/entitlements";
import { isMemberOnboardingComplete } from "@/lib/profile-fields";

/** Public member profile returned by the backend and stored in NextAuth session/JWT. */
export interface BackendMemberUser {
  _id: string;
  email: string;
  name: string;
  image?: string | null;
  stripeCustomerId?: string | null;
  city?: string | null;
  country?: string | null;
  address?: string | null;
  state?: string | null;
  zip?: string | null;
  discordUsername?: string | null;
  phoneNumber?: string | null;
  wpRole?: "subscriber" | "administrator" | null;
  brandSubscriptions?: UserBrandSubscriptions;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  onboarding?: boolean;
  entitlements?: MemberEntitlements;
}

/** Shape exposed on `GET /api/auth/session` → `session.user`. */
export interface SessionMemberUser {
  id: string;
  _id: string;
  name: string;
  email: string;
  image?: string | null;
  backendToken: string;
  stripeCustomerId?: string | null;
  city?: string | null;
  country?: string | null;
  address?: string | null;
  state?: string | null;
  zip?: string | null;
  discordUsername?: string | null;
  phoneNumber?: string | null;
  wpRole?: "subscriber" | "administrator" | null;
  brandSubscriptions: UserBrandSubscriptions;
  createdAt?: string;
  updatedAt?: string;
  onboarding: boolean;
  entitlements?: MemberEntitlements;
}

function toIso(value: string | Date | null | undefined): string | null {
  if (value == null) return null;
  if (typeof value === "string") return value;
  return value.toISOString();
}

function normalizeBrandSubscriptionsForSession(
  raw?: UserBrandSubscriptions | null
): UserBrandSubscriptions {
  const mapDates = (
    snaps: UserBrandSubscriptions["smartedge"]
  ): UserBrandSubscriptions["smartedge"] => {
    if (!snaps) return null;
    if (!Array.isArray(snaps)) return null;
    return snaps.map(snap => ({
      ...snap,
      currentPeriodEnd: toIso(snap.currentPeriodEnd as string | Date | null | undefined),
    }));
  };
  return {
    smartedge: mapDates(raw?.smartedge ?? null),
    jonah: mapDates(raw?.jonah ?? null),
  };
}

export function mapBackendMemberToSessionUser(
  user: BackendMemberUser,
  backendToken: string
): SessionMemberUser {
  const id = String(user._id);
  return {
    id,
    _id: id,
    name: user.name,
    email: user.email,
    image: user.image ?? null,
    backendToken,
    stripeCustomerId: user.stripeCustomerId ?? null,
    city: user.city ?? null,
    country: user.country ?? null,
    address: user.address ?? null,
    state: user.state ?? null,
    zip: user.zip ?? null,
    discordUsername: user.discordUsername ?? null,
    phoneNumber: user.phoneNumber ?? null,
    wpRole: user.wpRole ?? null,
    brandSubscriptions: normalizeBrandSubscriptionsForSession(user.brandSubscriptions),
    createdAt: toIso(user.createdAt) ?? undefined,
    updatedAt: toIso(user.updatedAt) ?? undefined,
    entitlements: user.entitlements,
    onboarding:
      typeof user.onboarding === "boolean"
        ? user.onboarding
        : isMemberOnboardingComplete({
            city: user.city ?? null,
            country: user.country ?? null,
            address: user.address ?? null,
            state: user.state ?? null,
            zip: user.zip ?? null,
            discordUsername: user.discordUsername ?? null,
            phoneNumber: user.phoneNumber ?? null,
          }),
  };
}
