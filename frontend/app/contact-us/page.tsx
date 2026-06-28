import type { Metadata } from "next";
import { ContactUsContent } from "@/components/landing/ContactUsContent";
import { LandingSubpageLayout } from "@/components/landing/LandingSubpageLayout";

export const metadata: Metadata = {
  title: "Contact Us | SmartEdgePicks Support",
  description: "Get in touch with SmartEdgePicks support for questions about membership plans, billing, account help, and more.",
  alternates: {
    canonical: "https://www.smartedgepicks.com/contact-us",
  },
};

export default function ContactUsPage() {
  return (
    <LandingSubpageLayout>
      <ContactUsContent />
    </LandingSubpageLayout>
  );
}
