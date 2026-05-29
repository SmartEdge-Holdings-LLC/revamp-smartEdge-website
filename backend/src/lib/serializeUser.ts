import type { IUser } from "../models/User";
import { isMemberOnboardingComplete } from "./onboarding";
import { normalizeBrandSubscriptions } from "./userBrandSubscriptions";
import { getMemberEntitlements } from "../services/subscriptionEntitlementsService";

function snapshotToClient(
  snap: IUser["brandSubscriptions"]["smartedge"]
): IUser["brandSubscriptions"]["smartedge"] {
  if (!snap) return null;
  return {
    ...snap,
    currentPeriodEnd: snap.currentPeriodEnd ?? null,
  };
}

function brandSubscriptionsToClient(bs: IUser["brandSubscriptions"]) {
  const normalized = normalizeBrandSubscriptions(bs);
  return {
    smartedge: snapshotToClient(normalized.smartedge),
    jonah: snapshotToClient(normalized.jonah),
  };
}

/** Member fields safe for API responses (never includes `password`). */
export async function serializeMemberForClient(user: IUser) {
  const entitlements = await getMemberEntitlements(user._id.toString());
  return {
    _id: user._id.toString(),
    email: user.email,
    name: user.name,
    image: user.image ?? null,
    stripeCustomerId: user.stripeCustomerId ?? null,
    city: user.city ?? null,
    country: user.country ?? null,
    address: user.address ?? null,
    state: user.state ?? null,
    zip: user.zip ?? null,
    discordUsername: user.discordUsername ?? null,
    phoneNumber: user.phoneNumber ?? null,
    wpRole: user.wpRole ?? null,
    brandSubscriptions: brandSubscriptionsToClient(user.brandSubscriptions),
    entitlements,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    onboarding: isMemberOnboardingComplete(user),
  };
}
