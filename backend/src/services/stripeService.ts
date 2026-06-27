import {
  getConfiguredStripeProducts,
  resolveCheckoutProductId,
} from "../config/stripeProducts";
import { User, type IUser } from "../models/User";
import { resolveDefaultPriceIdForProduct, stripe } from "../lib/stripe";
import { env } from "../config/env";
import { promotionsService } from "./promotionsService";

export type MemberPaymentMethod = {
  id: string;
  type: string;
  brand: string | null;
  last4: string | null;
  expMonth: number | null;
  expYear: number | null;
  isDefault: boolean;
};

export type BillingInvoice = {
  id: string;
  number: string | null;
  status: string;
  currency: string;
  amountDue: number;
  amountPaid: number;
  total: number;
  created: string;
  periodStart: string | null;
  periodEnd: string | null;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
  description: string | null;
};

type StripePaymentMethod = {
  id: string;
  type: string;
  card?: {
    brand?: string | null;
    last4?: string | null;
    exp_month?: number | null;
    exp_year?: number | null;
  } | null;
};

type StripeCustomerInvoiceSettings = {
  invoice_settings?: {
    default_payment_method?: string | { id: string } | null;
  } | null;
};

function serializePaymentMethod(
  pm: StripePaymentMethod,
  defaultPaymentMethodId: string | null
): MemberPaymentMethod {
  const card = pm.card;
  return {
    id: pm.id,
    type: pm.type,
    brand: card?.brand ?? null,
    last4: card?.last4 ?? null,
    expMonth: card?.exp_month ?? null,
    expYear: card?.exp_year ?? null,
    isDefault: pm.id === defaultPaymentMethodId,
  };
}

function resolveDefaultPaymentMethodId(customer: StripeCustomerInvoiceSettings): string | null {
  const dpm = customer.invoice_settings?.default_payment_method;
  if (!dpm) return null;
  return typeof dpm === "string" ? dpm : dpm.id;
}

type StripeInvoiceRow = {
  id: string;
  number: string | null;
  status: string | null;
  currency: string | null;
  amount_due: number | null;
  amount_paid: number | null;
  total: number | null;
  created: number;
  period_start: number | null;
  period_end: number | null;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
  description: string | null;
  lines?: { data?: { description?: string | null }[] } | null;
};

function unixToIso(seconds: number | null | undefined): string | null {
  if (seconds == null || !Number.isFinite(seconds)) return null;
  return new Date(seconds * 1000).toISOString();
}

function invoiceDescription(inv: StripeInvoiceRow): string | null {
  const lineDesc = inv.lines?.data?.[0]?.description;
  if (lineDesc?.trim()) return lineDesc.trim();
  if (inv.description?.trim()) return inv.description.trim();
  return null;
}

function serializeInvoice(inv: StripeInvoiceRow): BillingInvoice {
  return {
    id: inv.id,
    number: inv.number,
    status: inv.status ?? "unknown",
    currency: (inv.currency ?? "usd").toLowerCase(),
    amountDue: inv.amount_due ?? 0,
    amountPaid: inv.amount_paid ?? 0,
    total: inv.total ?? 0,
    created: new Date(inv.created * 1000).toISOString(),
    periodStart: unixToIso(inv.period_start),
    periodEnd: unixToIso(inv.period_end),
    hostedInvoiceUrl: inv.hosted_invoice_url,
    invoicePdf: inv.invoice_pdf,
    description: invoiceDescription(inv),
  };
}

function isInvalidOrWrongModeCustomerError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; message?: string };
  const message = err.message ?? "";
  return (
    err.code === "resource_missing" ||
    message.includes("No such customer") ||
    message.includes("similar object exists in live mode") ||
    message.includes("similar object exists in test mode")
  );
}

async function createStripeCustomer(user: IUser): Promise<string> {
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId: user._id.toString() },
  });
  user.stripeCustomerId = customer.id;
  await user.save();
  return customer.id;
}

/** Use a customer valid for the current Stripe key (test vs live); recreate if DB has the wrong mode. */
async function ensureStripeCustomerForCurrentMode(user: IUser): Promise<string> {
  const existingId = user.stripeCustomerId?.trim();
  if (existingId) {
    try {
      const customer = await stripe.customers.retrieve(existingId);
      if (!("deleted" in customer && customer.deleted)) {
        // Update customer email if it's different from the database
        if (customer.email !== user.email) {
          await stripe.customers.update(existingId, {
            email: user.email,
            name: user.name,
          });
        }
        return existingId;
      }
    } catch (error) {
      if (!isInvalidOrWrongModeCustomerError(error)) {
        throw error;
      }
    }
    user.stripeCustomerId = undefined;
    await user.save();
  }

  return createStripeCustomer(user);
}

