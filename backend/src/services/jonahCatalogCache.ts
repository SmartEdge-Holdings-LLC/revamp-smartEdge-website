import { getJonahStripeProductIds } from "../config/jonahProducts";
import { listBillingIdsForProduct, stripe } from "../lib/stripe";

export type JonahProductMeta = { id: string; name: string };

export type JonahCatalog = {
  products: JonahProductMeta[];
  priceIds: string[];
  priceToProduct: Map<string, JonahProductMeta>;
};

const CACHE_TTL_MS = 15 * 60 * 1000;

let cache: { catalog: JonahCatalog; expiresAt: number } | null = null;
let inflight: Promise<JonahCatalog> | null = null;

async function fetchCatalogFromStripe(): Promise<JonahCatalog> {
  const configured = getJonahStripeProductIds();
  const products: JonahProductMeta[] = [];
  const priceIds: string[] = [];
  const priceToProduct = new Map<string, JonahProductMeta>();

  await Promise.all(
    configured.map(async ({ productId }) => {
      const [product, billingIds] = await Promise.all([
        stripe.products.retrieve(productId).catch(() => null),
        listBillingIdsForProduct(productId),
      ]);

      const meta: JonahProductMeta = {
        id: productId,
        name: product?.name || productId,
      };
      products.push(meta);

      for (const billingId of billingIds) {
        priceIds.push(billingId);
        priceToProduct.set(billingId, meta);
      }
    })
  );

  products.sort((a, b) => a.name.localeCompare(b.name));

  return { products, priceIds, priceToProduct };
}

/**
 * Jonah product → billing ID map. Loaded from Stripe, cached in memory (~15 min).
 * User rows are always read from MongoDB.
 */
export async function getJonahCatalog(): Promise<JonahCatalog> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) {
    return cache.catalog;
  }

  if (!inflight) {
    inflight = fetchCatalogFromStripe()
      .then((catalog) => {
        cache = { catalog, expiresAt: Date.now() + CACHE_TTL_MS };
        return catalog;
      })
      .finally(() => {
        inflight = null;
      });
  }

  return inflight;
}

export function clearJonahCatalogCache() {
  cache = null;
  inflight = null;
}
