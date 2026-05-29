"use client";

import { FormEvent, Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthFormCard, AuthFormHeader } from "@/components/auth/AuthFormCard";
import { ResetPasswordStepper } from "@/components/auth/ResetPasswordStepper";
import { authInputClass } from "@/components/auth/auth-form-styles";
import { PricingAccentButton } from "@/components/pricing/PricingAccentButton";
import { Input } from "@/components/ui/input";
import {
  forgotPasswordRequest,
  resetPasswordRequest,
  verifyResetCodeRequest,
} from "@/lib/api/authApi";
import { cn } from "@/lib/utils";

const RESET_EMAIL_KEY = "sep_password_reset_email";

type Step = "email" | "code" | "password";

function stepTitle(step: Step): string {
  switch (step) {
    case "email":
      return "Reset your password";
    case "code":
      return "Enter verification code";
    case "password":
      return "Choose a new password";
  }
}

function stepDescription(step: Step, email: string): string {
  switch (step) {
    case "email":
      return "Enter your account email and we will send a 6-digit code.";
    case "code":
      return `Enter the code we sent to ${email}.`;
    case "password":
      return "Create a new password for your account.";
  }
}

function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStep = (searchParams.get("step") as Step | null) ?? "email";

  const [step, setStep] = useState<Step>(initialStep);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [accountRole, setAccountRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(RESET_EMAIL_KEY);
    if (stored) setEmail(stored);
  }, []);

  const persistEmail = useCallback((value: string) => {
    const normalized = value.trim().toLowerCase();
    sessionStorage.setItem(RESET_EMAIL_KEY, normalized);
    setEmail(normalized);
    return normalized;
  }, []);

  const clearResetSession = useCallback(() => {
    sessionStorage.removeItem(RESET_EMAIL_KEY);
    setResetToken("");
    setCode("");
    setPassword("");
    setConfirmPassword("");
    setAccountRole(null);
  }, []);

  const sendVerificationCode = async () => {
    setLoading(true);
    try {
      const normalized = persistEmail(email);
      const { message } = await forgotPasswordRequest({ email: normalized });
      toast.success(message);
      return true;
    } catch (error) {
      toast.error((error as Error).message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const onRequestCode = async (event: FormEvent) => {
    event.preventDefault();
    const ok = await sendVerificationCode();
    if (ok) setStep("code");
  };

  const onVerifyCode = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const normalized = email.trim().toLowerCase();
      const result = await verifyResetCodeRequest({
        email: normalized,
        code: code.trim(),
      });
      setResetToken(result.resetToken);
      setAccountRole(result.role);
      setStep("password");
      toast.success("Code verified");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await resetPasswordRequest({ resetToken, password });
      clearResetSession();
      toast.success("Password updated. You can sign in now.");
      router.push("/login");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === "code") {
      setStep("email");
      setCode("");
      return;
    }
    if (step === "password") {
      setStep("code");
      setPassword("");
      setConfirmPassword("");
      setResetToken("");
      return;
    }
    router.push("/login");
  };

  return (
    <AuthShell>
      <AuthFormCard>
        <AuthFormHeader
          title={stepTitle(step)}
          description={stepDescription(step, email || "your email")}
        />

        <ResetPasswordStepper current={step} />

          <button
            type="button"
            onClick={goBack}
            className="mb-5 inline-flex items-center gap-1.5 typo-body-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back
          </button>

          {step === "email" ? (
            <form className="flex flex-col gap-5" onSubmit={onRequestCode}>
              <div className="space-y-2">
                <label
                  htmlFor="reset-email"
                  className="block typo-caption font-semibold uppercase tracking-[0.12em] text-slate-400"
                >
                  Email
                </label>
                <Input
                  id="reset-email"
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
              <PricingAccentButton type="submit" loading={loading}>
                Send verification code
              </PricingAccentButton>
            </form>
          ) : null}

          {step === "code" ? (
            <form className="flex flex-col gap-5" onSubmit={onVerifyCode}>
              <div className="space-y-2">
                <label
                  htmlFor="reset-code"
                  className="block typo-caption font-semibold uppercase tracking-[0.12em] text-slate-400"
                >
                  6-digit code
                </label>
                <Input
                  id="reset-code"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  className={cn(authInputClass, "text-center tracking-[0.35em]")}
                  placeholder="000000"
                  type="text"
                  maxLength={6}
                  pattern="\d{6}"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  disabled={loading}
                />
              </div>
              <PricingAccentButton type="submit" loading={loading} disabled={code.length !== 6}>
                Verify code
              </PricingAccentButton>
              <button
                type="button"
                className="typo-body-sm text-slate-400 underline-offset-4 hover:text-white hover:underline"
                disabled={loading}
                onClick={() => void sendVerificationCode()}
              >
                Resend code
              </button>
            </form>
          ) : null}

          {step === "password" ? (
            <form className="flex flex-col gap-5" onSubmit={onResetPassword}>
              {accountRole ? (
                <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 typo-caption text-slate-400">
                  Resetting password for{" "}
                  <span className="font-medium text-white capitalize">{accountRole}</span> account
                </p>
              ) : null}
              <div className="space-y-2">
                <label
                  htmlFor="reset-password"
                  className="block typo-caption font-semibold uppercase tracking-[0.12em] text-slate-400"
                >
                  New password
                </label>
                <Input
                  id="reset-password"
                  autoComplete="new-password"
                  className={authInputClass}
                  placeholder="At least 8 characters"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="reset-password-confirm"
                  className="block typo-caption font-semibold uppercase tracking-[0.12em] text-slate-400"
                >
                  Confirm password
                </label>
                <Input
                  id="reset-password-confirm"
                  autoComplete="new-password"
                  className={authInputClass}
                  placeholder="Repeat password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={loading}
                />
              </div>
              <PricingAccentButton type="submit" loading={loading}>
                Update password
              </PricingAccentButton>
            </form>
          ) : null}

          <p className="mt-8 text-center typo-body-md text-slate-400">
            Remember your password?{" "}
            <Link
              className="font-semibold text-accent underline-offset-4 transition hover:text-white hover:underline"
              href="/login"
            >
              Sign in
            </Link>
          </p>
      </AuthFormCard>
    </AuthShell>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
