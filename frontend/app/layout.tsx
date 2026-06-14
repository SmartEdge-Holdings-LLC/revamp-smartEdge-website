import type { Metadata } from "next";
import { Inter, Inter_Tight, Playfair_Display } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Providers } from "./providers";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner"

/** Body & UI prose */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/** Display & headings — stands in for Aeonik Pro where a license isn’t available */
const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SmartEdgePicks",
    template: "%s | SmartEdgePicks",
  },
  description:
    "AI-backed sports picks, expert handicapper plays, free daily selections, and VIP membership plans.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
   
      lang="en"
      className={cn(
        "h-full antialiased font-sans",
        inter.variable,
        interTight.variable,
        playfair.variable,
        GeistSans.variable
      )}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col font-sans"
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
