import { env } from "../config/env";

/**
 * OpenAPI 3.0 document for all HTTP routes on this Express app.
 * Served by Swagger UI at `/api-docs`.
 */
export function buildOpenApiSpec() {
  const base = env.apiPublicUrl.replace(/\/$/, "");

  return {
    openapi: "3.0.3",
    info: {
      title: "SmartEdgePicks API",
      version: "1.0.0",
      description:
        "Backend REST API for auth, Stripe billing, user profile, admin CRUD, and Stripe webhooks. " +
        "Protected routes expect `Authorization: Bearer <JWT>`. " +
        "Unified sign-in: **`POST /api/auth/login`** with **`email`** + **`password`** only — resolves **`users`** first, then **`admins`**. Response includes **`role`**: **`member`**, **`admin`**, **`subadmin`**, or **`handicapper`**. JWT carries `userId` or `adminId`. " +
        "Password reset: **`POST /api/auth/forgot-password`** → **`verify-reset-code`** → **`reset-password`** (all roles). " +
        "**`POST /api/admin/admins`** requires top **`admin`**. **GET** routes require an Admin JWT. **PUT/DELETE** require **`subadmin`**.",
    },
    servers: [{ url: base, description: "API base (set `API_PUBLIC_URL` in production)" }],
    tags: [
      { name: "System", description: "Health and metadata" },
      {
        name: "Auth",
        description:
          "Registration, login, session, and password reset (members, admins, subadmins, handicappers)",
      },
      { name: "Stripe", description: "Checkout, portal, subscription (authenticated)" },
      { name: "User", description: "User profile (authenticated)" },
      {
        name: "Admin",
        description:
          "`Admin` collection (`admins`): same login endpoint resolves admin accounts after `users`. **GET `/analytics`** dashboard KPIs (DAU, subscribers, churn, Stripe revenue). **GET `/users`** lists app members (no passwords). Top **`admin`** creates **`subadmin`** rows; **`subadmin`** updates/deletes admins.",
      },
      { name: "Webhooks", description: "Stripe webhook (signature-verified)" },
      {
        name: "Picks",
        description:
          "Public free picks (`GET /api/picks`) and member paid feeds (`GET /api/picks/paid/admin`, `GET /api/picks/paid/jonah`).",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "User JWT (`userId`) or Admin JWT (`adminId`) from `POST /api/auth/login`. Member routes (`/api/user/*`, `/api/stripe/*`, `/api/picks/paid/*`) require a **user** token. Admin routes (`/api/admin/*`) require an **admin** token.",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: { type: "string", example: "Invalid credentials" },
          },
          required: ["error"],
        },
        User: {
          type: "object",
          description: "User document (password never returned from API).",
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439011" },
            email: { type: "string", format: "email" },
            name: { type: "string" },
            image: { type: "string", format: "uri", nullable: true },
            stripeCustomerId: { type: "string", nullable: true },
            city: { type: "string", nullable: true },
            country: { type: "string", nullable: true },
            address: { type: "string", nullable: true },
            state: { type: "string", nullable: true },
            zip: { type: "string", nullable: true },
            discordUsername: { type: "string", nullable: true },
            phoneNumber: { type: "string", nullable: true },
            wpRole: { type: "string", enum: ["subscriber", "administrator"], nullable: true },
            subscriptionId: { type: "string", nullable: true },
            subscriptionStatus: {
              type: "string",
              enum: ["active", "inactive", "trialing", "past_due", "canceled", "unpaid"],
            },
            currentPlan: {
              type: "string",
              enum: [
                "free",
                "smartedgeWeekly",
                "smartedgeMonthlyStandard",
                "smartedgeMonthlyVip",
                "jonahWeekly",
                "jonahMonthlyStandard",
                "jonahMonthlyVip",
                "weekly",
                "monthlyStandard",
                "monthlyVip",
                "starter",
                "pro",
                "enterprise",
              ],
            },
            priceId: { type: "string", nullable: true },
            currentPeriodEnd: { type: "string", format: "date-time", nullable: true },
            cancelAtPeriodEnd: { type: "boolean" },
            entitlements: { $ref: "#/components/schemas/MemberEntitlements" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        BrandEntitlement: {
          type: "object",
          properties: {
            brand: { type: "string", enum: ["smartedge", "jonah"] },
            active: { type: "boolean" },
            planName: { type: "string" },
            subscriptionStatus: {
              type: "string",
              enum: ["active", "inactive", "trialing", "past_due", "canceled", "unpaid"],
            },
            stripeSubscriptionId: { type: "string", nullable: true },
            priceId: { type: "string", nullable: true },
            currentPeriodEnd: { type: "string", format: "date-time", nullable: true },
            cancelAtPeriodEnd: { type: "boolean" },
          },
        },
        MemberEntitlements: {
          type: "object",
          properties: {
            smartedge: { $ref: "#/components/schemas/BrandEntitlement", nullable: true },
            jonah: { $ref: "#/components/schemas/BrandEntitlement", nullable: true },
          },
        },
        AdminUserListResponse: {
          type: "object",
          properties: {
            users: { type: "array", items: { $ref: "#/components/schemas/User" } },
            page: { type: "integer", minimum: 1, example: 1, description: "1-based page index" },
            limit: { type: "integer", minimum: 1, maximum: 100, example: 20, description: "Page size (max 100)" },
            total: { type: "integer", minimum: 0, example: 42, description: "Total matching users" },
            totalPages: { type: "integer", minimum: 0, example: 3, description: "`ceil(total / limit)`" },
          },
          required: ["users", "page", "limit", "total", "totalPages"],
        },
        AdminAnalyticsOverview: {
          type: "object",
          description:
            "Dashboard KPIs. User counts from MongoDB; revenue metrics from Stripe (MRR, weekly charges, ARPU).",
          properties: {
            weeklyActiveUsers: { type: "integer", minimum: 0 },
            totalInactiveSubscribers: { type: "integer", minimum: 0 },
            totalUsers: { type: "integer", minimum: 0 },
            smartedgeActiveSubscribers: {
              type: "integer",
              minimum: 0,
              description: "Users with SmartEdge brand `active` or `trialing`",
            },
            jonahActiveSubscribers: {
              type: "integer",
              minimum: 0,
              description: "Users with Jonah brand `active` or `trialing`",
            },
            churnRatePercent: { type: "number", description: "Trailing 30-day churn (%)" },
            newSubscriptionsWeekly: { type: "integer", minimum: 0 },
            averageRevenuePerCustomer: {
              type: "number",
              description: "Stripe MRR divided by active paying customers",
            },
            currency: { type: "string", example: "usd" },
            monthlyRecurringRevenue: { type: "number" },
            weeklyRevenue: { type: "number", description: "Stripe charge volume, last 7 days" },
            generatedAt: { type: "string", format: "date-time" },
            period: {
              type: "object",
              properties: {
                weeklyActiveFrom: { type: "string", format: "date-time" },
                churnWindowDays: { type: "integer" },
                revenueWindowDays: { type: "integer" },
              },
            },
          },
          required: [
            "weeklyActiveUsers",
            "totalInactiveSubscribers",
            "totalUsers",
            "smartedgeActiveSubscribers",
            "jonahActiveSubscribers",
            "churnRatePercent",
            "newSubscriptionsWeekly",
            "averageRevenuePerCustomer",
            "currency",
            "monthlyRecurringRevenue",
            "weeklyRevenue",
            "generatedAt",
            "period",
          ],
        },
        DailySalePoint: {
          type: "object",
          properties: {
            date: { type: "string", format: "date", example: "2026-05-28" },
            amount: { type: "number", description: "Major currency units (e.g. USD)" },
            amountCents: { type: "integer" },
          },
          required: ["date", "amount", "amountCents"],
        },
        AdminSalesByDayResponse: {
          type: "object",
          properties: {
            range: { type: "string", enum: ["7d", "4w", "90d"] },
            days: { type: "integer", minimum: 1 },
            currency: { type: "string", example: "usd" },
            total: { type: "number" },
            totalCents: { type: "integer" },
            salesByDay: {
              type: "array",
              items: { $ref: "#/components/schemas/DailySalePoint" },
            },
            generatedAt: { type: "string", format: "date-time" },
          },
          required: ["range", "days", "currency", "total", "totalCents", "salesByDay", "generatedAt"],
        },
        AdminAnalyticsResponse: {
          type: "object",
          properties: {
            analytics: { $ref: "#/components/schemas/AdminAnalyticsOverview" },
          },
          required: ["analytics"],
          example: {
            analytics: {
              weeklyActiveUsers: 186,
              totalInactiveSubscribers: 31,
              totalUsers: 512,
              smartedgeActiveSubscribers: 64,
              jonahActiveSubscribers: 25,
              churnRatePercent: 4.2,
              newSubscriptionsWeekly: 12,
              averageRevenuePerCustomer: 34.5,
              currency: "usd",
              monthlyRecurringRevenue: 3070.5,
              weeklyRevenue: 892.25,
              generatedAt: "2026-05-28T10:00:00.000Z",
              period: {
                weeklyActiveFrom: "2026-05-21T10:00:00.000Z",
                churnWindowDays: 30,
                revenueWindowDays: 7,
              },
            },
          },
        },
        JonahUser: {
          allOf: [
            { $ref: "#/components/schemas/User" },
            {
              type: "object",
              properties: {
                jonahProductId: { type: "string", nullable: true },
                jonahProductName: { type: "string", nullable: true },
              },
            },
          ],
        },
        AdminJonahUsersResponse: {
          type: "object",
          properties: {
            products: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                },
                required: ["id", "name"],
              },
            },
            priceIds: {
              type: "array",
              items: { type: "string" },
              description: "All Stripe Price IDs across configured Jonah products",
            },
            lastSyncedAt: { type: "string", format: "date-time", nullable: true },
            users: { type: "array", items: { $ref: "#/components/schemas/JonahUser" } },
            page: { type: "integer", minimum: 1 },
            limit: { type: "integer", minimum: 1, maximum: 100 },
            total: { type: "integer", minimum: 0 },
            totalPages: { type: "integer", minimum: 1 },
          },
          required: ["products", "priceIds", "users", "page", "limit", "total", "totalPages"],
        },
        AuthTokenResponse: {
          type: "object",
          properties: {
            user: { $ref: "#/components/schemas/User" },
            token: { type: "string", description: "JWT access token" },
          },
          required: ["user", "token"],
        },
        MeResponse: {
          type: "object",
          properties: {
            user: { $ref: "#/components/schemas/User" },
          },
          required: ["user"],
        },
        RegisterRequest: {
          type: "object",
          required: ["email", "name", "password"],
          properties: {
            email: { type: "string", format: "email" },
            name: { type: "string", minLength: 2 },
            password: { type: "string", minLength: 8, format: "password" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 1, format: "password" },
          },
        },
        ForgotPasswordRequest: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email" },
          },
        },
        ForgotPasswordResponse: {
          type: "object",
          required: ["message"],
          properties: {
            message: {
              type: "string",
              example: "A verification code has been sent to your email.",
            },
          },
        },
        VerifyResetCodeRequest: {
          type: "object",
          required: ["email", "code"],
          properties: {
            email: { type: "string", format: "email" },
            code: {
              type: "string",
              pattern: "^\\d{6}$",
              description: "6-digit code from email",
              example: "482910",
            },
          },
        },
        VerifyResetCodeResponse: {
          type: "object",
          required: ["resetToken", "expiresIn", "accountType", "role"],
          properties: {
            resetToken: {
              type: "string",
              description: "Short-lived JWT — pass to `POST /api/auth/reset-password`",
            },
            expiresIn: { type: "string", example: "15m" },
            accountType: { type: "string", enum: ["member", "admin"] },
            role: {
              type: "string",
              enum: ["member", "admin", "subadmin", "handicapper"],
              description: "Console role when `accountType` is `admin`",
            },
          },
        },
        ResetPasswordRequest: {
          type: "object",
          required: ["resetToken", "password"],
          properties: {
            resetToken: { type: "string" },
            password: { type: "string", minLength: 8, format: "password" },
          },
        },
        ResetPasswordResponse: {
          type: "object",
          required: ["message"],
          properties: {
            message: { type: "string", example: "Password updated successfully" },
          },
        },
        SignInResponseMember: {
          type: "object",
          required: ["user", "token", "role"],
          properties: {
            user: { $ref: "#/components/schemas/User" },
            token: { type: "string", description: "JWT with `userId`" },
            role: { type: "string", enum: ["member"] },
          },
        },
        SignInResponseConsole: {
          type: "object",
          required: ["admin", "token", "role"],
          properties: {
            admin: { $ref: "#/components/schemas/Admin" },
            token: { type: "string", description: "JWT with `adminId` (use on `/api/admin/*`)" },
            role: {
              type: "string",
              enum: ["admin", "subadmin", "handicapper"],
              description: "Mirrors `Admin.role`",
            },
          },
        },
        SignInResponse: {
          oneOf: [{ $ref: "#/components/schemas/SignInResponseMember" }, { $ref: "#/components/schemas/SignInResponseConsole" }],
          discriminator: {
            propertyName: "role",
            mapping: {
              member: "#/components/schemas/SignInResponseMember",
              admin: "#/components/schemas/SignInResponseConsole",
              subadmin: "#/components/schemas/SignInResponseConsole",
            },
          },
        },
        CheckoutSessionRequest: {
          type: "object",
          required: ["productId"],
          properties: {
            productId: { type: "string", minLength: 1, description: "Stripe Product ID" },
          },
        },
        UrlResponse: {
          type: "object",
          properties: {
            url: { type: "string", format: "uri", description: "Stripe-hosted URL" },
          },
          required: ["url"],
        },
        SubscriptionResponse: {
          type: "object",
          properties: {
            subscription: {
              type: "object",
              properties: {
                currentPlan: {
              type: "string",
              enum: [
                "free",
                "smartedgeWeekly",
                "smartedgeMonthlyStandard",
                "smartedgeMonthlyVip",
                "jonahWeekly",
                "jonahMonthlyStandard",
                "jonahMonthlyVip",
                "weekly",
                "monthlyStandard",
                "monthlyVip",
                "starter",
                "pro",
                "enterprise",
              ],
            },
                subscriptionStatus: {
                  type: "string",
                  enum: ["active", "inactive", "trialing", "past_due", "canceled", "unpaid"],
                },
                currentPeriodEnd: { type: "string", format: "date-time", nullable: true },
                cancelAtPeriodEnd: { type: "boolean" },
                priceId: { type: "string", nullable: true },
                entitlements: { $ref: "#/components/schemas/MemberEntitlements" },
              },
            },
          },
          required: ["subscription"],
        },
        PaymentMethodCard: {
          type: "object",
          properties: {
            id: { type: "string" },
            type: { type: "string", example: "card" },
            brand: { type: "string", nullable: true, example: "visa" },
            last4: { type: "string", nullable: true, example: "4242" },
            expMonth: { type: "integer", nullable: true, example: 12 },
            expYear: { type: "integer", nullable: true, example: 2028 },
            isDefault: { type: "boolean" },
          },
          required: ["id", "type", "brand", "last4", "expMonth", "expYear", "isDefault"],
        },
        PaymentMethodsResponse: {
          type: "object",
          properties: {
            defaultPaymentMethodId: { type: "string", nullable: true },
            paymentMethods: {
              type: "array",
              items: { $ref: "#/components/schemas/PaymentMethodCard" },
            },
          },
          required: ["defaultPaymentMethodId", "paymentMethods"],
        },
        BillingInvoice: {
          type: "object",
          properties: {
            id: { type: "string" },
            number: { type: "string", nullable: true },
            status: { type: "string", example: "paid" },
            currency: { type: "string", example: "usd" },
            amountDue: { type: "integer", description: "Amount in cents" },
            amountPaid: { type: "integer", description: "Amount in cents" },
            total: { type: "integer", description: "Amount in cents" },
            created: { type: "string", format: "date-time" },
            periodStart: { type: "string", format: "date-time", nullable: true },
            periodEnd: { type: "string", format: "date-time", nullable: true },
            hostedInvoiceUrl: { type: "string", format: "uri", nullable: true },
            invoicePdf: { type: "string", format: "uri", nullable: true },
            description: { type: "string", nullable: true },
          },
          required: [
            "id",
            "number",
            "status",
            "currency",
            "amountDue",
            "amountPaid",
            "total",
            "created",
            "periodStart",
            "periodEnd",
            "hostedInvoiceUrl",
            "invoicePdf",
            "description",
          ],
        },
        BillingHistoryResponse: {
          type: "object",
          properties: {
            invoices: {
              type: "array",
              items: { $ref: "#/components/schemas/BillingInvoice" },
            },
          },
          required: ["invoices"],
        },
        UpdateProfileRequest: {
          type: "object",
          description:
            "All fields optional; send only what you want to change. Location and contact fields must be non-empty strings when provided.",
          properties: {
            name: { type: "string", minLength: 2 },
            image: { type: "string", format: "uri" },
            city: { type: "string", minLength: 1 },
            country: { type: "string", minLength: 1 },
            address: { type: "string", minLength: 1 },
            state: { type: "string", minLength: 1 },
            zip: { type: "string", minLength: 1 },
            discordUsername: { type: "string", minLength: 1 },
            phoneNumber: { type: "string", minLength: 1 },
          },
        },
        UserPasswordUpdateRequest: {
          type: "object",
          required: ["currentPassword", "newPassword"],
          properties: {
            currentPassword: { type: "string", minLength: 1, format: "password" },
            newPassword: { type: "string", minLength: 8, format: "password" },
          },
        },
        ProfileResponse: {
          type: "object",
          properties: {
            user: { $ref: "#/components/schemas/User" },
          },
          required: ["user"],
        },
        HealthResponse: {
          type: "object",
          properties: {
            ok: { type: "boolean", example: true },
          },
          required: ["ok"],
        },
        Admin: {
          type: "object",
          properties: {
            _id: { type: "string" },
            email: { type: "string", format: "email" },
            name: { type: "string" },
            role: {
              type: "string",
              enum: ["admin", "subadmin", "handicapper"],
              description:
                "Admin console role. Top operator is **`admin`**; delegated accounts are **`subadmin`**; handicapper account is **`handicapper`**.",
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        AdminCreateRequest: {
          type: "object",
          required: ["email", "name", "password"],
          properties: {
            email: { type: "string", format: "email" },
            name: { type: "string", minLength: 2 },
            password: { type: "string", minLength: 8, format: "password" },
          },
        },
        AdminUpdateRequest: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            name: { type: "string", minLength: 2 },
            password: { type: "string", minLength: 8, format: "password" },
            role: { type: "string", enum: ["admin", "subadmin"] },
          },
        },
        AdminSingleResponse: {
          type: "object",
          properties: {
            admin: { $ref: "#/components/schemas/Admin" },
          },
          required: ["admin"],
        },
        AdminListResponse: {
          type: "object",
          properties: {
            admins: { type: "array", items: { $ref: "#/components/schemas/Admin" } },
          },
          required: ["admins"],
        },
        DeleteOkResponse: {
          type: "object",
          properties: {
            deleted: { type: "boolean", example: true },
          },
          required: ["deleted"],
        },
        SmsTestRequest: {
          type: "object",
          required: ["phoneNumber"],
          properties: {
            phoneNumber: {
              type: "string",
              example: "+15551234567",
              description: "Destination phone number in E.164 format",
            },
            message: {
              type: "string",
              description: "Optional override text. If omitted, default picks-live message is used.",
            },
          },
        },
        SmsBroadcastRequest: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Optional override text. If omitted, default picks-live message is used.",
            },
            delayMs: {
              type: "integer",
              minimum: 500,
              maximum: 10000,
              default: 1500,
              description: "Delay between each outbound SMS to reduce provider throttling",
            },
          },
        },
        SmsSendResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            to: { type: "string", example: "+15551234567" },
            messageId: { type: "string", nullable: true },
            message: { type: "string" },
          },
          required: ["success", "to", "message"],
        },
        SmsBroadcastResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            delayMs: { type: "integer", nullable: true },
            attempted: { type: "integer", minimum: 0 },
            sent: { type: "integer", minimum: 0 },
            failed: { type: "integer", minimum: 0 },
            skipped: { type: "integer", minimum: 0 },
            failures: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  phoneNumber: { type: "string" },
                  error: { type: "string" },
                },
                required: ["phoneNumber", "error"],
              },
            },
          },
          required: ["success", "message", "attempted", "sent", "failed", "skipped", "failures"],
        },
        AdminPasswordUpdateRequest: {
          type: "object",
          required: ["currentPassword", "newPassword"],
          properties: {
            currentPassword: { type: "string", minLength: 1, format: "password" },
            newPassword: { type: "string", minLength: 8, format: "password" },
          },
        },
        MessageOkResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Password updated successfully" },
          },
          required: ["message"],
        },
        PickBetType: {
          type: "string",
          enum: [
            "spread",
            "moneyline",
            "total",
            "parlay",
            "player_prop",
            "team_total",
            "other",
            "home",
            "time",
            "away",
            "winner",
            "total_game_spread",
            "sets",
          ],
        },
        PickLeague: {
          type: "string",
          enum: [
            "NBA",
            "NFL",
            "MLB",
            "NHL",
            "WNBA",
            "COLLEGE",
            "NCAAF",
            "NCAAM",
            "NCAAW",
            "PGA TOUR",
            "MMA",
            "TENNIS",
            "SOCCOR",
            "RACING",
          ],
        },
        PickAccess: {
          type: "string",
          enum: ["free", "paid"],
          description: "Whether the pick is free or requires a paid membership",
        },
        PickStatus: {
          type: "string",
          enum: ["active", "inactive"],
          description: "Whether the pick is visible to members (active) or hidden (inactive)",
        },
        Pick: {
          type: "object",
          properties: {
            _id: { type: "string" },
            league: { $ref: "#/components/schemas/PickLeague" },
            awayTeamId: { type: "string", nullable: true },
            homeTeamId: { type: "string", nullable: true },
            awayTeamName: { type: "string", nullable: true },
            homeTeamName: { type: "string", nullable: true },
            game: { type: "string", description: "Matchup label, e.g. Lakers @ Celtics" },
            pickTitle: { type: "string" },
            detailedAnalysis: { type: "string" },
            odds: { type: "string", example: "-110" },
            betType: { $ref: "#/components/schemas/PickBetType" },
            confidence: { type: "integer", minimum: 1, maximum: 100 },
            access: { $ref: "#/components/schemas/PickAccess" },
            status: { $ref: "#/components/schemas/PickStatus" },
            createdBy: {
              oneOf: [
                { type: "string" },
                {
                  type: "object",
                  properties: {
                    _id: { type: "string" },
                    name: { type: "string" },
                    email: { type: "string", format: "email" },
                    role: {
                      type: "string",
                      enum: ["admin", "subadmin", "handicapper"],
                    },
                  },
                },
              ],
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          required: [
            "_id",
            "league",
            "game",
            "pickTitle",
            "detailedAnalysis",
            "odds",
            "betType",
            "confidence",
            "access",
            "status",
            "createdAt",
            "updatedAt",
          ],
        },
        PickCreateRequest: {
          type: "object",
          required: ["league", "awayTeamId", "homeTeamId", "pickTitle", "detailedAnalysis", "odds", "betType", "confidence", "access", "status"],
          properties: {
            league: { $ref: "#/components/schemas/PickLeague" },
            awayTeamId: { type: "string", minLength: 1, maxLength: 100 },
            homeTeamId: { type: "string", minLength: 1, maxLength: 100 },
            game: { type: "string", minLength: 1, maxLength: 500, description: "Optional; computed from teams if omitted" },
            pickTitle: { type: "string", minLength: 1, maxLength: 300 },
            detailedAnalysis: { type: "string", minLength: 1, maxLength: 10000 },
            odds: { type: "string", minLength: 1, maxLength: 64 },
            betType: { $ref: "#/components/schemas/PickBetType" },
            confidence: { type: "integer", minimum: 1, maximum: 100 },
            access: { $ref: "#/components/schemas/PickAccess" },
            status: { $ref: "#/components/schemas/PickStatus" },
          },
        },
        PickUpdateRequest: {
          type: "object",
          properties: {
            league: { $ref: "#/components/schemas/PickLeague" },
            awayTeamId: { type: "string", minLength: 1, maxLength: 100 },
            homeTeamId: { type: "string", minLength: 1, maxLength: 100 },
            game: { type: "string", minLength: 1, maxLength: 500 },
            pickTitle: { type: "string", minLength: 1, maxLength: 300 },
            detailedAnalysis: { type: "string", minLength: 1, maxLength: 10000 },
            odds: { type: "string", minLength: 1, maxLength: 64 },
            betType: { $ref: "#/components/schemas/PickBetType" },
            confidence: { type: "integer", minimum: 1, maximum: 100 },
            access: { $ref: "#/components/schemas/PickAccess" },
            status: { $ref: "#/components/schemas/PickStatus" },
          },
        },
        LeagueTeam: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            shortName: { type: "string" },
            logo: { type: "string", description: "Public URL e.g. /leagues/nba/lakers.png" },
          },
          required: ["id", "name", "shortName", "logo"],
        },
        LeagueTeamsResponse: {
          type: "object",
          properties: {
            league: { $ref: "#/components/schemas/PickLeague" },
            teams: { type: "array", items: { $ref: "#/components/schemas/LeagueTeam" } },
          },
          required: ["league", "teams"],
        },
        PickListResponse: {
          type: "object",
          properties: {
            picks: { type: "array", items: { $ref: "#/components/schemas/Pick" } },
            page: { type: "integer", minimum: 1 },
            limit: { type: "integer", minimum: 1, maximum: 100 },
            total: { type: "integer", minimum: 0 },
            totalPages: { type: "integer", minimum: 0 },
          },
          required: ["picks", "page", "limit", "total", "totalPages"],
        },
        PickSingleResponse: {
          type: "object",
          properties: {
            pick: { $ref: "#/components/schemas/Pick" },
          },
          required: ["pick"],
        },
        PublicPickAuthor: {
          type: "object",
          properties: {
            name: { type: "string" },
            role: {
              type: "string",
              enum: ["admin", "subadmin", "handicapper"],
            },
          },
          required: ["name", "role"],
        },
        PublicPick: {
          type: "object",
          description: "Free active pick exposed on GET /api/picks (no author email).",
          properties: {
            _id: { type: "string" },
            league: { $ref: "#/components/schemas/PickLeague" },
            awayTeamId: { type: "string", nullable: true },
            homeTeamId: { type: "string", nullable: true },
            awayTeamName: { type: "string", nullable: true },
            homeTeamName: { type: "string", nullable: true },
            awayTeamLogo: { type: "string", nullable: true },
            homeTeamLogo: { type: "string", nullable: true },
            game: { type: "string" },
            pickTitle: { type: "string" },
            detailedAnalysis: { type: "string" },
            odds: { type: "string" },
            betType: { $ref: "#/components/schemas/PickBetType" },
            confidence: { type: "integer", minimum: 1, maximum: 100 },
            access: { type: "string", enum: ["free"] },
            status: { type: "string", enum: ["active"] },
            createdBy: { $ref: "#/components/schemas/PublicPickAuthor", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          required: [
            "_id",
            "league",
            "game",
            "pickTitle",
            "detailedAnalysis",
            "odds",
            "betType",
            "confidence",
            "access",
            "status",
            "createdAt",
            "updatedAt",
          ],
        },
        PublicListPicksResponse: {
          type: "object",
          properties: {
            picks: { type: "array", items: { $ref: "#/components/schemas/PublicPick" } },
            page: { type: "integer", minimum: 1 },
            limit: { type: "integer", minimum: 1, maximum: 50 },
            total: { type: "integer", minimum: 0 },
            totalPages: { type: "integer", minimum: 0 },
          },
          required: ["picks", "page", "limit", "total", "totalPages"],
        },
        PaidPick: {
          type: "object",
          description:
            "Paid active pick for members (`GET /api/picks/paid/admin` or `/api/picks/paid/jonah`).",
          properties: {
            _id: { type: "string" },
            league: { $ref: "#/components/schemas/PickLeague" },
            awayTeamId: { type: "string", nullable: true },
            homeTeamId: { type: "string", nullable: true },
            awayTeamName: { type: "string", nullable: true },
            homeTeamName: { type: "string", nullable: true },
            awayTeamLogo: { type: "string", nullable: true },
            homeTeamLogo: { type: "string", nullable: true },
            game: { type: "string" },
            pickTitle: { type: "string" },
            detailedAnalysis: { type: "string" },
            odds: { type: "string" },
            betType: { $ref: "#/components/schemas/PickBetType" },
            confidence: { type: "integer", minimum: 1, maximum: 100 },
            access: { type: "string", enum: ["paid"] },
            status: { type: "string", enum: ["active"] },
            createdBy: { $ref: "#/components/schemas/PublicPickAuthor", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          required: [
            "_id",
            "league",
            "game",
            "pickTitle",
            "detailedAnalysis",
            "odds",
            "betType",
            "confidence",
            "access",
            "status",
            "createdAt",
            "updatedAt",
          ],
        },
        PaidListPicksResponse: {
          type: "object",
          properties: {
            picks: { type: "array", items: { $ref: "#/components/schemas/PaidPick" } },
            page: { type: "integer", minimum: 1 },
            limit: { type: "integer", minimum: 1, maximum: 50 },
            total: { type: "integer", minimum: 0 },
            totalPages: { type: "integer", minimum: 0 },
            source: { type: "string", enum: ["admin", "jonah"] },
          },
          required: ["picks", "page", "limit", "total", "totalPages", "source"],
        },
        VideoPlatform: {
          type: "string",
          enum: ["youtube", "tiktok", "instagram"],
        },
        PublicVideo: {
          type: "object",
          description: "Active video on GET /api/videos (no createdBy).",
          properties: {
            _id: { type: "string" },
            platform: { $ref: "#/components/schemas/VideoPlatform" },
            url: { type: "string" },
            externalId: { type: "string", nullable: true },
            title: { type: "string" },
            status: { type: "string", enum: ["active"] },
            sortOrder: { type: "integer" },
            embedUrl: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          required: [
            "_id",
            "platform",
            "url",
            "title",
            "status",
            "sortOrder",
            "createdAt",
            "updatedAt",
          ],
        },
        PublicListVideosResponse: {
          type: "object",
          properties: {
            videos: { type: "array", items: { $ref: "#/components/schemas/PublicVideo" } },
            page: { type: "integer", minimum: 1 },
            limit: { type: "integer", minimum: 1, maximum: 100 },
            total: { type: "integer", minimum: 0 },
            totalPages: { type: "integer", minimum: 0 },
          },
          required: ["videos", "page", "limit", "total", "totalPages"],
        },
      },
    },
    paths: {
      "/health": {
        get: {
          tags: ["System"],
          summary: "Health check",
          operationId: "getHealth",
          responses: {
            "200": {
              description: "Service is up",
              content: { "application/json": { schema: { $ref: "#/components/schemas/HealthResponse" } } },
            },
          },
        },
      },
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          operationId: "register",
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/RegisterRequest" } },
            },
          },
          responses: {
            "201": {
              description: "Created",
              content: { "application/json": { schema: { $ref: "#/components/schemas/AuthTokenResponse" } } },
            },
            "400": {
              description: "Validation or business error",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
          },
        },
      },
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Sign in (email + password)",
          description:
            "Body is **`email`** and **`password`** only. Server checks **`users`** first (member), then **`admins`**. Response: **`{ user, token, role: \"member\" }`** or **`{ admin, token, role: \"admin\" | \"subadmin\" }`**. Same email in both: a valid **user** password wins.",
          operationId: "login",
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } },
            },
          },
          responses: {
            "200": {
              description: "OK",
              content: { "application/json": { schema: { $ref: "#/components/schemas/SignInResponse" } } },
            },
            "400": {
              description: "Invalid credentials or validation error",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
          },
        },
      },
      "/api/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Current user",
          operationId: "me",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "OK",
              content: { "application/json": { schema: { $ref: "#/components/schemas/MeResponse" } } },
            },
            "401": {
              description: "Missing or invalid token",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
          },
        },
      },
      "/api/auth/forgot-password": {
        post: {
          tags: ["Auth"],
          summary: "Request password reset code",
          description:
            "Sends a 6-digit verification code when the email exists on a **member** (`users`) or **admin console** account (`admins`, including handicapper). " +
            "Returns **404** if no account is registered with that email. Requires `RESEND_API_KEY` to deliver mail.",
          operationId: "forgotPassword",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ForgotPasswordRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "Request accepted",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ForgotPasswordResponse" },
                },
              },
            },
            "400": {
              description: "Validation or email delivery error",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
            "404": {
              description: "No user or admin account with this email",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                  example: { error: "No account found with this email address." },
                },
              },
            },
            "429": {
              description: "Too many requests",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
          },
        },
      },
      "/api/auth/verify-reset-code": {
        post: {
          tags: ["Auth"],
          summary: "Verify reset code",
          description:
            "Validates the 6-digit code from email. Returns a short-lived `resetToken` for `POST /api/auth/reset-password`. " +
            "Works for **member**, **admin**, **subadmin**, and **handicapper** accounts.",
          operationId: "verifyResetCode",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/VerifyResetCodeRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "Code valid",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/VerifyResetCodeResponse" },
                },
              },
            },
            "400": {
              description: "Invalid or expired code",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
            "429": {
              description: "Too many requests",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
          },
        },
      },
      "/api/auth/reset-password": {
        post: {
          tags: ["Auth"],
          summary: "Set new password",
          description:
            "Sets a new password using `resetToken` from **verify-reset-code**. " +
            "Applies to the same account types as forgot-password (member + all admin console roles).",
          operationId: "resetPassword",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ResetPasswordRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "Password updated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ResetPasswordResponse" },
                },
              },
            },
            "400": {
              description: "Invalid token or validation error",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
            "429": {
              description: "Too many requests",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
          },
        },
      },
      "/api/stripe/create-checkout-session": {
        post: {
          tags: ["Stripe"],
          summary: "Create Stripe Checkout session",
          operationId: "createCheckoutSession",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/CheckoutSessionRequest" } },
            },
          },
          responses: {
            "200": {
              description: "Checkout URL",
              content: { "application/json": { schema: { $ref: "#/components/schemas/UrlResponse" } } },
            },
            "400": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "401": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/stripe/create-portal-session": {
        post: {
          tags: ["Stripe"],
          summary: "Create Stripe Customer Portal session",
          operationId: "createPortalSession",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Portal URL",
              content: { "application/json": { schema: { $ref: "#/components/schemas/UrlResponse" } } },
            },
            "400": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "401": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/stripe/subscription": {
        get: {
          tags: ["Stripe"],
          summary: "Get subscription summary for current user",
          operationId: "getSubscription",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/SubscriptionResponse" } },
              },
            },
            "401": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/stripe/payment-methods": {
        get: {
          tags: ["Stripe"],
          summary: "List saved Stripe payment methods for current user",
          description:
            "Returns card payment methods attached to the member's Stripe customer (from Checkout or the billing portal).",
          operationId: "getPaymentMethods",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/PaymentMethodsResponse" } },
              },
            },
            "400": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "401": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/stripe/billing-history": {
        get: {
          tags: ["Stripe"],
          summary: "List billing history (invoices) for current user",
          description:
            "Returns Stripe invoices for the member's customer, excluding drafts. Amounts are in cents.",
          operationId: "getBillingHistory",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/BillingHistoryResponse" } },
              },
            },
            "400": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "401": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/stripe/update-payment-method": {
        post: {
          tags: ["Stripe"],
          summary: "Open billing portal to update payment method",
          description:
            "Returns a Stripe Customer Portal URL (same flow as create-portal-session in this implementation).",
          operationId: "updatePaymentMethod",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Portal URL",
              content: { "application/json": { schema: { $ref: "#/components/schemas/UrlResponse" } } },
            },
            "400": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "401": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/user/profile": {
        get: {
          tags: ["User"],
          summary: "Get profile",
          operationId: "getProfile",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "OK",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ProfileResponse" } } },
            },
            "401": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        put: {
          tags: ["User"],
          summary: "Update profile",
          operationId: "updateProfile",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/UpdateProfileRequest" } },
            },
          },
          responses: {
            "200": {
              description: "OK",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ProfileResponse" } } },
            },
            "400": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "401": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/user/password/update": {
        post: {
          tags: ["User"],
          summary: "Update current user password",
          operationId: "updateUserPassword",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserPasswordUpdateRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "Password updated",
              content: { "application/json": { schema: { $ref: "#/components/schemas/MessageOkResponse" } } },
            },
            "400": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "401": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/admin/analytics/sales": {
        get: {
          tags: ["Admin"],
          summary: "Stripe gross sales by day",
          description:
            "Returns daily gross Stripe charge volume for charting. Query `range`: `7d` (7 days), `4w` (28 days), or `90d` (90 days). Amounts are from Stripe balance transactions (`charge` / `payment`).",
          operationId: "adminGetSalesByDay",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "range",
              in: "query",
              required: false,
              schema: {
                type: "string",
                enum: ["7d", "4w", "90d"],
                default: "7d",
              },
              description: "Time window for daily sales buckets",
            },
          ],
          responses: {
            "200": {
              description: "Daily sales series",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AdminSalesByDayResponse" },
                },
              },
            },
            "401": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "403": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "500": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/admin/analytics": {
        get: {
          tags: ["Admin"],
          summary: "Admin dashboard analytics",
          description:
            "Returns KPIs for the admin dashboard.\n\n" +
            "- **Users (MongoDB):** `weeklyActiveUsers`, `totalUsers`, `smartedgeActiveSubscribers`, `jonahActiveSubscribers`, `totalInactiveSubscribers`, `newSubscriptionsWeekly`, `churnRatePercent` (30-day window).\n" +
            "- **Revenue (Stripe):** `monthlyRecurringRevenue`, `weeklyRevenue`, `averageRevenuePerCustomer`, `currency`.\n\n" +
            "Requires Admin JWT (`admin` or `subadmin`). Handicapper JWT is not allowed.",
          operationId: "adminGetAnalytics",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Analytics overview",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AdminAnalyticsResponse" },
                  example: {
                    analytics: {
                      weeklyActiveUsers: 186,
                      totalInactiveSubscribers: 31,
                      totalUsers: 512,
                      smartedgeActiveSubscribers: 64,
                      jonahActiveSubscribers: 25,
                      churnRatePercent: 4.2,
                      newSubscriptionsWeekly: 12,
                      averageRevenuePerCustomer: 34.5,
                      currency: "usd",
                      monthlyRecurringRevenue: 3070.5,
                      weeklyRevenue: 892.25,
                      generatedAt: "2026-05-28T10:00:00.000Z",
                      period: {
                        weeklyActiveFrom: "2026-05-21T10:00:00.000Z",
                        churnWindowDays: 30,
                        revenueWindowDays: 7,
                      },
                    },
                  },
                },
              },
            },
            "401": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "403": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "500": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/admin/users": {
        get: {
          tags: ["Admin"],
          summary: "List app users (paginated)",
          description:
            "Admin JWT (login resolved as **`admin`** or **`subadmin`**). Paginated slice of `users`; **password** is never included. Sorted by `createdAt` descending.",
          operationId: "adminListUsers",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "page",
              in: "query",
              required: false,
              schema: { type: "integer", minimum: 1, default: 1 },
              description: "1-based page number",
            },
            {
              name: "limit",
              in: "query",
              required: false,
              schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
              description: "Page size (max 100)",
            },
            {
              name: "search",
              in: "query",
              required: false,
              schema: { type: "string", maxLength: 200 },
              description: "Case-insensitive substring match against `email`",
            },
            {
              name: "status",
              in: "query",
              required: false,
              schema: {
                type: "array",
                items: {
                  type: "string",
                  enum: ["active", "inactive", "trialing", "past_due", "canceled", "unpaid"],
                },
              },
              style: "form",
              explode: true,
              description:
                "Filter by `subscriptionStatus`. May be repeated to OR several values. Also accepts a comma-separated single string.",
            },
            {
              name: "joinedFrom",
              in: "query",
              required: false,
              schema: { type: "string", format: "date" },
              description:
                "Inclusive lower bound on `createdAt`. `YYYY-MM-DD` is interpreted as 00:00:00 UTC of that day; full ISO-8601 strings are also accepted.",
            },
            {
              name: "joinedTo",
              in: "query",
              required: false,
              schema: { type: "string", format: "date" },
              description:
                "Inclusive upper bound on `createdAt`. `YYYY-MM-DD` is interpreted as 23:59:59.999 UTC of that day; full ISO-8601 strings are also accepted. If `joinedFrom > joinedTo` the values are swapped automatically.",
            },
          ],
          responses: {
            "200": {
              description: "OK",
              content: { "application/json": { schema: { $ref: "#/components/schemas/AdminUserListResponse" } } },
            },
            "400": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "401": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "403": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/admin/profile": {
        get: {
          tags: ["Admin"],
          summary: "Get current admin profile",
          description:
            "Returns the authenticated admin account profile (`admin`, `subadmin`, or `handicapper`).",
          operationId: "adminGetProfile",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "OK",
              content: { "application/json": { schema: { $ref: "#/components/schemas/AdminSingleResponse" } } },
            },
            "401": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "403": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "404": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/admin/jonah-users": {
        get: {
          tags: ["Admin"],
          summary: "List Jonah plan subscribers",
          description:
            "Admin JWT. Reads from `JonahSubscriber` (MongoDB). Populate via `npm run sync:jonah-users`. Supports the same filters as `GET /api/admin/users`.",
          operationId: "adminListJonahUsers",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "page",
              in: "query",
              schema: { type: "integer", minimum: 1, default: 1 },
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
            },
            {
              name: "search",
              in: "query",
              schema: { type: "string", maxLength: 200 },
              description: "Case-insensitive substring match against `email`",
            },
            {
              name: "status",
              in: "query",
              schema: {
                type: "array",
                items: {
                  type: "string",
                  enum: ["active", "inactive", "trialing", "past_due", "canceled", "unpaid"],
                },
              },
              style: "form",
              explode: true,
            },
            {
              name: "joinedFrom",
              in: "query",
              schema: { type: "string", format: "date" },
            },
            {
              name: "joinedTo",
              in: "query",
              schema: { type: "string", format: "date" },
            },
          ],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/AdminJonahUsersResponse" } },
              },
            },
            "400": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "401": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "403": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/admin/admins": {
        post: {
          tags: ["Admin"],
          summary: "Create subadmin (top admin only)",
          description:
            "Caller must have `Admin.role` **admin**. New row always has `role` **subadmin**.",
          operationId: "adminCreate",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/AdminCreateRequest" } },
            },
          },
          responses: {
            "201": {
              description: "Created",
              content: { "application/json": { schema: { $ref: "#/components/schemas/AdminSingleResponse" } } },
            },
            "400": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "401": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "403": {
              description: "`Admin.role` is not **admin**",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
          },
        },
        get: {
          tags: ["Admin"],
          summary: "List all admins",
          description: "Admin JWT; caller must have `Admin.role` **admin** or **subadmin**.",
          operationId: "adminList",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "OK",
              content: { "application/json": { schema: { $ref: "#/components/schemas/AdminListResponse" } } },
            },
            "401": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "403": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/admin/sms/test": {
        post: {
          tags: ["Admin"],
          summary: "Send test SMS to one phone number",
          description:
            "Admin JWT required. Sends one SMS immediately via Telnyx to verify provider setup and message delivery.",
          operationId: "adminSendTestSms",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/SmsTestRequest" } },
            },
          },
          responses: {
            "200": {
              description: "SMS accepted by provider",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/SmsSendResponse" } },
              },
            },
            "400": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "401": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "403": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/admin/sms/broadcast": {
        post: {
          tags: ["Admin"],
          summary: "Broadcast SMS to all users with phone numbers",
          description:
            "Admin JWT required. Iterates users with `phoneNumber`, de-duplicates numbers, and sends SMS with delay between each message to reduce throttling.",
          operationId: "adminBroadcastSms",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: false,
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/SmsBroadcastRequest" } },
            },
          },
          responses: {
            "200": {
              description: "Broadcast attempt completed",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/SmsBroadcastResponse" } },
              },
            },
            "400": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "401": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "403": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/admin/password/update": {
        post: {
          tags: ["Admin"],
          summary: "Update current admin password",
          description:
            "Authenticated admin password change for roles `admin`, `subadmin`, and `handicapper`. Requires current password verification.",
          operationId: "adminUpdateOwnPassword",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AdminPasswordUpdateRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "Password updated",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/MessageOkResponse" } },
              },
            },
            "400": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "401": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "403": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/admin/admins/{id}": {
        put: {
          tags: ["Admin"],
          summary: "Update admin",
          description: "Caller must have `Admin.role` **subadmin**. Top **admin** cannot use this route.",
          operationId: "adminUpdate",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/AdminUpdateRequest" } },
            },
          },
          responses: {
            "200": {
              description: "OK",
              content: { "application/json": { schema: { $ref: "#/components/schemas/AdminSingleResponse" } } },
            },
            "400": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "401": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "403": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "404": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        delete: {
          tags: ["Admin"],
          summary: "Delete admin",
          description:
            "Caller must have `Admin.role` **subadmin**. Cannot delete the last remaining `Admin` account.",
          operationId: "adminDelete",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": {
              description: "Deleted",
              content: { "application/json": { schema: { $ref: "#/components/schemas/DeleteOkResponse" } } },
            },
            "400": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "401": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "403": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "404": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/admin/league-teams": {
        get: {
          tags: ["Admin"],
          summary: "List teams for a league (from public/leagues/{league}/ logos)",
          operationId: "adminListLeagueTeams",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "league",
              in: "query",
              required: true,
              schema: { $ref: "#/components/schemas/PickLeague" },
            },
          ],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/LeagueTeamsResponse" } },
              },
            },
            "400": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "401": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "403": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/admin/picks": {
        get: {
          tags: ["Admin"],
          summary: "List picks (paginated)",
          description: "Admin JWT (`admin` or `subadmin`). Optional `search` matches game, title, or analysis.",
          operationId: "adminListPicks",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
            { name: "search", in: "query", schema: { type: "string" } },
            { name: "betType", in: "query", schema: { type: "string" }, description: "Comma-separated bet types" },
            { name: "league", in: "query", schema: { type: "string" }, description: "Comma-separated leagues (NBA, MLB, NHL, NFL)" },
          ],
          responses: {
            "200": {
              description: "OK",
              content: { "application/json": { schema: { $ref: "#/components/schemas/PickListResponse" } } },
            },
            "400": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "401": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "403": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        post: {
          tags: ["Admin"],
          summary: "Create a pick",
          operationId: "adminCreatePick",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/PickCreateRequest" } } },
          },
          responses: {
            "201": {
              description: "Created",
              content: { "application/json": { schema: { $ref: "#/components/schemas/PickSingleResponse" } } },
            },
            "400": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "401": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "403": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/admin/picks/{id}": {
        get: {
          tags: ["Admin"],
          summary: "Get one pick",
          operationId: "adminGetPick",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": {
              description: "OK",
              content: { "application/json": { schema: { $ref: "#/components/schemas/PickSingleResponse" } } },
            },
            "400": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "401": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "403": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "404": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        put: {
          tags: ["Admin"],
          summary: "Update a pick",
          operationId: "adminUpdatePick",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            content: { "application/json": { schema: { $ref: "#/components/schemas/PickUpdateRequest" } } },
          },
          responses: {
            "200": {
              description: "OK",
              content: { "application/json": { schema: { $ref: "#/components/schemas/PickSingleResponse" } } },
            },
            "400": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "401": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "403": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "404": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        delete: {
          tags: ["Admin"],
          summary: "Delete a pick",
          operationId: "adminDeletePick",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": {
              description: "Deleted",
              content: { "application/json": { schema: { $ref: "#/components/schemas/DeleteOkResponse" } } },
            },
            "400": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "401": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "403": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "404": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/videos": {
        get: {
          tags: ["Videos"],
          summary: "List active videos (public)",
          description:
            "Returns only videos where **status** is `active`. No authentication. Contrast with `GET /api/admin/videos`, which can include inactive rows and requires admin JWT.",
          operationId: "listPublicVideos",
          security: [],
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
            { name: "search", in: "query", schema: { type: "string" } },
            {
              name: "platform",
              in: "query",
              schema: { type: "string" },
              description: "Comma-separated platforms (youtube,tiktok,instagram)",
            },
          ],
          responses: {
            "200": {
              description: "Paginated active videos",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/PublicListVideosResponse" },
                },
              },
            },
            "400": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/videos/{id}": {
        get: {
          tags: ["Videos"],
          summary: "Get one active video (public)",
          operationId: "getPublicVideo",
          security: [],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": {
              description: "Active video",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { video: { $ref: "#/components/schemas/PublicVideo" } },
                    required: ["video"],
                  },
                },
              },
            },
            "400": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "404": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/picks": {
        get: {
          tags: ["Picks"],
          summary: "List free active picks (public)",
          description:
            "Returns only picks where **access** is `free` and **status** is `active`. No authentication required. `createdBy` includes **name** and **role** only (no email).",
          operationId: "listPublicFreePicks",
          security: [],
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 50, default: 20 } },
            { name: "search", in: "query", schema: { type: "string" } },
            {
              name: "league",
              in: "query",
              schema: { type: "string" },
              description: "Comma-separated leagues (e.g. NFL,NBA)",
            },
          ],
          responses: {
            "200": {
              description: "Paginated free picks",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/PublicListPicksResponse" },
                },
              },
            },
            "400": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/picks/paid/admin": {
        get: {
          tags: ["Picks"],
          summary: "List paid SmartEdge picks (member)",
          description:
            "Returns picks where **access** is `paid`, **status** is `active`, and the author is an **admin** or **subadmin** (SmartEdge desk). Requires a **member** JWT and an active or trialing SmartEdge plan (`smartedgeWeekly`, `smartedgeMonthlyStandard`, `smartedgeMonthlyVip`, or legacy `weekly` / `monthlyStandard` / `monthlyVip`).",
          operationId: "listPaidAdminPicks",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 50, default: 20 } },
            { name: "search", in: "query", schema: { type: "string" } },
            {
              name: "league",
              in: "query",
              schema: { type: "string" },
              description: "Comma-separated leagues (e.g. NFL,NBA)",
            },
          ],
          responses: {
            "200": {
              description: "Paginated paid SmartEdge picks",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/PaidListPicksResponse" },
                },
              },
            },
            "400": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "401": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "403": {
              description: "No active SmartEdge subscription",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
          },
        },
      },
      "/api/picks/paid/jonah": {
        get: {
          tags: ["Picks"],
          summary: "List paid Jonah picks (member)",
          description:
            "Returns picks where **access** is `paid`, **status** is `active`, and the author has role **handicapper** (Jonah). Requires a **member** JWT and an active or trialing Jonah plan (`jonahWeekly`, `jonahMonthlyStandard`, or `jonahMonthlyVip`).",
          operationId: "listPaidJonahPicks",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 50, default: 20 } },
            { name: "search", in: "query", schema: { type: "string" } },
            {
              name: "league",
              in: "query",
              schema: { type: "string" },
              description: "Comma-separated leagues (e.g. NFL,NBA)",
            },
          ],
          responses: {
            "200": {
              description: "Paginated paid Jonah picks",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/PaidListPicksResponse" },
                },
              },
            },
            "400": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "401": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "403": {
              description: "No active Jonah subscription",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
          },
        },
      },
      "/api/picks/{id}": {
        get: {
          tags: ["Picks"],
          summary: "Get one free active pick (public)",
          operationId: "getPublicFreePick",
          security: [],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": {
              description: "Free pick",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { pick: { $ref: "#/components/schemas/PublicPick" } },
                    required: ["pick"],
                  },
                },
              },
            },
            "400": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "404": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/api/webhook/stripe": {
        post: {
          tags: ["Webhooks"],
          summary: "Stripe webhook",
          description:
            "Raw JSON body as sent by Stripe. This route is registered **before** `express.json()` so the body stays raw for signature verification. Use the official Stripe signing secret.",
          operationId: "stripeWebhook",
          security: [],
          parameters: [
            {
              name: "Stripe-Signature",
              in: "header",
              required: true,
              schema: { type: "string" },
              description: "Stripe webhook signature header",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  description: "Stripe Event object JSON",
                  additionalProperties: true,
                },
              },
            },
          },
          responses: {
            "200": { description: "Event acknowledged" },
            "400": { description: "Invalid payload or signature" },
          },
        },
      },
    },
  };
}
