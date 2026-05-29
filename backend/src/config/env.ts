import dotenv from "dotenv";

dotenv.config();

const requiredVars = [
  "MONGODB_URI",
  "JWT_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "FRONTEND_URL",
] as const;

for (const key of requiredVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const port = Number(process.env.PORT ?? 5000);

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port,
  /** Public base URL for OpenAPI / Swagger (optional; defaults to localhost). */
  apiPublicUrl: process.env.API_PUBLIC_URL ?? `http://localhost:${port}`,
  mongodbUri: process.env.MONGODB_URI as string,
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  passwordResetCodeTtlMinutes: Number(process.env.PASSWORD_RESET_CODE_TTL_MINUTES ?? 15),
  passwordResetTokenExpiresIn: process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN ?? "15m",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY as string,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET as string,
  stripeSmartedgeWeeklyProductId: process.env.STRIPE_SMARTEDGE_WEEKLY_PRODUCT_ID ?? "",
  stripeSmartedgeMonthlyStandardProductId:
    process.env.STRIPE_SMARTEDGE_MONTHLY_STANDARD_PRODUCT_ID ?? "",
  stripeSmartedgeMonthlyVipProductId:
    process.env.STRIPE_SMARTEDGE_MONTHLY_VIP_PRODUCT_ID ?? "",
  stripeJonahWeeklyProductId: process.env.STRIPE_JONAH_WEEKLY_PRODUCT_ID ?? "",
  stripeJonahMonthlyStandardProductId:
    process.env.STRIPE_JONAH_MONTHLY_STANDARD_PRODUCT_ID ?? "",
  stripeJonahMonthlyVipProductId: process.env.STRIPE_JONAH_MONTHLY_VIP_PRODUCT_ID ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  emailFrom: (process.env.EMAIL_FROM ?? "noreply@example.com").trim().replace(/[>]+$/, ""),
  appName: process.env.APP_NAME ?? "YourSaaSApp",
  frontendUrl: process.env.FRONTEND_URL as string,
  telnyxApiKey: process.env.TELNYX_API_KEY ?? "",
  telnyxFromNumber: process.env.TELNYX_FROM_NUMBER ?? "",
  telnyxMessagingProfileId: process.env.TELNYX_MESSAGING_PROFILE_ID ?? "",
  bulkSmsDelayMs: Number(process.env.BULK_SMS_DELAY_MS ?? 1500),
  /** Parlay API key — https://parlay-api.com (optional in dev: uses sandbox when unset). */
  parlayApiKey: (process.env.PARLAY_API_KEY ?? "").trim(),
};
