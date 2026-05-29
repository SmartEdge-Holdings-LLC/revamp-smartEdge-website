"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ProfileField } from "@/components/dashboard/ProfileField";
import {
  profileFormFromUser,
  type ProfileFormValues,
} from "@/lib/profile-form-ui";
import { mapBackendMemberToSessionUser, type BackendMemberUser } from "@/types/member-session";

type SettingsTab = "user" | "security";

type DashboardSettingsProfileFormProps = {
  initialUser: BackendMemberUser;
};

function ProfileTabs({
  active,
  onChange,
}: {
  active: SettingsTab;
  onChange: (tab: SettingsTab) => void;
}) {
  const tabs: { id: SettingsTab; label: string }[] = [
    { id: "user", label: "Personal information" },
    { id: "security", label: "Security" },
  ];

  return (
    <nav
      className="mt-4 flex justify-start gap-8 border-b border-white/10"
      aria-label="Profile sections"
    >
      {tabs.map((tab) => {
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
            {isActive ? (
              <span className="absolute inset-x-0 bottom-0 h-px bg-white" aria-hidden />
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}

export function DashboardSettingsProfileForm({ initialUser }: DashboardSettingsProfileFormProps) {
  const { data: session, update } = useSession();
  const [tab, setTab] = useState<SettingsTab>("user");
  const [form, setForm] = useState<ProfileFormValues>(() => profileFormFromUser(initialUser));
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const set =
    (key: keyof ProfileFormValues) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not save profile");

      const user = data.user as BackendMemberUser;
      const token = session?.user?.backendToken;
      if (token) {
        await update({
          user: mapBackendMemberToSessionUser(user, token),
        });
      }
      setForm(profileFormFromUser(user));
      toast.success("Profile saved");
    } catch (error) {
      toast.error((error as Error).message || "Could not save profile");
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Confirm password does not match");
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await fetch("/api/user/password/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not update password");

      toast.success(data.message ?? "Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error((error as Error).message || "Could not update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-4xl text-left">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Profile</h1>
        <ProfileTabs active={tab} onChange={setTab} />
      </div>

      {tab === "security" ? (
        <form onSubmit={onPasswordSubmit} className="mx-auto mt-16 grid w-full max-w-xl gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-300" htmlFor="current-password">
              Current password
            </label>
            <div className="relative">
              <input
                id="current-password"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="h-11 w-full rounded-md border border-white/10 bg-[#131313] px-4 pr-11 text-white outline-none transition focus:border-white/25"
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

          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-300" htmlFor="new-password">
              New password
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
                className="h-11 w-full rounded-md border border-white/10 bg-[#131313] px-4 pr-11 text-white outline-none transition focus:border-white/25"
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

          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-300" htmlFor="confirm-password">
              Confirm new password
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
                className="h-11 w-full rounded-md border border-white/10 bg-[#131313] px-4 pr-11 text-white outline-none transition focus:border-white/25"
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

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={passwordLoading}
              className="w-fit cursor-pointer rounded-md bg-white px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {passwordLoading ? "Updating…" : "Update password"}
            </button>
          </div>
        </form>
      ) : (
        <form
          onSubmit={onSubmit}
          className="mx-auto mt-16 grid w-full max-w-4xl grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2"
        >
          <ProfileField
            id="profile-name"
            label="Name"
            hint="The name associated with this account"
            value={form.name}
            onChange={set("name")}
            required
            minLength={2}
            autoComplete="name"
          />

          <ProfileField
            id="profile-email"
            label="Email address"
            hint="The email address associated with this account"
            value={initialUser.email}
            disabled
            autoComplete="email"
          />

          <ProfileField
            id="profile-phone"
            label="Phone number"
            hint="The phone number associated with this account"
            type="tel"
            value={form.phoneNumber}
            onChange={set("phoneNumber")}
            required
            autoComplete="tel"
          />

          <ProfileField
            id="profile-discord"
            label="Discord username"
            hint="Your Discord handle for community and pick alerts"
            value={form.discordUsername}
            onChange={set("discordUsername")}
            required
            placeholder="username"
          />

          <div className="md:col-span-2">
            <ProfileField
              id="profile-address"
              label="Street address"
              hint="The street address associated with this account"
              value={form.address}
              onChange={set("address")}
              required
              autoComplete="street-address"
            />
          </div>

          <ProfileField
            id="profile-city"
            label="City"
            hint="The city associated with this account"
            value={form.city}
            onChange={set("city")}
            required
            autoComplete="address-level2"
          />

          <ProfileField
            id="profile-state"
            label="State / province"
            hint="The state or province associated with this account"
            value={form.state}
            onChange={set("state")}
            required
            autoComplete="address-level1"
          />

          <ProfileField
            id="profile-zip"
            label="ZIP / postal code"
            hint="The postal code associated with this account"
            value={form.zip}
            onChange={set("zip")}
            required
            autoComplete="postal-code"
          />

          <ProfileField
            id="profile-country"
            label="Country"
            hint="The country associated with this account"
            value={form.country}
            onChange={set("country")}
            required
            autoComplete="country-name"
          />

          <div className="flex justify-center md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-fit rounded-md bg-white px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
