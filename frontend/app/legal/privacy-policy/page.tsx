import type { Metadata } from "next";
import { LandingSubpageLayout } from "@/components/landing/LandingSubpageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy | SmartEdgePicks",
  description: "Read SmartEdgePicks privacy policy. Learn how we collect, use, and protect your personal data.",
  alternates: {
    canonical: "https://www.smartedgepicks.com/legal/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });

  const tableOfContents = [
    "Important Information and Who We Are",
    "The Data We Collect About You",
    "How We Use Your Personal Data",
    "Disclosures of Your Personal Data",
    "International Transfers",
    "Data Security",
    "Data Retention",
    "Your Legal Rights",
    "California Consumer Privacy Act (CCPA) Rights and Choices",
    "Trademark Notice",
    "GDPR Rights for EU Residents",
    "How to Exercise Your Rights",
    "Changes to Our Privacy Policy",
    "Complaints",
    "Additional Information for EU Residents",
    "California Residents",
    "Updates to This Policy",
  ];

  return (
    <LandingSubpageLayout>
      <section className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-24">
          {/* Centered Header */}
          <div className="mb-16 text-center">
            <h1 className="font-display text-5xl font-bold tracking-tight sm:text-6xl">
              Privacy Policy
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
                  SmartEdge Picks, a trade name of SmartEdge Holdings LLC, respects
                  your privacy and is committed to protecting your personal data.
                  SmartEdge™ is dedicated to transparency in how we collect, use, and
                  share your information. This privacy policy will inform you as to how
                  we look after your personal data when you visit our website
                  (smartedgepicks.com), use our services, or participate in our sports
                  betting picks and predictions services. It also tells you about your
                  privacy rights and how the law protects you.
                </p>
              </div>

              {/* Section 1 */}
              <div id="section-1">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  1. Important Information and Who We Are
                </h3>
                <div className="space-y-3 leading-relaxed text-subtle">
                  <div>
                    <h4 className="font-semibold">Purpose of This Privacy Policy</h4>
                    <p>
                      This privacy policy aims to give you information on how SmartEdge
                      Picks collects and processes your personal data through your use
                      of this website, including any data you may provide through this
                      website when you sign up for our newsletter, purchase a
                      membership, or participate in our services.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Controller</h4>
                    <p>
                      SmartEdge Holdings LLC is the controller and responsible for your
                      personal data (collectively referred to as "SmartEdge Picks",
                      "SmartEdge", "we", "us", or "our" in this privacy policy).
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Contact Details</h4>
                    <p className="mb-2">Our full details are:</p>
                    <ul className="list-inside space-y-1 text-sm">
                      <li>
                        Full name of legal entity: SmartEdge Holdings LLC
                      </li>
                      <li>Email address: contact us</li>
                      <li>
                        Postal address: 4833 Front Street Ste B, Castle Rock, CO 80104
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold">Changes to the Privacy Policy</h4>
                    <p>
                      We keep our privacy policy under regular review. It is important
                      that the personal data we hold about you is accurate and current.
                      Please keep us informed if your personal data changes during your
                      relationship with us.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2 */}
              <div id="section-2">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  2. The Data We Collect About You
                </h3>
                <p className="mb-4 leading-relaxed text-subtle">
                  We may collect, use, store, and transfer different kinds of personal
                  data about you which we have grouped together as follows:
                </p>
                <ul className="space-y-3 text-subtle">
                  <li>
                    <span className="font-semibold">Identity Data</span> includes first
                    name, last name, username or similar identifier.
                  </li>
                  <li>
                    <span className="font-semibold">Contact Data</span> includes billing
                    address, delivery address, email address, and telephone numbers.
                  </li>
                  <li>
                    <span className="font-semibold">Financial Data</span> includes
                    payment card details.
                  </li>
                  <li>
                    <span className="font-semibold">Transaction Data</span> includes
                    details about payments to and from you and other details of products
                    and services you have purchased from us.
                  </li>
                  <li>
                    <span className="font-semibold">Technical Data</span> includes
                    internet protocol (IP) address, your login data, browser type and
                    version, time zone setting and location, browser plug-in types and
                    versions, operating system and platform, and other technology on the
                    devices you use to access this website.
                  </li>
                  <li>
                    <span className="font-semibold">Profile Data</span> includes your
                    username and password, purchases or orders made by you, your
                    interests, preferences, feedback, and survey responses.
                  </li>
                  <li>
                    <span className="font-semibold">Usage Data</span> includes
                    information about how you use our website, products, and services.
                  </li>
                  <li>
                    <span className="font-semibold">Marketing and Communications Data</span> includes
                    your preferences in receiving marketing from us and our third
                    parties and your communication preferences.
                  </li>
                </ul>
              </div>

              {/* Section 3 */}
              <div id="section-3">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  3. How We Use Your Personal Data
                </h3>
                <p className="mb-4 leading-relaxed text-subtle">
                  We will only use your personal data when the law allows us to. Most
                  commonly, we will use your personal data in the following
                  circumstances:
                </p>
                <ul className="space-y-2 list-inside text-subtle">
                  <li>
                    Where we need to perform the contract we are about to enter into or
                    have entered into with you.
                  </li>
                  <li>
                    Where it is necessary for our legitimate interests (or those of a
                    third party) and your interests and fundamental rights do not
                    override those interests.
                  </li>
                  <li>Where we need to comply with a legal obligation.</li>
                </ul>
              </div>

              {/* Section 4 */}
              <div id="section-4">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  4. Disclosures of Your Personal Data
                </h3>
                <p className="leading-relaxed text-subtle">
                  We may share your personal data with external third parties, including
                  service providers acting as processors based in the United States, EU,
                  North America, and/or Asia who provide IT and system administration
                  services, professional advisers, including lawyers, bankers, auditors,
                  and insurers, and regulatory authorities.
                </p>
              </div>

              {/* Section 5 */}
              <div id="section-5">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  5. International Transfers
                </h3>
                <p className="leading-relaxed text-subtle">
                  We may transfer your personal data outside the European Economic Area
                  (EEA) to ensure the seamless provision of our services to you.
                  Whenever we transfer your personal data out of the EEA, we ensure a
                  similar degree of protection is afforded to it.
                </p>
              </div>

              {/* Section 6 */}
              <div id="section-6">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  6. Data Security
                </h3>
                <p className="leading-relaxed text-subtle">
                  We have put in place appropriate security measures to prevent your
                  personal data from being accidentally lost, used, or accessed in an
                  unauthorized way, altered, or disclosed.
                </p>
              </div>

              {/* Section 7 */}
              <div id="section-7">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  7. Data Retention
                </h3>
                <p className="leading-relaxed text-subtle">
                  We will only retain your personal data for as long as necessary to
                  fulfill the purposes we collected it for, including for the purposes
                  of satisfying any legal, accounting, or reporting requirements.
                </p>
              </div>

              {/* Section 8 */}
              <div id="section-8">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  8. Your Legal Rights
                </h3>
                <p className="leading-relaxed text-subtle">
                  Under certain circumstances, you have rights under data protection
                  laws in relation to your personal data, including the right to access,
                  correct, erase, restrict or object to processing, and port your data.
                </p>
              </div>

              {/* Section 9 */}
              <div id="section-9">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  9. California Consumer Privacy Act (CCPA) Rights and Choices
                </h3>
                <p className="leading-relaxed text-subtle">
                  If you are a resident of California, you have specific rights regarding
                  access to your personal information, as well as the right to request
                  that we delete any of your personal information subject to certain
                  exceptions.
                </p>
              </div>

              {/* Section 10 */}
              <div id="section-10">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  10. Trademark Notice
                </h3>
                <p className="leading-relaxed text-subtle">
                  SmartEdge™ is a pending trademark of SmartEdge Holdings LLC. The
                  trademark applies to the name SmartEdge™ and any associated logos or
                  images used by SmartEdge Picks. Unauthorized use of the trademark,
                  name, logos, or images is prohibited and may constitute infringement
                  of our trademark rights.
                </p>
              </div>

              {/* Section 11 */}
              <div id="section-11">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  11. GDPR Rights for EU Residents
                </h3>
                <p className="leading-relaxed text-subtle">
                  If you are a resident of the European Union, you have rights under the
                  General Data Protection Regulation (GDPR) regarding the processing of
                  your personal data.
                </p>
              </div>

              {/* Section 12 */}
              <div id="section-12">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  12. How to Exercise Your Rights
                </h3>
                <div className="space-y-3 leading-relaxed text-subtle">
                  <p>
                    To exercise your rights under the CCPA, GDPR, or any other data
                    protection laws, please submit a verifiable consumer request to us
                    by either:
                  </p>
                  <ul className="list-inside space-y-1">
                    <li>Emailing: contact us</li>
                    <li>
                      Sending a Letter to our Postal Address (see above), Attn: Privacy
                      Compliance Officer
                    </li>
                  </ul>
                  <p>
                    You will not have to pay a fee to access your personal data (or to
                    exercise any of the other rights). However, we may charge a
                    reasonable fee if your request is clearly unfounded, repetitive, or
                    excessive. Alternatively, we may refuse to comply with your request
                    in these circumstances.
                  </p>
                </div>
              </div>

              {/* Section 13 */}
              <div id="section-13">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  13. Changes to Our Privacy Policy
                </h3>
                <p className="leading-relaxed text-subtle">
                  Any changes we may make to our privacy policy in the future will be
                  posted on this page and, where appropriate, notified to you by e-mail.
                  Please check back frequently to see any updates or changes to our
                  privacy policy.
                </p>
              </div>

              {/* Section 14 */}
              <div id="section-14">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  14. Complaints
                </h3>
                <p className="leading-relaxed text-subtle">
                  If you have any complaints about how we handle your personal data, we
                  would appreciate the chance to deal with your concerns before you
                  approach the ICO (Information Commissioner's Office) or any other
                  regulatory body. Please contact us in the first instance.
                </p>
              </div>

              {/* Section 15 */}
              <div id="section-15">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  15. Additional Information for EU Residents
                </h3>
                <p className="leading-relaxed text-subtle">
                  If you are unsatisfied with the response you receive, you have the
                  right to lodge a complaint with the data protection authority in your
                  country of residence, place of work, or where the incident took place.
                </p>
              </div>

              {/* Section 16 */}
              <div id="section-16">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  16. California Residents
                </h3>
                <p className="leading-relaxed text-subtle">
                  For residents of California, please note that we do not sell your
                  personal information. If you wish to request the specific pieces of
                  personal information we have about you or to ask us to delete your
                  personal information, please use the contact details provided above.
                </p>
              </div>

              {/* Section 17 */}
              <div id="section-17">
                <h3 className="mb-3 text-lg font-semibold tracking-tight">
                  17. Updates to This Policy
                </h3>
                <p className="leading-relaxed text-subtle">
                  This policy was last updated on 02/03/2024. We reserve the right to
                  update and change this policy from time to time to reflect any changes
                  to our privacy practices or for other operational, legal, or
                  regulatory reasons.
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
