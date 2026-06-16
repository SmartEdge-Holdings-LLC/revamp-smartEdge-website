import { LandingSubpageLayout } from "@/components/landing/LandingSubpageLayout";

export default function RefundPolicyPage() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });

  const tableOfContents = [
    "Overview",
    "No Refunds",
    "Cancellation Policy",
    "Pausing Your Subscription",
    "Contact Us",
  ];

  return (
    <LandingSubpageLayout>
      <section className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-24">
          {/* Centered Header */}
          <div className="mb-16 text-center">
            <h1 className="font-display text-5xl font-bold tracking-tight sm:text-6xl">
              Refund Policy
            </h1>
            <p className="mt-4 text-sm text-subtle">
              Effective Date: {currentDate}
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Main Content - Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Overview */}
              <div id="section-1">
                <h2 className="mb-4 text-xl font-semibold tracking-tight">
                  Overview
                </h2>
                <p className="leading-relaxed text-subtle">
                  At SmartEdge™ Picks, we value our customers and strive to provide
                  the best possible service. Please read our refund policy carefully
                  to understand our practices regarding subscriptions and
                  cancellations.
                </p>
              </div>

              {/* Section 1 */}
              <div id="section-2">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  1. No Refunds
                </h3>
                <p className="leading-relaxed text-subtle">
                  SmartEdge™ Picks does not offer refunds for any of our services.
                  This policy applies to all subscription plans.
                </p>
              </div>

              {/* Section 2 */}
              <div id="section-3">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  2. Cancellation Policy
                </h3>
                <p className="leading-relaxed text-subtle">
                  Customers can cancel their subscription at any time. When you
                  cancel, your subscription will end and your subscription will not
                  be renewed, and you will not be charged again. To cancel your
                  subscription, please follow the instructions provided in your
                  account settings or contact our support team for assistance.
                </p>
              </div>

              {/* Section 3 */}
              <div id="section-4">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  3. Pausing Your Subscription
                </h3>
                <p className="leading-relaxed text-subtle">
                  If you need to take a break, you have the option to pause your
                  subscription. During the pause period, you will not have access to
                  our services, and you will not be billed. You can resume your
                  subscription at any time by logging into your account and
                  reactivating your subscription. For assistance with pausing or
                  resuming your subscription, please contact our support team.
                </p>
              </div>

              {/* Contact Section */}
              <div id="section-5">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  4. Contact Us
                </h3>
                <p className="leading-relaxed text-subtle">
                  If you have any questions or need further assistance regarding our
                  refund and cancellation policy, please contact us.
                </p>
              </div>
            </div>

            {/* Sidebar - Right Column */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                <div>
                  <h3 className="mb-4 text-lg font-semibold">Table of contents</h3>
                  <ol className="space-y-2 text-sm text-subtle">
                    {tableOfContents.map((item, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="shrink-0">{index + 1}.</span>
                        <a
                          href={`#section-${index + 1}`}
                          className="hover:text-orange-500 transition-colors duration-200 underline"
                        >
                          {item}
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </LandingSubpageLayout>
  );
}
