"use client";

import { FormEvent, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { readAuthSession } from "@/lib/authCookies";
import { cn } from "@/lib/utils";
import {
  AdminApiError,
  adminBroadcastSms,
  getAdminProfile,
  adminSendTestSms,
  adminUpdatePassword,
  type AdminProfile,
  type AdminBroadcastSmsResponse,
} from "@/lib/api/adminApi";

type SettingsTab = "broadcast" | "profile" | "security";

function SettingsTabs({
  active,
  onChange,
  isHandicapper,
}: {
  active: SettingsTab;
  onChange: (tab: SettingsTab) => void;
  isHandicapper: boolean;
}) {
  const tabs: { id: SettingsTab; label: string }[] = [
    { id: "broadcast", label: "Broadcast" },
    { id: "profile", label: "Profile" },
    { id: "security", label: "Security" },
  ];
  const handicapperTabs: { id: SettingsTab; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "security", label: "Security" },
  ];
  const visibleTabs = isHandicapper ? handicapperTabs : tabs;

  return (
    <nav className="mt-4 flex justify-start gap-8 border-b border-white/10" aria-label="Admin settings sections">
      {visibleTabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative -mb-px cursor-pointer pb-3 text-sm transition-colors",
              isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
            {isActive ? <span className="absolute inset-x-0 bottom-0 h-px bg-white" aria-hidden /> : null}
          </button>
        );
      })}
    </nav>
  );
}

const inputClass =
  "h-11 w-full rounded-md border border-white/10 bg-[#131313] px-4 text-white outline-none transition focus:border-white/25";

const textareaClass =
  "min-h-32 w-full rounded-md border border-white/10 bg-[#131313] px-4 py-3 text-white outline-none transition focus:border-white/25";

