import { Request, Response } from "express";
import { env } from "../config/env";
import { getPlanNameFromProductId, stripe } from "../lib/stripe";
import { getBrandFromPlanName } from "../lib/subscriptionBrand";

type StripeEvent = ReturnType<typeof stripe.webhooks.constructEvent>;
type StripeCheckoutSession = Awaited<ReturnType<typeof stripe.checkout.sessions.retrieve>>;
type StripeSubscription = Awaited<ReturnType<typeof stripe.subscriptions.retrieve>>;
type StripeInvoice = Awaited<ReturnType<typeof stripe.invoices.retrieve>>;
import { User } from "../models/User";
import { emailService } from "../services/emailService";
import { userService } from "../services/userService";
import {
  handleCheckoutSessionCompleted,
  handleSubscriptionUpdated,
} from "../services/stripeSubscriptionSync";
import { markBrandSubscriptionCanceled } from "../services/subscriptionEntitlementsService";

export const stripeWebhookController = async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string | undefined;
  if (!signature) {
    return res.status(400).json({ error: "Missing stripe signature header" });
  }

  let event: StripeEvent;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      env.stripeWebhookSecret
    ) as StripeEvent;
  } catch (error) {
    return res.status(400).json({ error: `Webhook Error: ${(error as Error).message}` });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as StripeCheckoutSession;
        await handleCheckoutSessionCompleted(session);

        try {
          const full = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ["subscription"],
          });
          const customerId =
            typeof full.customer === "string" ? full.customer : full.customer?.id;
          let user = await User.findOne({
            $or: [
              ...(customerId ? [{ stripeCustomerId: customerId }] : []),
              ...(session.metadata?.userId
                ? [{ _id: session.metadata.userId }]
                : []),
            ],
          });

          // If user doesn't exist, create them from pending registration data
          if (!user && session.metadata?.pendingRegistration) {
            try {
              const regData = JSON.parse(session.metadata.pendingRegistration);
              const { user: newUser } = await userService.register({
                name: regData.name,
                email: regData.email,
                password: regData.password,
              });
              // Link the existing Stripe customer to the newly created user
              if (customerId && newUser) {
                newUser.stripeCustomerId = customerId;
                await newUser.save();
                console.log(`[stripe-webhook] Linked Stripe customer ${customerId} to new user ${newUser._id}`);
              }
              user = newUser;
            } catch (regErr) {
              console.warn(
                "[stripe-webhook] Failed to create user from pending registration:",
                (regErr as Error).message
              );
            }
          }

          if (user) {
            const productId = full.metadata?.productId?.trim();
            const planKey = productId ? getPlanNameFromProductId(productId) : "free";
            const brand = getBrandFromPlanName(planKey);
            const refreshed = await User.findById(user._id);
            const snap =
              brand && refreshed?.brandSubscriptions
                ? refreshed.brandSubscriptions[brand]
                : null;
            await emailService.sendPurchaseConfirmation({
              to: session.customer_email ?? user.email,
              name: user.name,
              planName: snap?.planName ?? (planKey !== "free" ? planKey : "active"),
              amount: (session.amount_total ?? 0) / 100,
              invoiceUrl: typeof session.invoice === "string" ? session.invoice : undefined,
              nextBillingDate: snap?.currentPeriodEnd ?? new Date(),
            });
          }
        } catch (emailErr) {
          console.warn("[stripe-webhook] purchase email failed:", (emailErr as Error).message);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as StripeSubscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as StripeSubscription;
        const { user } = await markBrandSubscriptionCanceled(subscription.id);

        if (user) {
          try {
            await emailService.sendCancellationEmail({
              to: user.email,
              accessEndDate: (() => {
                const end = subscription.items?.data?.[0]?.current_period_end;
                return typeof end === "number" && end > 0 ? new Date(end * 1000) : undefined;
              })(),
            });
          } catch {
            /* non-fatal */
          }
        }
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as StripeInvoice;
        const subRef =
          (invoice as any).subscription ??
          invoice.parent?.subscription_details?.subscription;
        const subId = typeof subRef === "string" ? subRef : subRef?.id;
        if (subId) {
          await handleSubscriptionUpdated({ id: subId });
        }
        if (invoice.customer_email?.trim()) {
          try {
            await emailService.sendInvoiceEmail({
              to: invoice.customer_email,
              invoicePdfUrl: invoice.invoice_pdf ?? undefined,
              amount: (invoice.amount_paid ?? 0) / 100,
              invoiceNumber: invoice.number ?? undefined,
              periodEnd: invoice.period_end
                ? new Date(invoice.period_end * 1000)
                : new Date(),
            });
          } catch {
            /* non-fatal */
          }
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as StripeInvoice;
        const subRef =
          (invoice as any).subscription ??
          invoice.parent?.subscription_details?.subscription;
        const subId = typeof subRef === "string" ? subRef : subRef?.id;
        if (subId) {
          await handleSubscriptionUpdated({ id: subId });
        }

        const user = await User.findOne({
          stripeCustomerId: String(invoice.customer),
        });

        if (user?.stripeCustomerId) {
          try {
            const portalSession = await stripe.billingPortal.sessions.create({
              customer: user.stripeCustomerId,
              return_url: `${env.frontendUrl}/dashboard/billing`,
            });
            await emailService.sendPaymentFailedEmail({
              to: user.email,
              portalUrl: portalSession.url,
            });
          } catch {
            /* non-fatal */
          }
        }
        break;
      }
      default:
        break;
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("[stripe-webhook]", event.type, error);
    return res.status(500).json({ error: (error as Error).message });
  }
};
