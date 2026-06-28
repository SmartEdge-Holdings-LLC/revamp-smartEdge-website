import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Sign In | SmartEdgePicks",
  description: "Sign in to your SmartEdgePicks account to access premium sports picks and analysis.",
  alternates: {
    canonical: "https://www.smartedgepicks.com/login",
  },
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