export function AdminSettingsSmsForm() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<SettingsTab>("broadcast");
  const [isHandicapper, setIsHandicapper] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [message, setMessage] = useState(
    "Picks are now live on the site. Please log in to your dashboard to view them: https://smartedgepicks.com/"
  );
  const [testNumber, setTestNumber] = useState("");
  const [delayMs, setDelayMs] = useState("1500");
  const [sendingTest, setSendingTest] = useState(false);
  const [sendingBulk, setSendingBulk] = useState(false);
  const [bulkResult, setBulkResult] = useState<AdminBroadcastSmsResponse | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const role = readAuthSession()?.role;
    if (role === "handicapper") {
      setIsHandicapper(true);
      setTab("profile");
    }
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (isHandicapper && tabParam === "broadcast") return;
    if (tabParam === "profile" || tabParam === "security" || tabParam === "broadcast") {
      setTab(tabParam);
    }
  }, [searchParams, isHandicapper]);

  useEffect(() => {
    let cancelled = false;
    setProfileLoading(true);
    getAdminProfile()
      .then((res) => {
        if (!cancelled) setProfile(res.admin);
      })
      .catch((error) => {
        if (!cancelled) {
          toast.error(
            error instanceof AdminApiError
              ? error.message
              : error instanceof Error
                ? error.message
                : "Failed to load profile"
          );
        }
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const onSendTest = async (event: FormEvent) => {
    event.preventDefault();
    setSendingTest(true);
    try {
      const result = await adminSendTestSms({
        phoneNumber: testNumber.trim(),
        message: message.trim(),
      });
      toast.success(`Test SMS sent to ${result.to}`);
    } catch (error) {
      toast.error(
        error instanceof AdminApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Failed to send test SMS"
      );
    } finally {
      setSendingTest(false);
    }
  };

  const onSendBroadcast = async () => {
    setSendingBulk(true);
    setBulkResult(null);
    try {
      const parsedDelay = Number.parseInt(delayMs, 10);
      const result = await adminBroadcastSms({
        message: message.trim(),
        delayMs: Number.isFinite(parsedDelay) ? parsedDelay : undefined,
      });
      setBulkResult(result);
      toast.success(`Broadcast complete: ${result.sent} sent, ${result.failed} failed`);
    } catch (error) {
      toast.error(
        error instanceof AdminApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Failed to broadcast SMS"
      );
    } finally {
      setSendingBulk(false);
    }
  };

  const onUpdatePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Confirm password does not match");
      return;
    }

    setUpdatingPassword(true);
    try {
      const result = await adminUpdatePassword({
        currentPassword,
        newPassword,
      });
      toast.success(result.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(
        error instanceof AdminApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Failed to update password"
      );
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-4xl text-left">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Settings</h1>
        <SettingsTabs active={tab} onChange={setTab} isHandicapper={isHandicapper} />
      </div>

      {tab === "profile" ? (
        <div className="mx-auto mt-16 grid w-full max-w-4xl grid-cols-1 gap-8">
          <section className="rounded-xl border border-white/10 bg-black/20 p-6">
            <h2 className="text-lg font-semibold text-white">Profile Info</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Account details for your admin/handicapper profile.
            </p>
            {profileLoading ? (
              <p className="mt-4 text-sm text-zinc-500">Loading profile...</p>
            ) : profile ? (
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs text-zinc-500">Name</p>
                  <p className="mt-1 text-sm text-white">{profile.name}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Email</p>
                  <p className="mt-1 text-sm text-white">{profile.email}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Role</p>
                  <p className="mt-1 text-sm capitalize text-white">{profile.role}</p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-zinc-500">Profile not available.</p>
            )}
          </section>
        </div>
      ) : tab === "security" ? (
        <div className="mx-auto mt-16 grid w-full max-w-4xl grid-cols-1 gap-8">
          <section className="rounded-xl border border-white/10 bg-black/20 p-6">
            <h2 className="text-lg font-semibold text-white">Update Password</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Change your current admin/handicapper password after login.
            </p>
            <form onSubmit={onUpdatePassword} className="mt-4 grid gap-4 md:max-w-xl">
              <div>
                <label htmlFor="admin-current-password" className="mb-2 block text-sm text-zinc-300">
                  Current password
                </label>
                <div className="relative">
                  <input
                    id="admin-current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    className={`${inputClass} pr-11`}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((v) => !v)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                    aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                  >
                    {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="admin-new-password" className="mb-2 block text-sm text-zinc-300">
                  New password
                </label>
                <div className="relative">
                  <input
                    id="admin-new-password"
                    type={showNewPassword ? "text" : "password"}
                    className={`${inputClass} pr-11`}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="admin-confirm-password" className="mb-2 block text-sm text-zinc-300">
                  Confirm new password
                </label>
                <div className="relative">
                  <input
                    id="admin-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    className={`${inputClass} pr-11`}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="h-11 rounded-md bg-white px-5 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updatingPassword ? "Updating..." : "Update password"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : (
        <div className="mx-auto mt-16 grid w-full max-w-4xl grid-cols-1 gap-8">
          <section className="rounded-xl border border-white/10 bg-black/20 p-6">
            <h2 className="text-lg font-semibold text-white">SMS Message Template</h2>
            <p className="mt-1 text-sm text-zinc-400">
              This message is used for both test and broadcast SMS sends.
            </p>
            <div className="mt-4">
              <label htmlFor="admin-sms-message" className="mb-2 block text-sm text-zinc-300">
                Message
              </label>
              <textarea
                id="admin-sms-message"
                className={textareaClass}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-black/20 p-6">
            <h2 className="text-lg font-semibold text-white">Test SMS</h2>
            <p className="mt-1 text-sm text-zinc-400">Send to one number to confirm delivery.</p>
            <form onSubmit={onSendTest} className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <label htmlFor="admin-test-number" className="mb-2 block text-sm text-zinc-300">
                  Phone number (E.164)
                </label>
                <input
                  id="admin-test-number"
                  className={inputClass}
                  value={testNumber}
                  onChange={(e) => setTestNumber(e.target.value)}
                  placeholder="+923001234567"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={sendingTest}
                className="h-11 rounded-md bg-white px-5 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sendingTest ? "Sending..." : "Send test SMS"}
              </button>
            </form>
          </section>

          <section className="rounded-xl border border-white/10 bg-black/20 p-6">
            <h2 className="text-lg font-semibold text-white">Broadcast SMS to All Users</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Sends to all users with phone numbers and waits between messages.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-[220px_auto] md:items-end">
              <div>
                <label htmlFor="admin-delay-ms" className="mb-2 block text-sm text-zinc-300">
                  Delay between SMS (ms)
                </label>
                <input
                  id="admin-delay-ms"
                  className={inputClass}
                  value={delayMs}
                  onChange={(e) => setDelayMs(e.target.value)}
                  inputMode="numeric"
                  placeholder="1500"
                />
              </div>
              <button
                type="button"
                onClick={onSendBroadcast}
                disabled={sendingBulk}
                className="h-11 rounded-md bg-white px-5 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sendingBulk ? "Broadcasting..." : "Send to all users"}
              </button>
            </div>

            {bulkResult ? (
              <div className="mt-5 rounded-md border border-white/10 bg-white/5 p-4 text-sm text-zinc-200">
                <p>Attempted: {bulkResult.attempted}</p>
                <p>Sent: {bulkResult.sent}</p>
                <p>Failed: {bulkResult.failed}</p>
                <p>Skipped: {bulkResult.skipped}</p>
                {bulkResult.failed > 0 ? (
                  <p className="mt-2 text-zinc-400">
                    Some numbers failed. Check backend logs / API response for details.
                  </p>
                ) : null}
              </div>
            ) : null}
          </section>
        </div>
      )}
    </div>
  );
}

