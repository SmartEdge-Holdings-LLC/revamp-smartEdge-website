"use client";

import { FormEvent, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn, signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthFormCard, AuthFormHeader } from "@/components/auth/AuthFormCard";
import { authInputClass } from "@/components/auth/auth-form-styles";
import { PricingAccentButton } from "@/components/pricing/PricingAccentButton";
import { Input } from "@/components/ui/input";
import { CheckoutPromoCode } from "@/components/checkout/CheckoutPromoCode";
import { stashPendingCheckoutPlan } from "@/lib/pending-checkout-plan";
import {
  consumePendingCheckoutPromo,
  stashPendingCheckoutPromo,
} from "@/lib/pending-checkout-promo";
import { startSubscriptionCheckout } from "@/lib/start-checkout";
import {
  getPlanDisplayName,
  parseSubscriptionPlanParams,
  type SubscriptionPlanSelection,
} from "@/lib/subscription-plan";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

async function ensureCheckoutSession() {
  // For new registrations, we don't require authentication yet
  // The user will be created after payment confirmation via webhook
  let session = await getSession();

  // If user is already logged in, that's fine - they can checkout
  // If not, that's also fine for new registrations - they'll be created after payment
  return session;
}

function RegisterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status, update } = useSession();

  const plan = useMemo(
    () =>
      parseSubscriptionPlanParams(
        searchParams.get("brand"),
        searchParams.get("tier")
      ),
    [searchParams]
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const checkoutLock = useRef(false);
  const clearedStaleSession = useRef(false);

  useEffect(() => {
    const fromUrl = searchParams.get("promo")?.trim().toUpperCase();
    const fromStorage = consumePendingCheckoutPromo();
    setPromoCode(fromUrl || fromStorage || "");
  }, [searchParams]);

  const isLoggedIn = status === "authenticated" && Boolean(session?.user?.backendToken);

  useEffect(() => {
    if (!plan) {
      router.replace("/#pricing");
    }
  }, [plan, router]);

  useEffect(() => {
    if (status !== "authenticated" || clearedStaleSession.current) return;
    if (!session?.user?.backendToken) {
      clearedStaleSession.current = true;
      void signOut({ redirect: false });
    }
  }, [status, session]);

  const goToCheckout = async () => {
    if (!plan || checkoutLock.current) return;
    checkoutLock.current = true;
    setLoading(true);
    try {
      await ensureCheckoutSession();
      await startSubscriptionCheckout(plan, {
        promotionCode: promoCode.trim() || undefined,
      });
    } catch (error) {
      checkoutLock.current = false;
      setLoading(false);
      toast.error((error as Error).message);
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!plan) return;

    setLoading(true);
    checkoutLock.current = true;
    try {
      // Validate email format
      if (!email || !email.includes("@")) {
        throw new Error("Valid email is required");
      }
      if (!password || password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }
      if (!name || name.length < 2) {
        throw new Error("Name is required");
      }

      // Store registration data in sessionStorage - account will be created after successful payment
      const regData = { name, email, password };
      sessionStorage.setItem("pendingRegistration", JSON.stringify(regData));
      localStorage.setItem("pendingRegistrationPlan", JSON.stringify(plan));

      // Go directly to checkout without creating account
      await startSubscriptionCheckout(plan, {
        promotionCode: promoCode.trim() || undefined,
      });
    } catch (error) {
      sessionStorage.removeItem("pendingRegistration");
      localStorage.removeItem("pendingRegistrationPlan");
      toast.error((error as Error).message);
      setLoading(false);
      checkoutLock.current = false;
    }
  };

  if (!plan) {
    return null;
  }

  if (isLoggedIn && session?.user) {
    return (
      <RegisterPageExistingUser
        plan={plan}
        email={session.user.email ?? ""}
        loading={loading}
        promoCode={promoCode}
        onPromoCodeChange={setPromoCode}
        onContinue={() => void goToCheckout()}
      />
    );
  }

  return (
    <RegisterPageContent
      plan={plan}
      loading={loading}
      onSubmit={onSubmit}
      name={name}
      setName={setName}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      promoCode={promoCode}
      onPromoCodeChange={setPromoCode}
    />
  );
}

