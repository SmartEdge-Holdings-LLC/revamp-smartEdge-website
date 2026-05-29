import type { Metadata } from "next";
import { ContactUsContent } from "@/components/landing/ContactUsContent";
import { LandingSubpageLayout } from "@/components/landing/LandingSubpageLayout";

export const metadata: Metadata = {
  title: "Contact Us | SmartEdgePicks",
  description: "Contact SmartEdgePicks support for plans, billing, and account help.",
};

export default function ContactUsPage() {
  return (
    <LandingSubpageLayout>
      <ContactUsContent />
    </LandingSubpageLayout>
  );
}
