import { Resend } from "resend";
import { env } from "../config/env";
import { formatDateTimeET, formatMonthYearET } from "../lib/datetime";

const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;

const send = async (to: string, subject: string, html: string) => {
  if (!resend) {
    throw new Error(
      "Email is not configured (set RESEND_API_KEY in backend/.env and restart the server)"
    );
  }

  const { data, error } = await resend.emails.send({
    from: env.emailFrom,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("[email] Resend error:", error);
    throw new Error(error.message ?? "Failed to send email");
  }

  if (!data?.id) {
    console.warn("[email] Resend returned no message id for", to);
  }
};

export const emailService = {
  async sendPurchaseConfirmation(payload: {
    to: string;
    name: string;
    planName: string;
    amount: number;
    invoiceUrl?: string;
    nextBillingDate: Date;
  }) {
    await send(
      payload.to,
      `Welcome to ${payload.planName}! Your subscription is active 🎉`,
      `<h2>Welcome ${payload.name}</h2><p>Your ${payload.planName} plan is active.</p>
       <p>Amount charged: $${payload.amount.toFixed(2)}</p>
       <p>Next billing date: ${formatDateTimeET(payload.nextBillingDate)}</p>
       <p><a href="${payload.invoiceUrl ?? "#"}">View invoice PDF</a></p>
       <p><a href="${env.frontendUrl}/dashboard">Go to Dashboard</a></p>`
    );
  },
  async sendInvoiceEmail(payload: {
    to: string;
    invoicePdfUrl?: string;
    amount: number;
    invoiceNumber?: string;
    periodEnd: Date;
  }) {
    await send(
      payload.to,
      `Your ${env.appName} invoice for ${formatMonthYearET(payload.periodEnd)}`,
      `<h2>Invoice ${payload.invoiceNumber ?? "-"}</h2><p>Amount: $${payload.amount.toFixed(2)}</p>
       <p>Period end: ${formatDateTimeET(payload.periodEnd)}</p>
       <p><a href="${payload.invoicePdfUrl ?? "#"}">Download PDF</a></p>`
    );
  },
  async sendPaymentFailedEmail(payload: { to: string; portalUrl: string }) {
    await send(
      payload.to,
      "Action required: Payment failed for your subscription",
      `<p>We could not process your latest payment.</p>
       <p><a href="${payload.portalUrl}">Update payment method</a></p>`
    );
  },
  async sendPasswordResetCode(payload: {
    to: string;
    name: string;
    code: string;
    expiresMinutes: number;
  }) {
    await send(
      payload.to,
      `${env.appName} — your password reset code`,
      `<h2>Reset your password</h2>
       <p>Hi ${payload.name},</p>
       <p>Use this verification code to reset your ${env.appName} password:</p>
       <p style="font-size:28px;font-weight:bold;letter-spacing:4px;margin:16px 0">${payload.code}</p>
       <p>This code expires in ${payload.expiresMinutes} minutes.</p>
       <p>If you did not request this, you can ignore this email.</p>`
    );
  },
  async sendCancellationEmail(payload: {
    to: string;
    accessEndDate?: Date;
  }) {
    await send(
      payload.to,
      "Your subscription has been canceled",
      `<p>Your subscription has been canceled.</p>
       <p>Access end date: ${payload.accessEndDate?.toDateString() ?? "Immediate"}</p>
       <p><a href="${env.frontendUrl}/pricing">Resubscribe</a></p>`
    );
  },
};