export const stripeService = {
  async ensureCustomer(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    await ensureStripeCustomerForCurrentMode(user);
    return user;
  },
  async createCheckoutSession(
    userId: string | undefined,
    input: {
      productId?: string;
      brand?: string;
      tier?: string;
      email?: string;
      promotionCode?: string;
      pendingRegistration?: { name: string; email: string; password: string };
    }
  ) {
    const normalizedProductId = resolveCheckoutProductId(input);
    const productEntry = getConfiguredStripeProducts().find(
      (p) => p.productId === normalizedProductId
    );

    const priceId = await resolveDefaultPriceIdForProduct(normalizedProductId);

    // For existing users, find their record
    let user = userId ? await User.findById(userId) : null;

    // For new registrations (pay-first flow), we'll use the pending registration email
    // For existing users, use the provided email or fall back to user email
    const email = input.pendingRegistration?.email || input.email || user?.email;
    if (!email) {
      throw new Error("Email is required for checkout");
    }

    // Get or create Stripe customer
    let customerId: string;
    if (user) {
      customerId = await ensureStripeCustomerForCurrentMode(user);
    } else {
      // For new users, check if a customer already exists with this email
      try {
        const existingCustomer = await stripe.customers.search({
          query: `email:"${email}"`,
          limit: 1,
        });

        if (existingCustomer.data.length > 0) {
          // Reuse existing customer
          console.log(`[Checkout] Reusing existing Stripe customer for ${email}: ${existingCustomer.data[0].id}`);
          customerId = existingCustomer.data[0].id;
        } else {
          // Create new customer only if one doesn't exist
          console.log(`[Checkout] Creating new Stripe customer for ${email}`);
          const customer = await stripe.customers.create({
            email: email,
            metadata: {
              registrationType: "pending",
            },
          });
          customerId = customer.id;
        }
      } catch (searchError) {
        // Fallback: create new customer if search fails
        console.warn(`[Checkout] Customer search failed for ${email}:`, searchError instanceof Error ? searchError.message : searchError);
        const customer = await stripe.customers.create({
          email: email,
          metadata: {
            registrationType: "pending",
          },
        });
        customerId = customer.id;
      }
    }

    let discounts: { promotion_code: string }[] | undefined;
    if (input.promotionCode?.trim()) {
      const resolved = await promotionsService.resolvePromotionForCheckout(
        userId,
        input.promotionCode
      );
      discounts = [{ promotion_code: resolved.stripePromotionCodeId }];
    }

    // Always use customer ID to prevent Stripe from auto-creating duplicate customers
    // We already have customerId from either existing user or our explicit customer creation
    const sessionConfig: any = {
      customer: customerId,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${env.frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.frontendUrl}/#pricing`,
      metadata: {
        ...(user ? { userId: user._id.toString() } : {}),
        productId: normalizedProductId,
        ...(input.promotionCode?.trim()
          ? { promotionCode: input.promotionCode.trim().toUpperCase() }
          : {}),
        ...(input.pendingRegistration
          ? { pendingRegistration: JSON.stringify(input.pendingRegistration) }
          : {}),
      },
      subscription_data: {
        metadata: {
          ...(user ? { userId: user._id.toString() } : {}),
          productId: normalizedProductId,
          ...(productEntry
            ? { brand: productEntry.brand, tier: productEntry.tier }
            : {}),
          ...(input.pendingRegistration
            ? { pendingRegistration: JSON.stringify(input.pendingRegistration) }
            : {}),
        },
      },
      ...(discounts ? { discounts } : { allow_promotion_codes: true }),
      billing_address_collection: "auto",
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);
    return session;
  },
  async createPortalSession(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    const customerId = await ensureStripeCustomerForCurrentMode(user);
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${env.frontendUrl}/dashboard/billing`,
    });
    return portal;
  },

  async listPaymentMethods(userId: string): Promise<{
    defaultPaymentMethodId: string | null;
    paymentMethods: MemberPaymentMethod[];
  }> {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const existingId = user.stripeCustomerId?.trim();
    if (!existingId) {
      return { defaultPaymentMethodId: null, paymentMethods: [] };
    }

    let customer: StripeCustomerInvoiceSettings;
    try {
      const retrieved = await stripe.customers.retrieve(existingId, {
        expand: ["invoice_settings.default_payment_method"],
      });
      if ("deleted" in retrieved && retrieved.deleted) {
        return { defaultPaymentMethodId: null, paymentMethods: [] };
      }
      customer = retrieved;
    } catch (error) {
      if (isInvalidOrWrongModeCustomerError(error)) {
        return { defaultPaymentMethodId: null, paymentMethods: [] };
      }
      throw error;
    }

    const defaultPaymentMethodId = resolveDefaultPaymentMethodId(customer);
    const listed = await stripe.paymentMethods.list({
      customer: existingId,
      type: "card",
    });

    const paymentMethods = listed.data.map((pm) =>
      serializePaymentMethod(pm, defaultPaymentMethodId)
    );

    return { defaultPaymentMethodId, paymentMethods };
  },

  async listBillingHistory(userId: string): Promise<{ invoices: BillingInvoice[] }> {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const existingId = user.stripeCustomerId?.trim();
    if (!existingId) {
      return { invoices: [] };
    }

    try {
      const listed = await stripe.invoices.list({
        customer: existingId,
        limit: 24,
        expand: ["data.lines"],
      });

      const invoices = listed.data
        .filter((inv) => inv.status !== "draft")
        .map((inv) => serializeInvoice(inv as StripeInvoiceRow));

      return { invoices };
    } catch (error) {
      if (isInvalidOrWrongModeCustomerError(error)) {
        return { invoices: [] };
      }
      throw error;
    }
  },
};
