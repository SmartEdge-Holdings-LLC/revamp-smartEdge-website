import type { Metadata } from "next";
import { LandingSubpageLayout } from "@/components/landing/LandingSubpageLayout";

export const metadata: Metadata = {
  title: "Terms of Service | SmartEdgePicks",
  description: "SmartEdgePicks terms of service. Read our terms, conditions, and disclaimers for using our sports picks service.",
  alternates: {
    canonical: "https://www.smartedgepicks.com/legal/terms-of-service",
  },
};

export default function TermsOfServicePage() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });

  const tableOfContents = [
    "Acceptance of Terms",
    "Service Description",
    "User Responsibilities",
    "Intellectual Property and Trademarks",
    "Disclaimer of Warranties",
    "Limitation of Liability",
    "Third-Party Links",
    "Betting Picks Disclaimer",
    "Communications",
    "Affiliate Marketing Transparency",
    "Governing Law",
    "Refund Policy",
    "Changes to Terms",
    "Changes to Our Privacy Policy",
    "Contact Us",
  ];

  return (
    <LandingSubpageLayout>
      <section className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-24">
          {/* Centered Header */}
          <div className="mb-16 text-center">
            <h1 className="font-display text-5xl font-bold tracking-tight sm:text-6xl">
              Terms of Service
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
              <div id="section-0">
                <h2 className="mb-4 text-xl font-semibold tracking-tight">
                  Overview
                </h2>
                <p className="leading-relaxed text-subtle">
                  Welcome to SmartEdge™ Picks. By accessing and using our website,
                  services, or any applications made available by SmartEdge Picks
                  (collectively, the "Service"), you agree to be bound by these Terms
                  of Service ("Terms"). SmartEdge Picks is a trade name of SmartEdge
                  Holdings LLC, SmartEdge™ is a pending trademark of SmartEdge Holdings
                  LLC, and the Service is provided to you subject to the following
                  conditions. If you disagree with any part of the terms, you must
                  discontinue using our Service.
                </p>
              </div>

              {/* Section 1 */}
              <div id="section-1">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  1. Acceptance of Terms
                </h3>
                <p className="leading-relaxed text-subtle">
                  By using our Service, you signify your agreement to these Terms,
                  our Privacy Policy, and any other legal notices published by us on
                  the Service. SmartEdge Picks reserves the right to make changes to
                  these Terms at any time. Your continued use of the Service after
                  any such changes signifies your acceptance of the updated Terms.
                </p>
              </div>

              {/* Section 2 */}
              <div id="section-2">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  2. Service Description
                </h3>
                <p className="leading-relaxed text-subtle">
                  SmartEdge™ Picks provides sports betting picks and predictions.
                  While we strive for accuracy, we cannot guarantee the correctness
                  of our content. Our Service is for informational and entertainment
                  purposes only, and we do not condone illegal or underage gambling.
                </p>
              </div>

              {/* Section 3 */}
              <div id="section-3">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  3. User Responsibilities
                </h3>
                <p className="leading-relaxed text-subtle">
                  You are responsible for ensuring that gambling is legal in your
                  jurisdiction. You must be at least 21 years of age to use our
                  Service. It is your responsibility to ensure that your use of
                  SmartEdge Picks' Service complies with all applicable laws and
                  regulations.
                </p>
              </div>

              {/* Section 4 */}
              <div id="section-4">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  4. Intellectual Property and Trademarks
                </h3>
                <p className="leading-relaxed text-subtle">
                  All content available through the Service, including but not
                  limited to text, graphics, logos, images, and compilations thereof,
                  is the property of SmartEdge Holdings LLC or its licensors and is
                  protected by copyright and trademark laws. "SmartEdge™" is a
                  trademark (pending) of SmartEdge Holdings LLC. Unauthorized use of
                  the trademark, the Service's content, or any portion thereof,
                  without the express written permission of SmartEdge Holdings LLC, is
                  strictly prohibited and may violate copyright and trademark laws.
                </p>
              </div>

              {/* Section 5 */}
              <div id="section-5">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  5. Disclaimer of Warranties
                </h3>
                <p className="leading-relaxed text-subtle">
                  The Service is provided on an "as is" and "as available" basis.
                  SmartEdge Picks expressly disclaims all warranties of any kind,
                  whether express or implied. We do not guarantee that our Service
                  will be uninterrupted, timely, secure, or error-free.
                </p>
              </div>

              {/* Section 6 */}
              <div id="section-6">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  6. Limitation of Liability
                </h3>
                <p className="leading-relaxed text-subtle">
                  SmartEdge Picks shall not be liable for any direct, indirect,
                  incidental, special, consequential, or exemplary damages resulting
                  from your use of the Service.
                </p>
              </div>

              {/* Section 7 */}
              <div id="section-7">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  7. Third-Party Links
                </h3>
                <p className="leading-relaxed text-subtle">
                  Our Service may contain links to third-party websites or services.
                  We are not responsible for the content, privacy policies, or
                  practices of any third-party sites.
                </p>
              </div>

              {/* Section 8 */}
              <div id="section-8">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  8. Betting Picks Disclaimer
                </h3>
                <p className="leading-relaxed text-subtle">
                  Betting picks and advice are provided without guarantee of profit.
                  Use this advice at your own risk. SmartEdge Picks assumes no
                  responsibility for losses incurred due to betting or gambling
                  activities based on information obtained from our Service.
                </p>
              </div>

              {/* Section 9 */}
              <div id="section-9">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  9. Communications
                </h3>
                <p className="leading-relaxed text-subtle">
                  By subscribing to our newsletter, you agree to receive emails from
                  SmartEdge™ Picks. You can unsubscribe at any time via the link
                  provided in each newsletter.
                </p>
              </div>

              {/* Section 10 */}
              <div id="section-10">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  10. Affiliate Marketing Transparency
                </h3>
                <p className="leading-relaxed text-subtle">
                  SmartEdge™ Picks participates in affiliate marketing programs.
                  While we may receive commissions for referrals to third-party
                  services, our content and picks are based on objective analysis and
                  research.
                </p>
              </div>

              {/* Section 11 */}
              <div id="section-11">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  11. Governing Law
                </h3>
                <div className="space-y-3 leading-relaxed text-subtle">
                  <p>
                    These Terms of Service and any separate agreements whereby we
                    provide you Services shall be governed by and construed in
                    accordance with the laws of the State of Colorado, without regard
                    to its conflict of law provisions.
                  </p>
                  <p>
                    Despite SmartEdge Picks being a Delaware Limited Liability
                    Company (LLC), for the purposes of any legal matters arising from
                    or related to the use of the Service, jurisdiction and venue
                    shall be exclusively in the state and federal courts located in
                    Colorado. By using the Service, you consent to the jurisdiction
                    and venue of such courts and waive any objections as to
                    inconvenient forum.
                  </p>
                  <p>
                    This choice of jurisdiction does not prevent SmartEdge Holdings
                    LLC from seeking injunctive relief in any jurisdiction in the case
                    of copyright or trademark infringement.
                  </p>
                  <p>
                    Your use of the Service is unauthorized in any jurisdiction that
                    does not give effect to all provisions of these Terms, including,
                    without limitation, this section.
                  </p>
                </div>
              </div>

              {/* Section 12 */}
              <div id="section-12">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  12. Refund Policy
                </h3>
                <p className="leading-relaxed text-subtle">
                  We do not offer refunds for our services. However, customers can
                  cancel or pause their subscription at any time. For more details,
                  please refer to our Refund Policy page.
                </p>
              </div>

              {/* Section 13 */}
              <div id="section-13">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  13. Changes to Terms
                </h3>
                <p className="leading-relaxed text-subtle">
                  SmartEdge™ Picks reserves the right, at our sole discretion, to
                  modify or replace these Terms at any time.
                </p>
              </div>

              {/* Section 14 */}
              <div id="section-14">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  14. Changes to Our Privacy Policy
                </h3>
                <p className="leading-relaxed text-subtle">
                  Any changes we may make to our privacy policy in the future will be
                  posted on this page and, where appropriate, notified to you by
                  e-mail. Please check back frequently to see any updates or changes
                  to our privacy policy.
                </p>
              </div>

              {/* Contact Section */}
              <div id="section-15">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  Contact Us
                </h3>
                <p className="leading-relaxed text-subtle">
                  If you have any questions about these Terms, please contact us.
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

                <div className="pt-6 border-t border-subtle">
                 
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </LandingSubpageLayout>
  );
}
