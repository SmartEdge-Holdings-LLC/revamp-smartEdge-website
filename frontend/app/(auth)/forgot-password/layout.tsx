import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Reset Password | SmartEdgePicks",
  description: "Reset your SmartEdgePicks password to regain access to your account.",
  alternates: {
    canonical: "https://www.smartedgepicks.com/forgot-password",
  },
};

export default function ForgotPasswordLayout({ children }: { children: ReactNode }) {
  return children;
}
