import type { IUser } from "../models/User";
import { isMemberOnboardingComplete } from "./onboarding";
import { normalizeBrandSubscriptions } from "./userBrandSubscriptions";
import { getMemberEntitlements } from "../services/subscriptionEntitlementsService";

function snapshotToClient(
  snap: IUser["brandSubscriptions"]["smartedge"]
): IUser["brandSubscriptions"]["smartedge"] {
  if (!snap) return [];

  // Handle both single snapshot and array of snapshots
  if (Array.isArray(snap)) {
    return snap.map((s) => {
      // Convert Mongoose subdocument to plain object
      const plainObj = s instanceof Object && "_doc" in s ? (s as any)._doc || s : s;
      return {
        stripeSubscriptionId: plainObj.stripeSubscriptionId,
        planName: plainObj.planName,
        priceId: plainObj.priceId,
        subscriptionStatus: plainObj.subscriptionStatus,
        currentPeriodEnd: plainObj.currentPeriodEnd ?? null,
        cancelAtPeriodEnd: plainObj.cancelAtPeriodEnd,
      };
    });
  }

  // Fallback for single snapshot (shouldn't happen with current schema)
  const plainObj = snap instanceof Object && "_doc" in snap ? (snap as any)._doc || snap : snap;
  return [
    {
      stripeSubscriptionId: plainObj.stripeSubscriptionId,
      planName: plainObj.planName,
      priceId: plainObj.priceId,
      subscriptionStatus: plainObj.subscriptionStatus,
      currentPeriodEnd: plainObj.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: plainObj.cancelAtPeriodEnd,
    },
  ];
}

function brandSubscriptionsToClient(bs: IUser["brandSubscriptions"]) {
  const normalized = normalizeBrandSubscriptions(bs);
  return {
    smartedge: snapshotToClient(normalized.smartedge) || [],
    jonah: snapshotToClient(normalized.jonah) || [],
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
