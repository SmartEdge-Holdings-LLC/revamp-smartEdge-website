import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Create Account | SmartEdgePicks",
  description: "Register for a SmartEdgePicks account to access premium sports picks and expert analysis.",
  alternates: {
    canonical: "https://www.smartedgepicks.com/register",
  },
};

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return children;
}