function RegisterPageExistingUser({
  plan,
  email,
  loading,
  promoCode,
  onPromoCodeChange,
  onContinue,
}: {
  plan: SubscriptionPlanSelection;
  email: string;
  loading: boolean;
  promoCode: string;
  onPromoCodeChange: (code: string) => void;
  onContinue: () => void;
}) {
  const planName = getPlanDisplayName(plan);

  return (
    <AuthShell>
      <AuthFormCard>
        <AuthFormHeader
          title="Continue checkout"
          description={
            <>
              Signed in as <span className="font-medium text-white">{email}</span>. Complete
              payment for <span className="font-medium text-white">{planName}</span> when you&apos;re
              ready.
            </>
          }
        />
        <CheckoutPromoCode
          className="mt-2"
          value={promoCode}
          onChange={onPromoCodeChange}
          disabled={loading}
        />
        <PricingAccentButton
          type="button"
          loading={loading}
          onClick={onContinue}
          className="mt-4 cursor-pointer"
        >
          Continue to payment
        </PricingAccentButton>
        <p className="mt-8 text-center typo-body-md text-slate-400">
          <Link
            className="font-semibold text-accent underline-offset-4 transition hover:text-white hover:underline"
            href="/login"
            onClick={() => {
              stashPendingCheckoutPlan(plan);
              stashPendingCheckoutPromo(promoCode);
            }}
          >
            Use a different account
          </Link>
        </p>
      </AuthFormCard>
    </AuthShell>
  );
}

function RegisterPageContent({
  plan,
  loading,
  onSubmit,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  promoCode,
  onPromoCodeChange,
}: {
  plan: SubscriptionPlanSelection;
  loading: boolean;
  onSubmit: (e: FormEvent) => void;
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  promoCode: string;
  onPromoCodeChange: (code: string) => void;
}) {
  const planName = getPlanDisplayName(plan);

  return (
    <AuthShell>
      <AuthFormCard>
        <AuthFormHeader
          title="Create account"
          description={
            <>
              You selected <span className="font-medium text-white">{planName}</span>. Enter your
              details, then you&apos;ll pay securely with Stripe.
            </>
          }
        />

        <form className="flex flex-col gap-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label
              htmlFor="register-name"
              className="block typo-caption font-semibold uppercase tracking-[0.12em] text-slate-400"
            >
              Name
            </label>
            <Input
              id="register-name"
              autoComplete="name"
              className={authInputClass}
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="register-email"
              className="block typo-caption font-semibold uppercase tracking-[0.12em] text-slate-400"
            >
              Email
            </label>
            <Input
              id="register-email"
              autoComplete="email"
              className={authInputClass}
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="register-password"
              className="block typo-caption font-semibold uppercase tracking-[0.12em] text-slate-400"
            >
              Password
            </label>
            <Input
              id="register-password"
              autoComplete="new-password"
              className={authInputClass}
              placeholder="At least 8 characters"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
              disabled={loading}
            />
          </div>
          <CheckoutPromoCode
            value={promoCode}
            onChange={onPromoCodeChange}
            disabled={loading}
          />
          <PricingAccentButton type="submit" loading={loading} className="mt-1 cursor-pointer">
            {loading ? "Continuing to checkout…" : "Continue to payment"}
          </PricingAccentButton>
        </form>

        <p className="mt-8 text-center typo-body-md text-slate-400">
          Already have an account?{" "}
          <Link
            className="font-semibold text-accent underline-offset-4 transition hover:text-white hover:underline"
            href="/login"
            onClick={() => stashPendingCheckoutPlan(plan)}
          >
            Sign in
          </Link>
        </p>
      </AuthFormCard>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
