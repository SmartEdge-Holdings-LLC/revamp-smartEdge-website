"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthFormCard, AuthFormHeader } from "@/components/auth/AuthFormCard";
import { PricingAccentButton } from "@/components/pricing/PricingAccentButton";
import { Input } from "@/components/ui/input";
import { authInputClass } from "@/components/auth/auth-form-styles";
import { loginRequest } from "@/lib/api/authApi";
import { persistAuthSession } from "@/lib/authCookies";
import { startSubscriptionCheckout } from "@/lib/start-checkout";
import { consumePendingCheckoutPlan } from "@/lib/pending-checkout-plan";
import {
  getPlanDisplayName,
  planSearchParams,
  type SubscriptionPlanSelection,
} from "@/lib/subscription-plan";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checkoutPlan, setCheckoutPlan] = useState<SubscriptionPlanSelection | null>(null);

  useEffect(() => {
    setCheckoutPlan(consumePendingCheckoutPlan());
  }, []);

  const plan = checkoutPlan;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (plan) {
        const signInResult = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (signInResult?.error) {
          throw new Error("Invalid credentials");
        }
        const session = await getSession();
        if (!session?.user?.backendToken) {
          throw new Error("Sign-in succeeded but session is missing. Try again.");
        }
        toast.success("Signed in — opening checkout…");
        await startSubscriptionCheckout(plan);
        return;
      }

      // Members use NextAuth (dashboard requires session); admins use cookie JWT.
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (!signInResult?.error) {
        toast.success("Logged in");
        const redirectParam = searchParams.get("redirect");
        router.push(redirectParam ?? "/dashboard");
        return;
      }

      const result = await loginRequest({ email, password });
      if (result.role === "member") {
        throw new Error("Invalid credentials");
      }

      const resolvedEmail = result.admin.email;
      persistAuthSession({ token: result.token, role: result.role, email: resolvedEmail });

      toast.success("Logged in");
      const redirectParam = searchParams.get("redirect");
      router.push(redirectParam ?? result.redirect);
    } catch (error) {
      toast.error((error as Error).message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const planQuery = plan ? planSearchParams(plan).toString() : "";
  const registerHref = plan ? `/register?${planQuery}` : "/#pricing";

  return (
    <AuthShell>
      <AuthFormCard>
        <AuthFormHeader
          title="Sign in"
          description={
            plan ? (
              <>
                Complete payment for{" "}
                <span className="font-medium text-white">{getPlanDisplayName(plan)}</span> after you
                sign in.
              </>
            ) : (
              "Enter your credentials to access your account"
            )
          }
        />

        <form className="flex flex-col gap-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label
              htmlFor="login-email"
              className="block typo-caption font-semibold uppercase tracking-[0.12em] text-slate-400"
            >
              Email
            </label>
            <Input
              id="login-email"
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
              htmlFor="login-password"
              className="block typo-caption font-semibold uppercase tracking-[0.12em] text-slate-400"
            >
              Password
            </label>
            <div className="relative">
              <Input
                id="login-password"
                autoComplete="current-password"
                className={`${authInputClass} pr-11`}
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <p className="-mt-1 text-right">
            <Link
              href="/forgot-password"
              className="typo-body-sm text-slate-400 underline-offset-4 transition hover:text-accent hover:underline"
            >
              Forgot password?
            </Link>
          </p>
          <PricingAccentButton type="submit" loading={loading} className="mt-1 cursor-pointer">
            {plan ? (loading ? "Opening checkout…" : "Sign in & pay") : "Sign in"}
          </PricingAccentButton>
        </form>

        <p className="mt-8 text-center typo-body-md text-slate-400">
            New here?{" "}
            <Link
              className="font-semibold text-accent underline-offset-4 transition hover:text-white hover:underline"
              href={registerHref}
            >
              Create account
            </Link>
          </p>
      </AuthFormCard>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
