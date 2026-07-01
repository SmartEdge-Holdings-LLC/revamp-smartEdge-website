import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardBilling } from "@/components/billing/DashboardBilling";
import { Subscription } from "@/types";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

async function getSubscription(token: string): Promise<Subscription> {
  const response = await fetch(`${backendUrl}/api/stripe/subscription`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data.subscription;
}

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.backendToken) redirect("/login");

  const subscription = await getSubscription(session.user.backendToken);

  return (
    <>
      <DashboardHeader />
      <div className="min-w-0 flex-1 overflow-x-hidden px-4 py-8 md:px-8 lg:px-12">
        <DashboardBilling subscription={subscription} brandSubscriptions={session.user.brandSubscriptions} />
      </div>
    </>
  );
}
