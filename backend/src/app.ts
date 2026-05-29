import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { buildOpenApiSpec } from "./docs/openapi";
import authRoutes from "./routes/auth";
import stripeRoutes from "./routes/stripe";
import userRoutes from "./routes/user";
import adminRoutes from "./routes/admin";
import videoRoutes from "./routes/videos";
import pickRoutes from "./routes/picks";
import parlayRoutes from "./routes/parlay";
import { stripeWebhookController } from "./webhooks/stripeWebhook";

const app = express();

app.use(cors({ origin: env.frontendUrls, credentials: true }));
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(morgan("dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
  })
);

app.post(
  "/api/webhook/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhookController
);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/picks", pickRoutes);
app.use("/api/parlay", parlayRoutes);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(buildOpenApiSpec(), {
    customSiteTitle: "SmartEdgePicks API",
    customCss: ".swagger-ui .topbar { display: none }",
  })
);

export { app };
