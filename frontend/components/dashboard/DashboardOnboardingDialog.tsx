"use client";

import { FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { MapPin, MessageCircle, Phone, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AccentIconBadge } from "@/components/landing/AccentIconBadge";
import { PricingAccentButton } from "@/components/pricing/PricingAccentButton";
import { Input } from "@/components/ui/input";
import { resolveMemberOnboarding } from "@/lib/onboarding";
import {
  profileInputClass,
  profileLabelClass,
  type ProfileFormValues,
} from "@/lib/profile-form-ui";
import { mapBackendMemberToSessionUser, type BackendMemberUser } from "@/types/member-session";

const emptyForm: Omit<ProfileFormValues, "name"> = {
  address: "",
  city: "",
  state: "",
  zip: "",
  country: "",
  phoneNumber: "",
  discordUsername: "",
};

type DashboardOnboardingDialogProps = {
  open: boolean;
};

export function DashboardOnboardingDialog({ open }: DashboardOnboardingDialogProps) {
  const { data: session, update } = useSession();
  const [form, setForm] = useState<Omit<ProfileFormValues, "name">>(emptyForm);
  const [loading, setLoading] = useState(false);

  const token = session?.user?.backendToken;
  const onboardingComplete = session?.user
    ? resolveMemberOnboarding(session.user)
    : false;

  const dialogOpen = open && !onboardingComplete;

  if (!token) return null;

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
      await update({
        user: mapBackendMemberToSessionUser(user as BackendMemberUser, token),
      });
      toast.success("Profile saved — you're all set!");
    } catch (error) {
      toast.error((error as Error).message || "Could not save profile");
    } finally {
      setLoading(false);
    }
  };

  const set =
    (key: keyof Omit<ProfileFormValues, "name">) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(next) => {
        if (!next && !onboardingComplete) return;
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-h-[min(90vh,820px)] gap-0 overflow-y-auto border-white/12 bg-[#0a0a0a] p-0 text-slate-100 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.08),0_24px_80px_-32px_rgb(0_0_0/0.85)] backdrop-blur-2xl sm:max-w-2xl"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="border-b border-white/10 bg-white/3 px-6 py-5 text-left">
          <div className="flex items-start gap-3 pr-2">
            <AccentIconBadge icon={Sparkles} />
            <div className="min-w-0">
              <DialogTitle className="text-lg font-medium tracking-tight text-white">
                Complete your profile
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm leading-relaxed text-subtle">
                Add your contact and location details so we can personalize picks and member
                support. This only takes a minute.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form className="space-y-6 px-6 py-6" onSubmit={onSubmit}>
          <fieldset className="space-y-4">
            <legend className="flex items-center gap-2 text-sm font-semibold text-white">
              <MapPin className="h-4 w-4 text-accent" aria-hidden />
              Location
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2 sm:col-span-2">
                <span className={profileLabelClass}>Street address</span>
                <Input
                  className={profileInputClass}
                  value={form.address}
                  onChange={set("address")}
                  required
                  autoComplete="street-address"
                  placeholder="123 Main St"
                />
              </label>
              <label className="block space-y-2">
                <span className={profileLabelClass}>City</span>
                <Input
                  className={profileInputClass}
                  value={form.city}
                  onChange={set("city")}
                  required
                  autoComplete="address-level2"
                />
              </label>
              <label className="block space-y-2">
                <span className={profileLabelClass}>State / Province</span>
                <Input
                  className={profileInputClass}
                  value={form.state}
                  onChange={set("state")}
                  required
                  autoComplete="address-level1"
                />
              </label>
              <label className="block space-y-2">
                <span className={profileLabelClass}>ZIP / Postal code</span>
                <Input
                  className={profileInputClass}
                  value={form.zip}
                  onChange={set("zip")}
                  required
                  autoComplete="postal-code"
                />
              </label>
              <label className="block space-y-2">
                <span className={profileLabelClass}>Country</span>
                <Input
                  className={profileInputClass}
                  value={form.country}
                  onChange={set("country")}
                  required
                  autoComplete="country-name"
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-white">Contact</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className={`flex items-center gap-1.5 ${profileLabelClass}`}>
                  <Phone className="h-3.5 w-3.5 text-accent" aria-hidden />
                  Phone number
                </span>
                <Input
                  className={profileInputClass}
                  type="tel"
                  value={form.phoneNumber}
                  onChange={set("phoneNumber")}
                  required
                  autoComplete="tel"
                  placeholder="+1 555 000 0000"
                />
              </label>
              <label className="block space-y-2">
                <span className={`flex items-center gap-1.5 ${profileLabelClass}`}>
                  <MessageCircle className="h-3.5 w-3.5 text-accent" aria-hidden />
                  Discord username
                </span>
                <Input
                  className={profileInputClass}
                  value={form.discordUsername}
                  onChange={set("discordUsername")}
                  required
                  placeholder="username"
                />
              </label>
            </div>
          </fieldset>

          <PricingAccentButton type="submit" loading={loading} disabled={loading}>
            Save & continue
          </PricingAccentButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
