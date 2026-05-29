import mongoose from "mongoose";
import { clearJonahCatalogCache, getJonahCatalog } from "./jonahCatalogCache";
import { JonahSubscriber } from "../models/JonahSubscriber";
import { JonahSyncMeta } from "../models/JonahSyncMeta";
import { User } from "../models/User";

export type JonahSyncResult = {
  products: { id: string; name: string }[];
  priceIds: string[];
  matched: number;
  upserted: number;
  removed: number;
  syncedAt: Date;
};

/**
 * Resolves Jonah billing IDs from Stripe (cached), copies matching users into `JonahSubscriber`,
 * and stores catalog metadata in `JonahSyncMeta`. Run via `npm run sync:jonah-users`.
 */
export async function syncJonahSubscribersToDatabase(): Promise<JonahSyncResult> {
  clearJonahCatalogCache();
  const { products, priceIds, priceToProduct } = await getJonahCatalog();
  const syncedAt = new Date();

  if (priceIds.length === 0) {
    await JonahSubscriber.deleteMany({});
    await JonahSyncMeta.findOneAndUpdate(
      { key: "catalog" },
      { key: "catalog", products, priceIds, subscriberCount: 0, syncedAt },
      { upsert: true, returnDocument: "after" }
    );
    return { products, priceIds, matched: 0, upserted: 0, removed: 0, syncedAt };
  }

  const users = await User.find({
    "brandSubscriptions.jonah.priceId": { $in: priceIds },
  })
    .select("-password")
    .lean();
  const activeUserIds = new Set<string>();

  let upserted = 0;
  for (const user of users) {
    const userId = String(user._id);
    const jonah = user.brandSubscriptions?.jonah;
    const priceId = typeof jonah?.priceId === "string" ? jonah.priceId : null;
    const product = priceId ? priceToProduct.get(priceId) : undefined;
    if (!product || !jonah) continue;

    activeUserIds.add(userId);

    await JonahSubscriber.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        email: user.email,
        name: user.name,
        image: user.image,
        stripeCustomerId: user.stripeCustomerId ?? null,
        city: user.city ?? null,
        country: user.country ?? null,
        address: user.address ?? null,
        state: user.state ?? null,
        zip: user.zip ?? null,
        phoneNumber: user.phoneNumber ?? null,
        wpRole: user.wpRole ?? null,
        subscriptionId: jonah.stripeSubscriptionId ?? null,
        subscriptionStatus: jonah.subscriptionStatus,
        currentPlan: jonah.planName,
        priceId: jonah.priceId ?? null,
        currentPeriodEnd: jonah.currentPeriodEnd ?? null,
        cancelAtPeriodEnd: jonah.cancelAtPeriodEnd ?? false,
        userCreatedAt: user.createdAt,
        userUpdatedAt: user.updatedAt,
        jonahProductId: product.id,
        jonahProductName: product.name,
        syncedAt,
      },
      { upsert: true, returnDocument: "after" }
    );
    upserted += 1;
  }

  const removed = await JonahSubscriber.deleteMany(
    activeUserIds.size > 0
      ? {
          userId: {
            $nin: [...activeUserIds].map((id) => new mongoose.Types.ObjectId(id)),
          },
        }
      : {}
  );

  await JonahSyncMeta.findOneAndUpdate(
    { key: "catalog" },
    {
      key: "catalog",
      products,
      priceIds,
      subscriberCount: upserted,
      syncedAt,
    },
    { upsert: true, returnDocument: "after" }
  );

  return {
    products,
    priceIds,
    matched: users.length,
    upserted,
    removed: removed.deletedCount ?? 0,
    syncedAt,
  };
}
